// app/lib/firebase-messaging.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

// Initialize messaging only on client-side
export const getMessagingInstance = () => {
    if (typeof window !== "undefined" && !messaging) {
        messaging = getMessaging(app);
    }
    return messaging;
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notification permission granted.");

            const messaging = getMessagingInstance();

            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: "BL1YaBxm5RjncBSYfGAdyyOb7wvU7gcQ6DTkrePI97mWhcm57-6Z9B8Lf_V3K9Agr7TmhImZ8lq1SMk74s9YcZ0"
            });

            console.log("FCM Token:", token);

            // ✅ Send welcome notification only on first-time permission grant
            if (token) {
                const isFirstTime = !localStorage.getItem("welcome_notification_sent");

                if (isFirstTime) {
                    await triggerWelcomeNotification(token);
                    localStorage.setItem("welcome_notification_sent", "true");
                    localStorage.setItem("welcome_notification_date", new Date().toISOString());
                }
            }

            return token;
        } else {
            console.log("Notification permission denied.");
            return null;
        }
    } catch (error) {
        console.error("Error getting notification permission:", error);
        return null;
    }
};

// Calls the welcome notification API route
const triggerWelcomeNotification = async (token) => {
    try {
        const response = await fetch("/api/notifications/welcome", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
            console.log("Welcome notification triggered:", data.welcomeMessage?.title);
        } else {
            console.error("Welcome notification failed:", data.error);
        }
    } catch (error) {
        console.error("Error triggering welcome notification:", error);
    }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
    const messaging = getMessagingInstance();

    if (messaging) {
        return onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            callback(payload);
        });
    }
};

// Display notification
export const displayNotification = (title, options) => {
    if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification(title, options);
        }
    }
};
