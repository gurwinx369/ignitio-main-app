import { NextResponse } from "next/server";
import admin from "firebase-admin";
import connectDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import UserNotification from "@/models/v1/notification.model";
import { StreakReminderLog } from "@/models/v2/streak.reminder.log.model";
import {
  getLocalDateString,
  getStreakSummary,
  isEarnBackWindowActive,
} from "@/lib/users/streak.service";
import { sendRetentionEmail } from "@/lib/retention/resend.client";
import { createUnsubscribeToken } from "@/lib/retention/unsubscribeToken";

export const maxDuration = 300;

if (!admin.apps.length) {
  try {
    const serviceAccount = require("@/features/notifications/credentials/serviceAccountKey.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";
    const rawForce = searchParams.get("force") === "true";
    const targetEmail = searchParams.get("email");
    const isDev = process.env.NODE_ENV !== "production";

    // Security guardrail: In production, force is strictly restricted to targeted single-email tests
    const force = rawForce && (isDev || Boolean(targetEmail));

    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const now = new Date();

    const users = await UserProfile.find({
      onboardingComplete: true,
      retentionUnsubscribed: { $ne: true },
      $or: [
        { "streak.currentCount": { $gt: 0 } },
        { "streak.longestCount": { $gt: 0 } },
        { "streak.earnBack.active": true },
        { "streak.freezeBank": { $gt: 0 } },
        { "streak.lastCompletedDateLocal": { $exists: true, $ne: null } },
      ],
    }).lean();

    const userIdsString = users.map(u => u._id.toString());
    const allNotifications = await UserNotification.find({
      userID: { $in: userIdsString }
    }).lean();
    const notificationsMap = new Map(allNotifications.map(n => [n.userID, n]));


    const summaryData = {
      ok: true,
      dryRun,
      checkedUsers: users.length,
      sent: 0,
      wouldSend: 0,
      skipped: 0,
      failed: 0,
      reminderTypes: {
        daily_pending: 0,
        daily_last_chance: 0,
        earn_back: 0,
      },
      channels: {
        push: { sent: 0, wouldSend: 0, skipped: 0, failed: 0 },
        email: { sent: 0, wouldSend: 0, skipped: 0, failed: 0 },
      },
    };

    for (const user of users) {
      if (targetEmail && user.email !== targetEmail) {
        continue;
      }

      const timezone =
        user.streak?.timezone ||
        user.schedulePreference?.timezone ||
        "Asia/Kolkata";

      const localDateString = getLocalDateString(now, timezone);

      let localHour;
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "numeric",
          hourCycle: "h23",
        });
        const parts = formatter.formatToParts(now);
        localHour = parseInt(parts.find((p) => p.type === "hour").value, 10);
      } catch (err) {
        localHour = now.getUTCHours();
      }

      const summary = getStreakSummary(user.streak, localDateString, now);

      let reminderType = null;
      let title = "";
      let heading = "";
      let body = "";
      let ctaText = "Continue learning";
      let ctaUrl = "https://app.ignitio.cloud/home";

      const hasActiveEarnBackWindow =
        isEarnBackWindowActive(
          summary.earnBack,
          now,
        );

      const hasPersistedEarnBackState =
        summary.status === "at_risk" ||
        summary.earnBack?.active;

      if (hasActiveEarnBackWindow) {
        reminderType = "earn_back";
        title =
          "Your Ignitio Earn-Back window is active";
        heading =
          "Earn-Back window active";
        body =
          "Complete 2 lessons before the deadline to restore your streak.";
        ctaText =
          "Restore your streak";
      } else if (
        !hasPersistedEarnBackState &&
        summary.status !== "completed_today" &&
        summary.status !== "reset" &&
        summary.status !== "inactive"
      ) {
        if (force || localHour === 19) {
          reminderType = "daily_pending";
          title = "Keep your Ignitio streak alive";
          heading = "Keep your streak alive";
          body = "Complete today’s lesson before the day ends and keep your learning momentum going.";
        } else if (localHour === 22) {
          reminderType = "daily_last_chance";
          title = "Last chance for today’s Ignitio streak";
          heading = "Last chance for today’s streak";
          body = "Finish one lesson tonight to protect your Ignitio streak.";
        }
      }

      // Allow force / targeted test to trigger regardless of status or localHour
      if (force && (!reminderType || (targetEmail && user.email === targetEmail))) {
        reminderType = "daily_pending";
        title = "Keep your Ignitio streak alive";
        heading = "Keep your streak alive";
        body = "Complete today’s lesson before the day ends and keep your learning momentum going.";
      }

      if (!reminderType) {
        summaryData.skipped++;
        continue;
      }

      const notificationPref = notificationsMap.get(user._id.toString());

      let channel = "email";
      let fcmToken = null;

      if (notificationPref?.fcmToken && notificationPref.notificationsEnabled !== false) {
        channel = "push";
        fcmToken = notificationPref.fcmToken;
      }

      if (channel === "email" && !user.email) {
        summaryData.skipped++;
        summaryData.channels.email.skipped++;
        continue;
      }

      // Defensively check retentionUnsubscribed before sending email
      if (channel === "email" && user.retentionUnsubscribed === true) {
        summaryData.skipped++;
        summaryData.channels.email.skipped++;
        continue;
      }

      if (dryRun) {
        summaryData.wouldSend++;
        summaryData.reminderTypes[reminderType]++;
        summaryData.channels[channel].wouldSend++;
        continue;
      }

      if (force) {
        await StreakReminderLog.deleteMany({
          userId: user._id,
          localDateString,
          reminderType,
        });
      }

      let logDoc;
      try {
        logDoc = await StreakReminderLog.create({
          userId: user._id,
          email: user.email,
          localDateString,
          timezone,
          reminderType,
          channel,
          status: "pending",
          reason: channel === "push" ? "Claimed for push send" : "Claimed for email send",
          fcmTokenLast4: fcmToken ? fcmToken.slice(-4) : undefined,
          sentAt: new Date(),
        });
      } catch (err) {
        if (err.code === 11000) {
          summaryData.skipped++;
          summaryData.channels[channel].skipped++;
          continue;
        }
        summaryData.failed++;
        summaryData.channels[channel].failed++;
        continue;
      }

      try {
        let providerMessageId;

        if (channel === "push") {
          const message = {
            token: fcmToken,
            notification: {
              title: heading,
              body,
            },
            data: {
              type: "streak_reminder",
              reminderType,
              url: "/home",
            },
            webpush: {
              fcmOptions: { link: "/home" },
              notification: {
                icon: "/kibo/kibo.svg",
                badge: "/kibo/kibo.svg",
                requireInteraction: false,
              },
            },
          };
          providerMessageId = await admin.messaging().send(message);
        } else {
          const appBaseUrl = process.env.APP_BASE_URL || "https://app.ignitio.cloud";
          let unsubscribeLink = `${appBaseUrl}/api/v2/retention/unsubscribe`;
          try {
            const unsubscribeToken = createUnsubscribeToken(user);
            unsubscribeLink = `${appBaseUrl}/api/v2/retention/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
          } catch (e) {
            // Safe fallback if token secret isn't available
          }

          const streakBadgeLabel = summary.currentCount > 0
            ? `${summary.currentCount}-DAY STREAK AT RISK`
            : 'IGNITIO STREAK REMINDER';

          const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0c101d; color: #f1f5f9; border-radius: 16px; padding: 32px 24px; border: 1px solid #1e293b;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${appBaseUrl}/kibo/kibo.svg" alt="Kibo AI" width="56" height="56" style="display: inline-block;" />
              </div>
              
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 14px; background: rgba(245,158,11,0.15); color: #f59e0b; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;">
                  🔥 ${streakBadgeLabel}
                </span>
              </div>

              <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 12px;">
                ${heading}
              </h2>

              <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; text-align: center; margin: 0 0 28px;">
                ${body}
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 8px 20px rgba(234,88,12,0.3);">
                  ${ctaText} →
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0 20px;" />

              <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; margin: 0;">
                Sent to ${user.email} because you have active learning reminders on Ignitio.<br />
                <a href="${unsubscribeLink}" style="color: #94a3b8; text-decoration: underline;">
                  Unsubscribe from streak & learning reminder emails
                </a>
              </p>
            </div>
          `;
          providerMessageId = await sendRetentionEmail({
            to: user.email,
            subject: title,
            html,
          });
        }

        await StreakReminderLog.updateOne(
          { _id: logDoc._id },
          {
            $set: {
              status: "sent",
              reason: "Success",
              providerMessageId,
              sentAt: new Date(),
            },
          }
        );

        summaryData.sent++;
        summaryData.reminderTypes[reminderType]++;
        summaryData.channels[channel].sent++;
      } catch (err) {
        let reason = err.message || "Unknown error";
        const isDeadToken =
          err.code === "messaging/registration-token-not-registered" ||
          err.code === "messaging/invalid-registration-token" ||
          reason.includes("Requested entity was not found");

        if (isDeadToken && channel === "push") {
          // Self-healing: Disable push for this user so next run falls back to email
          await UserNotification.updateOne(
            { userID: user._id.toString() },
            { $set: { notificationsEnabled: false } }
          );
        }

        if (reason.length > 300) reason = reason.substring(0, 297) + "...";

        await StreakReminderLog.updateOne(
          { _id: logDoc._id },
          {
            $set: {
              status: "failed",
              reason,
              sentAt: new Date(),
            },
          }
        );
        summaryData.failed++;
        summaryData.channels[channel].failed++;
      }
    }

    return NextResponse.json(summaryData, { status: 200 });
  } catch (error) {
    console.error("[Streak Cron] Failed:", error);
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { error: "Failed to run streak cron", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to run streak cron" },
      { status: 500 }
    );
  }
}
