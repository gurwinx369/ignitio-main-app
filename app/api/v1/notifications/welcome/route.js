import { NextResponse } from "next/server";
import admin from "firebase-admin";
import connectDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { z } from "zod";
import { spamRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";

// Initialize Firebase Admin SDK (server-side only)
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

const getAppUrl = () => {
  const raw =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.NEXT_PUBLIC_DEV_URL || "http://localhost:5000";
  return raw ? raw.replace(/\/+$/, "") : null;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const welcomeMessages = [
  {
    title: "Oh, so you DO care about learning?",
    body: "Cool, cool. Most people just ignore us. But you? You're different. Come back tomorrow and prove it.",
  },
  {
    title: "Well, well, well... Look who decided to show up",
    body: "Congrats on enabling notifications. Now the real question: will you actually use them? Your XP won't earn itself.",
  },
  {
    title: "Finally! We've been waiting...",
    body: "Notifications ON. Commitment level? TBD. Let's see if you're still here next week or if this is just another abandoned goal.",
  },
];

const WelcomeSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request) {
  try {
    // 1. Rate Limiting
    const rateLimitError = await enforceRateLimit(spamRateLimiter, getClientIp(request));
    if (rateLimitError) return rateLimitError;

    // 2. Auth Check
    const { error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    // 3. Parse and Validate
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = WelcomeSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 422 });
    }

    const { token } = validation.data;
    const appUrl = getAppUrl();

    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not set");
      return NextResponse.json({ error: "Server misconfiguration", status: 500 });
    }

    await connectDB();

    const selectedMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const imageUrl = `${appUrl}/kibo/kibo.svg`;

    if (!isValidUrl(imageUrl)) {
      return NextResponse.json({ error: "Server misconfiguration: invalid image URL", status: 500 });
    }

    const message = {
      token,
      notification: {
        title: selectedMessage.title,
        body: selectedMessage.body,
        imageUrl,
      },
      data: {
        type: "welcome",
        url: "/home/",
        isFirstNotification: "true",
        timestamp: new Date().toISOString(),
      },
      webpush: {
        fcmOptions: { link: `${appUrl}/home/` },
        notification: {
          icon: imageUrl,
          badge: imageUrl,
          requireInteraction: true,
          tag: "welcome-notification",
          renotify: false,
          vibrate: [200, 100, 200],
        },
      },
    };

    const response = await admin.messaging().send(message);

    return NextResponse.json({
      success: true,
      messageId: response,
      welcomeMessage: selectedMessage,
      status: 200,
    });
  } catch (error) {
    console.error("Error sending welcome notification:", error);
    return NextResponse.json({ error: "Failed to send welcome notification", status: 500 });
  }
}
