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
        if (localHour === 19) {
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

      if (!reminderType) {
        summaryData.skipped++;
        continue;
      }

      const notificationPref = await UserNotification.findOne({
        userID: user._id.toString(),
      }).lean();

      let channel = "email";
      let fcmToken = null;

      if (notificationPref?.fcmToken) {
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
                icon: "/logo.png",
                badge: "/badge.png",
                requireInteraction: false,
              },
            },
          };
          providerMessageId = await admin.messaging().send(message);
        } else {
          const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #0f172a;">${heading}</h2>
              <p style="font-size: 16px; line-height: 1.5;">${body}</p>
              <a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px;">${ctaText}</a>
              <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
              <p style="font-size: 12px; color: #64748b;">
                You are receiving this because you use Ignitio learning reminders.<br/>
                <!-- TODO: Add notification preference center unsubscribe link here once available -->
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
