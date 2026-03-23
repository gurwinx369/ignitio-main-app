// app/lib/firebase-messaging.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

// Check if notifications are supported in this browser/environment
export const isNotificationSupported = () => {
    return (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
    );
};

// Check if we're on HTTPS or localhost (required for push notifications)
export const isSecureContext = () => {
    if (typeof window === "undefined") return false;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const isHttps = window.location.protocol === "https:";
    return isHttps || isLocalhost;
};

// Initialize messaging only on client-side
export const getMessagingInstance = () => {
    if (typeof window !== "undefined" && !messaging) {
        messaging = getMessaging(app);
    }
    return messaging;
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
    // Check browser support first
    if (!isNotificationSupported()) {
        console.error("Notifications are not supported in this browser");
        throw new Error("Notifications are not supported in this browser. Please try a different browser.");
    }

    // Check for secure context (HTTPS required for push notifications)
    if (!isSecureContext()) {
        console.error("Push notifications require HTTPS");
        throw new Error("Push notifications require a secure connection (HTTPS). Please access the site via HTTPS.");
    }

    try {
        // Check current permission state first
        if (Notification.permission === "denied") {
            console.error("Notification permission was previously denied");
            throw new Error("Notification permission was denied. Please enable notifications in your browser settings and refresh the page.");
        }

        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Notification permission granted.");

            const messaging = getMessagingInstance();

            if (!messaging) {
                throw new Error("Failed to initialize messaging. Please refresh and try again.");
            }

            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: "BL1YaBxm5RjncBSYfGAdyyOb7wvU7gcQ6DTkrePI97mWhcm57-6Z9B8Lf_V3K9Agr7TmhImZ8lq1SMk74s9YcZ0"
            });

            if (!token) {
                throw new Error("Failed to get notification token. Please try again.");
            }

            console.log("FCM Token:", token);
            return token;
        } else if (permission === "denied") {
            console.log("Notification permission denied.");
            throw new Error("Notification permission was denied. Please enable notifications in your browser settings.");
        } else {
            console.log("Notification permission dismissed.");
            return null;
        }
    } catch (error) {
        console.error("Error getting notification permission:", error);
        // Re-throw the error so the caller can handle it
        throw error;
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
