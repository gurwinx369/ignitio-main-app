import { NextResponse } from "next/server";
import { UserProfile } from "../../../../../models/v1/user.profile.model";
import UserNotification from "../../../../../models/v1/notification.model";
import connectDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { z } from "zod";
import { spamRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";

const SaveTokenSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request) {
  try {
    // 1. Rate Limiting
    const rateLimitError = await enforceRateLimit(spamRateLimiter, getClientIp(request));
    if (rateLimitError) return rateLimitError;

    // 2. Auth
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    // 3. Parse and Validate
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = SaveTokenSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 422 });
    }

    const { token, email } = validation.data;

    // Ensure the token's email matches the requested email
    if (decodedToken.email !== email) {
      return NextResponse.json({ error: "Forbidden: Email mismatch" }, { status: 403 });
    }

    await connectDB();

    const user = await UserProfile.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User does not exist", status: 404 });
    }

    const addNotification = await UserNotification.create({
      userID: user._id,
      fcmToken: token,
    });

    const saveNotificationInUserSchema = await UserProfile.findByIdAndUpdate(
      user._id,
      { notificationID: addNotification._id },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Token saved successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error saving token:", error);
    return NextResponse.json({ error: "Failed to save token", status: 500 });
  }
}
