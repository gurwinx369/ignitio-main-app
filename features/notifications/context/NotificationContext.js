"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  requestNotificationPermission,
  onForegroundMessage,
  displayNotification,
} from "@/lib/firebase/firebase-messaging";
import { useAuth } from "@/features/context/AuthContext";
import axios from "axios";

const NotificationContext = createContext({});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const timer = setTimeout(() => {
        setPermission(Notification.permission);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          // console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  // Setup foreground message listener
  useEffect(() => {
    if (permission === "granted") {
      const unsubscribe = onForegroundMessage((payload) => {
        setNotification(payload);

        // With data-only FCM messages, all fields live in payload.data
        const data = payload.data || {};
        const title = data.title || "New Notification";
        const options = {
          body: data.body || "",
          icon: data.icon || "/ignitio-logo.png",
          badge: data.badge || "/ignitio-logo.png",
          tag: data.tag || "ignitio-notification",
          data: { url: data.url || "/" },
          requireInteraction: data.requireInteraction === "true",
        };
        displayNotification(title, options);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [permission]);

  const lastHeartbeatTime = useRef(0);
  const heartbeatTimeout = useRef(null);

  // Track user activity and fire throttled heartbeats
  useEffect(() => {
    if (permission !== "granted" || !user?.uid) return;

    const sendHeartbeat = () => {
      const now = Date.now();
      // Throttle to max 1 request per 5 minutes (300,000 ms)
      if (now - lastHeartbeatTime.current < 300000) return;

      lastHeartbeatTime.current = now;
      axios
        .post("/api/v1/notifications/heartbeat", {
          firebaseUID: user.uid,
        })
        .catch((error) => {
          // Fire-and-forget — heartbeat failure is non-critical
          console.log("Error message: ", error.message);
        });
    };

    // Send initial heartbeat on mount/auth
    sendHeartbeat();

    // Debounce activity events
    const handleActivity = () => {
      if (heartbeatTimeout.current) {
        clearTimeout(heartbeatTimeout.current);
      }
      heartbeatTimeout.current = setTimeout(() => {
        if (document.visibilityState === "visible") {
          sendHeartbeat();
        }
      }, 2000); // 2s debounce
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    // Attach activity listeners
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (heartbeatTimeout.current) clearTimeout(heartbeatTimeout.current);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [permission, user?.uid]);

  const requestPermission = async (email) => {
    // Check if email is provided for token saving
    if (!email) {
      console.error("Email is required to save notification token");
      return null;
    }

    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setPermission("granted");
      await saveTokenToBackend(fcmToken, email);
    }
    return fcmToken;
  };

  const saveTokenToBackend = async (fcmToken, email) => {
    try {
      const response = await axios.post("/api/v1/notifications/save-token", {
        token: fcmToken,
        email: email,
      });
      // Axios resolves response successfully if status is 2xx
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      console.error("Error saving token:", errorMessage);
    }
  };

  const value = { token, notification, permission, requestPermission };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
