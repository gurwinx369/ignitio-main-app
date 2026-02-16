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
                    icon: payload.notification?.icon || "/logo.png",
                    badge: "/badge.png",
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

    const requestPermission = async () => {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
            setToken(fcmToken);
            setPermission("granted");
            await saveTokenToBackend(fcmToken);
        }
        return fcmToken;
    };

    const saveTokenToBackend = async (fcmToken) => {
        try {
            await fetch("/api/v1/notifications/save-token", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token: fcmToken}),
            });
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
