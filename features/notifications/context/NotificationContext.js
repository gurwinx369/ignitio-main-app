"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  requestNotificationPermission,
  onForegroundMessage,
  displayNotification,
} from "../../../lib/firebase/firebase-messaging";

const NotificationContext = createContext({});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permission, setPermission] = useState("default");

  // ✅ FIX: Split into two separate effects so SW registration is never skipped
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const timer = setTimeout(() => {
        setPermission(Notification.permission);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // ✅ FIX: SW registration now lives in its own effect — always runs
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
        })
        .catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Service Worker registration failed:", error?.message || "unknown error");
          }
        });
    }
  }, []);

  // Setup foreground message listener
  useEffect(() => {
    if (permission === "granted") {
      const unsubscribe = onForegroundMessage((payload) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Foreground notification received");
        }
        setNotification(payload);

        const title = payload.notification?.title || "New Notification";
        const options = {
          body: payload.notification?.body || "",
          icon: payload.notification?.icon || "/ignitio-logo.png",
          badge: "/ignitio-logo.png",
          tag: payload.data?.tag || "notification",
          data: payload.data,
        };
        displayNotification(title, options);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [permission]);

  const requestPermission = async (email) => {
    // Check if email is provided for token saving
    if (!email) {
      if (process.env.NODE_ENV === "development") {
        console.error("Email is required to save notification token");
      }
      return null;
    }

    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setPermission("granted");
      saveTokenToBackend(fcmToken, email); // Fire and forget
    }
    return fcmToken;
  };

  const saveTokenToBackend = async (fcmToken, email) => {
    try {
      const response = await fetch("/api/v1/notifications/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: fcmToken, email: email }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to save token:", data?.error || data?.message || "unknown error");
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving token:", error?.message || "unknown error");
      }
    }
  };

  const value = { token, notification, permission, requestPermission };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
