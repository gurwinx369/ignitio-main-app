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
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
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
    console.warn("[FCM] Notifications are not supported in this browser");
    return null;
  }

  // Check for secure context (HTTPS required for push notifications)
  if (!isSecureContext()) {
    console.warn("[FCM] Push notifications require a secure connection (HTTPS or localhost)");
    return null;
  }

  try {
    // Check current permission state first
    if (Notification.permission === "denied") {
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      if (process.env.NODE_ENV === "development") {
        console.log("[FCM] Notification permission granted.");
      }

      const messaging = getMessagingInstance();
      if (!messaging) {
        return null;
      }

      // Await active Service Worker registration to prevent Chromium registration race
      let serviceWorkerRegistration = undefined;
      if ("serviceWorker" in navigator) {
        try {
          serviceWorkerRegistration = await navigator.serviceWorker.ready;
        } catch (swErr) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[FCM] Service Worker ready wait warning:", swErr);
          }
        }
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey:
          "BL1YaBxm5RjncBSYfGAdyyOb7wvU7gcQ6DTkrePI97mWhcm57-6Z9B8Lf_V3K9Agr7TmhImZ8lq1SMk74s9YcZ0",
        serviceWorkerRegistration,
      });

      if (!token) {
        return null;
      }

      return token;
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("[FCM] Notification permission not granted:", permission);
      }
      return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[FCM] Error acquiring notification permission/token:", error?.message || error);
    }
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
  const messaging = getMessagingInstance();

  if (messaging) {
    return onMessage(messaging, (payload) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Foreground message received");
      }
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
