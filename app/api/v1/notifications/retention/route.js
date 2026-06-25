import { NextResponse } from "next/server";
import admin from "firebase-admin";
import connectDB from "@/dbConfig/dbConnection";
import UserNotification from "@/models/v1/notification.model";

if (!admin.apps.length) {
  try {
    const serviceAccount = require("@/features/notifications/credentials/serviceAccountKey.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("[Retention] Firebase admin init error:", error);
  }
}

const getAppUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://ignitio-main-app-git-c6ca39-gurwinder-singhs-projects-01bbb3e5.vercel.app";
  }
  return process.env.NEXT_PUBLIC_DEV_URL || "http://localhost:5000";
};

// Passive-aggressive retention messages — picked randomly per send
const retentionMessages = [
  {
    title: "Your course is collecting dust 🧹",
    body: "Prompt Engineering doesn't learn itself. You started strong. Don't let 'tomorrow' steal your streak.",
  },
  {
    title: "We noticed you ghosted us 👻",
    body: "That's fine. The course will just sit here, judging you silently. One lesson. That's all we ask.",
  },
  {
    title: "Your future self called. He's disappointed. 📞",
    body: "He said you were supposed to finish Prompt Engineering by now. Still time to make it right.",
  },
  {
    title: "Hot take: you actually liked learning here 🔥",
    body: "You were making real progress. Don't throw it away for another doom-scroll session. Pick up where you left off.",
  },
  {
    title: "The AI isn't going to prompt itself 🤖",
    body: "Every engineer who learns this right now is getting ahead. You had a head start. Don't waste it.",
  },
  {
    title: "Reminder: you enrolled for a reason 💡",
    body: "Remember why you started? That reason hasn't changed. Your course is waiting — no judgment, just progress.",
  },
  {
    title: "Day {N} of waiting for you to come back ⏳",
    body: "We're not mad, we're just... concerned. Your learning momentum was real. One click and it's back.",
  },
];

const INACTIVITY_THRESHOLD_MS = 24 * 60 * 60 * 1000; //24 hours
const MIN_GAP_BETWEEN_SENDS_MS = 24 * 60 * 60 * 1000; //24 hours
const MAX_RETENTION_SENDS = 2;

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    await connectDB();

    const now = new Date();
    const inactivityCutoff = new Date(now - INACTIVITY_THRESHOLD_MS);
    const lastSentCutoff = new Date(now - MIN_GAP_BETWEEN_SENDS_MS);
    const appUrl = getAppUrl();

    const eligibleUsers = await UserNotification.find({
      notificationsEnabled: true,
      notificationsSent: { $lt: MAX_RETENTION_SENDS },
      lastActive: { $lt: inactivityCutoff },
      $or: [
        { lastNotificationSent: null },
        { lastNotificationSent: { $lt: lastSentCutoff } },
      ],
    }).lean();

    for (const notifDoc of eligibleUsers) {
      processed++;

      try {
        const msgIndex = Math.floor(Math.random() * retentionMessages.length);
        const selected = retentionMessages[msgIndex];

        const dayNumber = notifDoc.notificationsSent + 1;
        const title = selected.title.replace("{N}", String(dayNumber));
        const body = selected.body;

        const message = {
          token: notifDoc.fcmToken,
          data: {
            title,
            body,
            icon: `${appUrl}/ignitio-logo.png`,
            badge: `${appUrl}/ignitio-logo.png`,
            type: "retention",
            url: `${appUrl}/home/`,
            tag: `ignitio-retention-${dayNumber}`,
            requireInteraction: "true",
            timestamp: now.toISOString(),
          },
          webpush: {
            headers: { Urgency: "high" },
            fcmOptions: { link: `${appUrl}/home/` },
          },
        };

        const fcmResponse = await admin.messaging().send(message);

        await UserNotification.findByIdAndUpdate(notifDoc._id, {
          $push: {
            notificationHistory: {
              id: fcmResponse,
              sentAt: now,
              messageIndex: msgIndex,
            },
          },
          $inc: { notificationsSent: 1 },
          lastNotificationSent: now,
        });

        sent++;
      } catch (sendError) {
        const errorCode = sendError?.errorInfo?.code || "";

        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        ) {
          await UserNotification.findByIdAndDelete(notifDoc._id);
        } else {
          console.error(
            `[Retention] Failed for userID ${notifDoc.userID}:`,
            errorCode || sendError.message,
          );
          errors++;
        }

        skipped++;
      }
    }

    return NextResponse.json({ processed, sent, skipped, errors });
  } catch (error) {
    console.error("[Retention] Cron job failed:", error.message);
    return NextResponse.json(
      { error: "Retention job failed", processed, sent, skipped, errors },
      { status: 500 },
    );
  }
}
