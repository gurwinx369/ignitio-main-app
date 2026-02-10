// app/features/notifications/components/NotificationButton.js
"use client";

import { useState } from "react";
import { useNotification } from "../context/NotificationContext";
import {useAuth} from "../context/AuthContext";
import axios from "axios"

export default function NotificationButton() {
    const { permission, requestPermission, token } = useNotification();
    const { user } = useAuth();
    console.log("USER :", user)
    const [loading, setLoading] = useState(false);

    const handleEnableNotifications = async () => {
        setLoading(true);
        try {
            const fcmToken = await requestPermission();
            if (fcmToken) {
                alert("Notifications enabled successfully!");
            } else {
                alert("Failed to enable notifications. Please check your browser settings.");
            }
        } catch (error) {
            console.error("Error enabling notifications:", error);
            alert("An error occurred while enabling notifications.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotifications = async () => {
        try {
            setLoading(true);
            const fcmToken = await requestPermission();
            if (fcmToken) {
                const response = await axios({
                    method: "POST",
                    url: "/api/v1/notifications/send",
                    data: {
                        token: token,
                        title: "This is a test notification",
                        body: "Hey, this notification is from notification send button",
                    }
                })
                console.log("Getting data from the notification route: ", response.data);
            } else {
                alert("Failed to enable notifications. Please check your browser settings.");
            }
        } catch (e) {
            console.error("Error sending notification", e);
            alert("Failed to send notification");
        } finally {
            setLoading(false);
        }
    }

    if (permission === "granted") {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-600">
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="text-sm">Notifications Enabled</span>
                </div>
                <button
                    onClick={handleSendNotifications}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            <span>Send Test Notification</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleEnableNotifications} // Fixed: was calling handleSendNotifications
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Enabling...</span>
                </>
            ) : (
                <>
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    <span>Enable Notifications</span>
                </>
            )}
        </button>
    );
}
