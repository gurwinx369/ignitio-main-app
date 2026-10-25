import { NextResponse } from "next/server";
import { UserProfile } from "@/models/v2/user.profile.model";
import UserNotification from "@/models/v1/notification.model";
import connectDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { z } from "zod";
import { spamRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { captureServerEvent } from "@/lib/analytics/serverAnalytics";

const SaveTokenSchema = z.object({
  token: z.string().trim().min(20, "Invalid FCM token format").max(500, "Token exceeds maximum length"),
  email: z.string().email().optional(),
});

export async function POST(request) {
  try {
    // 1. Rate Limiting (Security: Brute-force & spam mitigation)
    const rateLimitError = await enforceRateLimit(spamRateLimiter, getClientIp(request));
    if (rateLimitError) return rateLimitError;

    // 2. Authentication Boundary (Security: Cryptographic ID token verification)
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: authStatus || 401 });
    }

    // 3. Request Parsing & Strict Validation
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validation = SaveTokenSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 422 }
      );
    }

    const { token } = validation.data;
    await connectDB();

    // 4. Identity Resolution: Primary lookup by immutable firebaseUID (Prevents IDOR)
    let user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });

    // Defensive fallback: Case-insensitive email match from verified auth token
    if (!user && decodedToken.email) {
      user = await UserProfile.findOne({ email: decodedToken.email.toLowerCase().trim() });
    }

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // 5. Atomic Upsert: Guarantee single active record per user
    const notificationDoc = await UserNotification.findOneAndUpdate(
      { userID: user._id.toString() },
      {
        $set: {
          fcmToken: token,
          notificationsEnabled: true,
          lastActive: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Authoritative server-side event: notification activated
    await captureServerEvent(decodedToken.uid, "notification_activated", {
      source: "fcm_token_persisted",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Notification token synchronized successfully",
        id: notificationDoc._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SaveNotificationToken] Critical failure:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to persist notification token" },
      { status: 500 }
    );
  }
}
