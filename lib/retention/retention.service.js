import { UserProfile } from '../../models/v2/user.profile.model';
import UserNotification from '../../models/v1/notification.model';
import { RetentionEmailLog } from '../../models/v2/retention.email.log.model';
import { sendRetentionEmail } from './resend.client';
import { getRetentionEmailTemplate } from './retention.emailTemplates';
import { createUnsubscribeToken } from './unsubscribeToken';
import { RETENTION_CAMPAIGNS, RETENTION_THRESHOLDS_HOURS } from './retention.constants';

function maskEmail(email = '') {
  if (!email || typeof email !== 'string') return '[unknown]';
  const [name, domain] = email.split('@');
  if (!name || !domain) return '[invalid-email]';
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

export class RetentionService {
  constructor() {
    this.isEmailsEnabled = process.env.RETENTION_EMAILS_ENABLED === 'true';
    this.dailyLimit = parseInt(process.env.RETENTION_DAILY_LIMIT || '25', 10);
    this.appBaseUrl = process.env.APP_BASE_URL;
  }

  async runRetentionJob() {
    const summary = {
      ok: true,
      dryRun: !this.isEmailsEnabled,
      checkedCampaigns: Object.values(RETENTION_CAMPAIGNS),
      eligibleCount: 0,
      notificationEnabledSkippedCount: 0,
      alreadySentSkippedCount: 0,
      unsubscribedSkippedCount: 0,
      recentlyActiveSkippedCount: 0,
      nullLearningActivitySkippedCount: 0,
      sentCount: 0,
      failedCount: 0,
      dailyLimit: this.dailyLimit,
      candidates: [],
    };

    if (!this.appBaseUrl) {
      throw new Error('Missing APP_BASE_URL environment variable');
    }

    // 1. Find potential candidate users
    // Criteria: onboardingComplete: true, has email
    const users = await UserProfile.find({
      onboardingComplete: true,
      email: { $exists: true, $ne: null },
    }).lean();

    const userIdsString = users.map(u => u._id.toString());
    const userIdsObjectId = users.map(u => u._id);

    // Bulk fetch dependencies to prevent N+1 query choking
    const allNotifications = await UserNotification.find({ 
      userID: { $in: userIdsString } 
    }).lean();
    const notificationsMap = new Map(allNotifications.map(n => [n.userID, n]));

    const allLogs = await RetentionEmailLog.find({
      userId: { $in: userIdsObjectId },
      status: { $in: ['queued', 'sent'] }
    }).lean();
    const logsMap = new Map();
    for (const log of allLogs) {
      const uid = log.userId.toString();
      if (!logsMap.has(uid)) logsMap.set(uid, []);
      logsMap.get(uid).push(log);
    }

    const now = new Date();
    const twentyFiveHoursAgo = new Date(now.getTime() - RETENTION_THRESHOLDS_HOURS.NUDGE_1_INACTIVITY * 60 * 60 * 1000);
    const nudge2ThresholdAgo = new Date(now.getTime() - RETENTION_THRESHOLDS_HOURS.NUDGE_2_INTERVAL * 60 * 60 * 1000);
    const nudge3ThresholdAgo = new Date(now.getTime() - RETENTION_THRESHOLDS_HOURS.NUDGE_3_INTERVAL * 60 * 60 * 1000);

    for (const user of users) {
      if (summary.sentCount >= this.dailyLimit) {
        break;
      }

      // Exclude unsubscribed users
      if (user.retentionUnsubscribed === true) {
        summary.unsubscribedSkippedCount++;
        continue;
      }

      // 2. Exclude users with null last_learning_active_on
      if (!user.last_learning_active_on) {
        summary.nullLearningActivitySkippedCount++;
        continue;
      }

      const streakStartedAt = user.last_learning_active_on;

      // 3. Exclude users with recent last_learning_active_on
      if (streakStartedAt > twentyFiveHoursAgo) {
        summary.recentlyActiveSkippedCount++;
        continue;
      }

      // 4. Exclude users with active web notifications enabled
      const notificationRecord = notificationsMap.get(user._id.toString());
      if (notificationRecord && notificationRecord.notificationsEnabled && notificationRecord.fcmToken) {
        summary.notificationEnabledSkippedCount++;
        continue;
      }

      // Fetch logs for this user's current streak from our bulk loaded map
      const userLogs = logsMap.get(user._id.toString()) || [];
      const streakLogs = userLogs
        .filter(log => new Date(log.streakStartedAt).getTime() === streakStartedAt.getTime())
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      const sentCampaigns = streakLogs.map(log => log.campaignKey);
      const nudge1Log = streakLogs.find(log => log.campaignKey === RETENTION_CAMPAIGNS.NUDGE_1);
      const nudge2Log = streakLogs.find(log => log.campaignKey === RETENTION_CAMPAIGNS.NUDGE_2);

      let selectedCampaign = null;

      // Evaluate Sequence (Nudge 3 -> Nudge 2 -> Nudge 1)
      if (sentCampaigns.includes(RETENTION_CAMPAIGNS.NUDGE_3)) {
        summary.alreadySentSkippedCount++;
        continue; // Sequence complete for this streak
      } else if (sentCampaigns.includes(RETENTION_CAMPAIGNS.NUDGE_2)) {
        if (nudge2Log && nudge2Log.sentAt <= nudge3ThresholdAgo) {
          selectedCampaign = RETENTION_CAMPAIGNS.NUDGE_3;
        } else {
          // Waiting for interval
          continue;
        }
      } else if (sentCampaigns.includes(RETENTION_CAMPAIGNS.NUDGE_1)) {
        if (nudge1Log && nudge1Log.sentAt <= nudge2ThresholdAgo) {
          selectedCampaign = RETENTION_CAMPAIGNS.NUDGE_2;
        } else {
          // Waiting for interval
          continue;
        }
      } else {
        selectedCampaign = RETENTION_CAMPAIGNS.NUDGE_1;
      }

      if (!selectedCampaign) {
        continue; // Should not reach here based on logic above, but safe fallback
      }

      summary.eligibleCount++;

      // Safely mask email for dry_run output
      const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => p1 + '*'.repeat(p2.length));

      if (!this.isEmailsEnabled) {
        // DRY RUN
        summary.candidates.push({
          userId: user._id.toString(),
          email: maskedEmail,
          campaignKey: selectedCampaign,
          streakStartedAt: streakStartedAt.toISOString(),
          lastLearningActiveOn: user.last_learning_active_on.toISOString(),
          reason: 'dry_run_eligible',
        });
        continue;
      }

      // REAL SEND MODE
      let logRecord = null;
      try {
        // Create queued log
        logRecord = await RetentionEmailLog.create({
          userId: user._id,
          firebaseUID: user.firebaseUID,
          email: user.email,
          campaignKey: selectedCampaign,
          streakStartedAt: streakStartedAt,
          status: 'queued',
          reason: 'Preparing to send',
        });
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key - another process is sending this nudge
          summary.alreadySentSkippedCount++;
          continue;
        }
        // Other DB error
        summary.failedCount++;
        continue;
      }

      try {
        const unsubscribeToken = createUnsubscribeToken(user);
        const unsubscribeLink = `${this.appBaseUrl}/api/v2/retention/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

        const { subject, html } = getRetentionEmailTemplate(selectedCampaign, {
          firstName: user.firstName || user.profile?.displayName,
          appBaseUrl: this.appBaseUrl,
          unsubscribeLink,
          activeRoadmapSlug: user.activeRoadmapSlug || user.roadmap_name || "python-beginner",
        });

        const providerMessageId = await sendRetentionEmail({
          to: user.email,
          subject,
          html,
        });

        // Update log on success
        logRecord.status = 'sent';
        logRecord.providerMessageId = providerMessageId;
        logRecord.sentAt = new Date();
        logRecord.reason = 'Sent successfully';
        await logRecord.save();

        summary.sentCount++;
      } catch (err) {
        console.error(`Failed to send retention email to ${maskEmail(user.email)}:`, {
          name: err?.name,
          message: err?.message,
        });
        
        // Update log on failure
        logRecord.status = 'failed';
        logRecord.reason = err.message || 'Unknown error';
        await logRecord.save();

        summary.failedCount++;
      }
    }

    return summary;
  }
}
