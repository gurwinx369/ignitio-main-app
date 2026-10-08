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

// Zod schemas
const SendBodySchema = z.object({
  token: z.string().min(1),
  title: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.any()).optional(),
  imageUrl: z.string().url().optional(),
});

const MulticastBodySchema = z.object({
  tokens: z.array(z.string().min(1)).min(1),
  title: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.any()).optional(),
  imageUrl: z.string().url().optional(),
});

function getAdminUids() {
  const raw = process.env.ADMIN_FIREBASE_UIDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
  );
}

export async function POST(request) {
  try {
    // 1. Rate Limiting
    const rateLimitError = await enforceRateLimit(spamRateLimiter, getClientIp(request));
    if (rateLimitError) return rateLimitError;

    // 2. Auth & Admin Check
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    const adminUids = getAdminUids();
    if (adminUids.size > 0 && !adminUids.has(decodedToken.uid)) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 3. Body Parsing & Validation
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = SendBodySchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 422 });
    }

    const { token, title, body, data, imageUrl } = validation.data;

    await connectDB();

    // Construct the notification message
    const message = {
      token,
      notification: {
        title: title || "New Notification",
        body: body || "You have a new message",
        ...(imageUrl && { imageUrl }),
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.url || "/",
        },
        notification: {
          icon: "/logo.png",
          badge: "/badge.png",
          requireInteraction: false,
        },
      },
    };

    const response = await admin.messaging().send(message);
    return NextResponse.json({ success: true, messageId: response, status: 200 });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification", status: 500 });
  }
}

// Send to multiple tokens
export async function PUT(request) {
  try {
    // 1. Rate Limiting
    const rateLimitError = await enforceRateLimit(spamRateLimiter, getClientIp(request));
    if (rateLimitError) return rateLimitError;

    // 2. Auth & Admin Check
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    const adminUids = getAdminUids();
    if (adminUids.size > 0 && !adminUids.has(decodedToken.uid)) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 3. Validation
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = MulticastBodySchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 422 });
    }

    const { tokens, title, body, data, imageUrl } = validation.data;

    await connectDB();

    const message = {
      notification: {
        title: title || "New Notification",
        body: body || "You have a new message",
        ...(imageUrl && { imageUrl }),
      },
      data: data || {},
      webpush: {
        fcmOptions: { link: data?.url || "/" },
        notification: { icon: "/logo.png", badge: "/badge.png" },
      },
    };

    const response = await admin.messaging().sendEachForMulticast({ tokens, ...message });

    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      status: 200,
    });
  } catch (error) {
    console.error("Error sending batch notification:", error);
    return NextResponse.json({ error: "Failed to send batch notification", status: 500 });
  }
}
