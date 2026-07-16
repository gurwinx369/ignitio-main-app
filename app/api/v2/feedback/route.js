import { NextResponse } from "next/server";
import admin from "firebase-admin";
import connectDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { Feedback } from "@/models/v2/feedback.model";
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

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const firebaseUID = decodedToken.uid;

    const body = await request.json();
    const { message, page } = body;

    if (!message || typeof message !== "string" || message.trim().length < 5 || message.length > 1000) {
      return NextResponse.json(
        { error: "Message must be between 5 and 1000 characters." },
        { status: 400 }
      );
    }

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
      message: message.trim(),
      page,
      userAgent,
      status: "new",
    });

    const toEmail = process.env.FEEDBACK_TO_EMAIL || "gurwinder.ignitio@gmail.com";
    const subject = `Ignitio Feedback from ${email || "User"}`;
    const html = `
      <h3>New Feedback Received</h3>
      <p><strong>Email:</strong> ${email || "Not provided"}</p>
      <p><strong>FirebaseUID:</strong> ${firebaseUID}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Page:</strong> ${page || "Unknown"}</p>
      <p><strong>User Agent:</strong> ${userAgent}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message.trim()}</p>
    `;

    try {
      await sendRetentionEmail({ to: toEmail, subject, html });
      await Feedback.updateOne({ _id: feedbackDoc._id }, { status: "emailed" });
    } catch (emailError) {
      console.error("Failed to send feedback email:", emailError);
      await Feedback.updateOne({ _id: feedbackDoc._id }, { status: "email_failed" });
      // We still return 200 to the client because the feedback was saved to the DB
    }

    return NextResponse.json({ ok: true, message: "Feedback submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[Feedback API] Failed:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
