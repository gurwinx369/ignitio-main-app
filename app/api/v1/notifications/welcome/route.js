// app/api/notifications/welcome/route.js
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

// Passive-aggressive welcome messages (rotated randomly)
const welcomeMessages = [
    {
        title: "Oh, so you DO care about learning? 🎮",
        body: "Cool, cool. Most people just ignore us. But you? You're different. Come back tomorrow and prove it.",
    },
    {
        title: "Well, well, well... Look who decided to show up 👀",
        body: "Congrats on enabling notifications. Now the real question: will you actually use them? Your XP won't earn itself.",
    },
    {
        title: "Finally! We've been waiting... ⏰",
        body: "Notifications ON. Commitment level? TBD. Let's see if you're still here next week or if this is just another abandoned goal.",
    },
    {
        title: "Achievement Unlocked: Basic Responsibility 🏆",
        body: "You enabled notifications. Groundbreaking. Now let's see if you can maintain a streak longer than your last gym membership.",
    },
    {
        title: "Notification Squad: Population +1 🚀",
        body: "Welcome! You'll get reminders to learn. Whether you actually open them is between you and your future self's regrets.",
    },
    {
        title: "Breaking News: Someone Wants to Learn! 📰",
        body: "We're shocked too. Daily challenges await. Will you show up or ghost us like that Udemy course you bought?",
    },
    {
        title: "Level 0 → Level 1: Notification Warrior 🗡️",
        body: "First step complete. 999 more to go. Your coding skills won't level up by themselves. See you tomorrow... or not.",
    },
];

export async function POST(request) {
    try {
        const {token} = await request.json();

        if (!token) {
            return NextResponse.json(
                {
                    error: "Token is required",
                    status: 400
                }
            );
        }

        // Randomly select a welcome message
        const selectedMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

        // Construct the welcome notification message
        const message = {
            token,
            notification: {
                title: selectedMessage.title,
                body: selectedMessage.body,
                imageUrl: "/welcome-notification.png", // Add your gamified welcome image
            },
            data: {
                type: "welcome",
                url: "/dashboard",
                isFirstNotification: "true",
                timestamp: new Date().toISOString(),
            },
            webpush: {
                fcmOptions: {
                    link: "/dashboard",
                },
                notification: {
                    icon: "/logo.png",
                    badge: "/badge.png",
                    requireInteraction: true, // Make them interact with the welcome notification
                    tag: "welcome-notification",
                    renotify: false,
                    vibrate: [200, 100, 200], // Gamified vibration pattern
                },
            },
        };

        // Send the welcome notification
        const response = await admin.messaging().send(message);

        console.log("Welcome notification sent successfully:", response);

        return NextResponse.json(
            {
                success: true,
                messageId: response,
                message: "Welcome notification sent successfully",
                welcomeMessage: selectedMessage,
                status: 200
            }
        );
    } catch (error) {
        console.error("Error sending welcome notification:", error);
        return NextResponse.json(
            {
                error: "Failed to send welcome notification",
                details: error.message,
                status: 500
            }
        );
    }
}
