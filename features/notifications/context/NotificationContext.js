"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {
    requestNotificationPermission,
    onForegroundMessage,
    displayNotification
} from "@/lib/firebase-messaging";

const NotificationContext = createContext({});

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({children}) => {
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
                    console.log("Service Worker registered:", registration);
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
                console.log("Foreground notification:", payload);
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
            const response = await fetch("/api/v1/notifications/save-token", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token: fcmToken, email: email}),
            });
            const data = await response.json();
            if (!response.ok) {
                console.error("Failed to save token:", data.error || data.message);
            }
        } catch (error) {
            console.error("Error saving token:", error);
        }
    };

    const value = {token, notification, permission, requestPermission};

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
