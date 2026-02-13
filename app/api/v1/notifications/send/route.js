import {NextResponse} from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK (server-side only)
if (!admin.apps.length) {
    try {
        const serviceAccount = require('@/features/notifications/credentials/serviceAccountKey.json');
        await admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase admin initialization error:", error);
    }
}

export async function POST(request) {
    try {
        const {token, title, body, data, imageUrl} = await request.json();

        if (!token) {
            return NextResponse.json(
                {
                    error: "Token is required",
                    status: 400
                }
            );
        }

        // Construct the notification message
        const message = {
            token,
            notification: {
                title: title || "New Notification",
                body: body || "You have a new message",
                ...(imageUrl && {imageUrl}),
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

        // Send the notification
        const response = await admin.messaging().send(message);

        console.log("Notification sent successfully:", response);

        return NextResponse.json(
            {
                success: true,
                messageId: response,
                message: "Notification sent successfully",
                status: 200
            }
        );
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json(
            {
                error: "Failed to send notification",
                details: error.message,
                status: 500
            }
        );
    }
}

// Send to multiple tokens
export async function PUT(request) {
    try {
        const {tokens, title, body, data, imageUrl} = await request.json();

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return NextResponse.json(
                {
                    error: "Tokens array is required",
                    status: 400
                }
            );
        }

        // Construct the message
        const message = {
            notification: {
                title: title || "New Notification",
                body: body || "You have a new message",
                ...(imageUrl && {imageUrl}),
            },
            data: data || {},
            webpush: {
                fcmOptions: {
                    link: data?.url || "/",
                },
                notification: {
                    icon: "/logo.png",
                    badge: "/badge.png",
                },
            },
        };

        // Send to multiple tokens
        const response = await admin.messaging().sendEachForMulticast({
            tokens,
            ...message,
        });

        console.log("Batch notification sent:", {
            successCount: response.successCount,
            failureCount: response.failureCount,
        });

        return NextResponse.json(
            {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses,
                status: 200
            }
        );
    } catch (error) {
        console.error("Error sending batch notification:", error);
        return NextResponse.json(
            {
                error: "Failed to send batch notification",
                details: error.message,
                status: 500
            }
        );
    }
}
