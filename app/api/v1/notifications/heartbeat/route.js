import { NextResponse } from "next/server";
import connectDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v1/user.profile.model";
import UserNotification from "@/models/v1/notification.model";

const INACTIVITY_THRESHOLD_MS = 24 * 60 * 60 * 1000; //24 hours

export async function POST(request) {
  try {
    await connectDB();

    const { firebaseUID } = await request.json();

    if (!firebaseUID) {
      return NextResponse.json(
        { error: "firebaseUID is required" },
        { status: 400 },
      );
    }

    const userProfile = await UserProfile.findOne({ firebaseUID });
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifDoc = await UserNotification.findOne({
      userID: userProfile._id.toString(),
    });
    if (!notifDoc) {
      return NextResponse.json({
        success: true,
        message: "No notification record",
      });
    }

    const now = new Date();
    const wasInactive =
      notifDoc.lastActive &&
      now - new Date(notifDoc.lastActive) >= INACTIVITY_THRESHOLD_MS;

    const update = { lastActive: now };

    if (wasInactive && notifDoc.notificationsSent > 0) {
      update.notificationsSent = 0;
      update.notificationHistory = [];
    }

    await UserNotification.findByIdAndUpdate(notifDoc._id, update);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 });
  }
}
