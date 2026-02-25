// app/api/notifications/save-token/route.js
import { NextResponse } from "next/server";
import { UserProfile } from "@/models/user.profile.model";
import { Notification } from "@/models/notification.model"; // ✅ was missing
import connectDB from "@/dbConfig/connectDB";                    // ✅ was missing

export async function POST(request) {
    try {
        await connectDB();

        const { token, email } = await request.json();

        if (!token) {
            return NextResponse.json({
                error: "Token is required",
                status: 400
            });
        }

        const user = await UserProfile.findOne({ email });
        if (!user) {
            return NextResponse.json({
                error: "User does not exist",
                status: 404
            });
        }

        const addNotification = await Notification.create({
            userID: user._id,
            fcmToken: token,
        });

        //FIX 4: Was updating ALL users — added { _id: user._id } filter
        const saveNotificationInUserSchema = await UserProfile.findByIdAndUpdate(
            user._id,
            { notificationID: addNotification._id },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Token saved successfully",
            data: {
                notificationInUserSchema: saveNotificationInUserSchema,
                notificationSaved: addNotification,
            },
            status: 200
        });

    } catch (error) {
        console.error("Error saving token:", error);
        return NextResponse.json({
            error: "Failed to save token",
            details: error.message,
            status: 500
        });
    }
}
