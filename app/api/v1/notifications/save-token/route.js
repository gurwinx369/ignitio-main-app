// app/api/notifications/save-token/route.js
import {NextResponse} from "next/server";
import {UserProfile} from "@/models/user.profile.model";

export async function POST(request) {
    try {
        const {token, email} = await request.json();

        if (!token) {
            return NextResponse.json(
                {
                    error: "Token is required",
                    status: 400
                },
            );
        }

        console.log("FCM Token saved:", token);
        const user = await UserProfile.findOne({email})
        if (!user) {
            NextResponse.json({
                    error: "User does not exists",
                }
            )
        }
        const addNotification = await Notification.create({
            userID: user._id,
            fcmToken: token,
        })
        const saveToDb = await addNotification.save();
        if (!saveToDb) {
            NextResponse.json({
                error: "Failed to create notification",
            })
        }
        const saveNotificationInUserSchema = await UserProfile.update({
            notificationID: saveToDb._id,
        })
        return NextResponse.json(
            {
                success: true,
                message: "Token saved successfully",
                data: {
                    notificationInUserSchema: saveNotificationInUserSchema,
                    notificationSaved: saveToDb,
                },
                status: 200
            },
        );
    } catch (error) {
        console.error("Error saving token:", error);
        return NextResponse.json(
            {
                error: "Failed to save token",
                status: 500
            },
        );
    }
}
