import { NextResponse } from "next/server";
import connectDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { Feedback } from "@/models/v2/feedback.model";
import { sendRetentionEmail } from "@/lib/retention/resend.client";
import { verifyFirebaseToken } from "@/lib/auth";
import { z } from "zod";
import { spamRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const FeedbackSchema = z.object({
  message: z.string().min(5).max(1000).trim(),
  page: z.string().optional(),
});

export async function POST(request) {
  try {
    // 1. Rate Limiting
    const rateLimitError = await enforceRateLimit(spamRateLimiter, getClientIp(request));
    if (rateLimitError) return rateLimitError;

    // 2. Auth (using standard verifyFirebaseToken)
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

    const firebaseUID = decodedToken.uid;

    // 3. Parsing and Zod Validation
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = FeedbackSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 422 });
    }

    const { message, page } = validation.data;

    await connectDB();
    const userProfile = await UserProfile.findOne({ firebaseUID }).lean();

    const email = userProfile?.email || decodedToken.email;
    const role = userProfile?.role || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const feedbackDoc = await Feedback.create({
      userId: userProfile?._id,
      firebaseUID,
      email,
      role,
      message,
      page,
      userAgent,
      status: "new",
    });

    const toEmail = process.env.FEEDBACK_TO_EMAIL || "gurwinder.ignitio@gmail.com";
    const subject = `Ignitio Feedback from ${escapeHtml(email || "User")}`;
    const html = `
      <h3>New Feedback Received</h3>
      <p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>
      <p><strong>FirebaseUID:</strong> ${escapeHtml(firebaseUID)}</p>
      <p><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p><strong>Page:</strong> ${escapeHtml(page || "Unknown")}</p>
      <p><strong>User Agent:</strong> ${escapeHtml(userAgent)}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    `;

    try {
      await sendRetentionEmail({ to: toEmail, subject, html });
      await Feedback.updateOne({ _id: feedbackDoc._id }, { status: "emailed" });
    } catch (emailError) {
      console.error("Failed to send feedback email:", emailError);
      await Feedback.updateOne({ _id: feedbackDoc._id }, { status: "email_failed" });
    }

    return NextResponse.json({ ok: true, message: "Feedback submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[Feedback API] Failed:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
