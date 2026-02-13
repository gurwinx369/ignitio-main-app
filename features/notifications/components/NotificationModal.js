"use client";

import {useEffect, useState} from "react";
import {useNotification} from "../context/NotificationContext";
import axios from "axios";

export default function NotificationModal() {
    const {permission, requestPermission} = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-show on mount if permission not yet decided
    useEffect(() => {
        if (permission === "default") {
            const timer = setTimeout(() => {
                setIsOpen(true);
                setIsVisible(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [permission]);

    // Close immediately whenever permission gets granted
    useEffect(() => {
        if (permission === "granted" && isOpen) {
            setIsVisible(false);
            setIsOpen(false);
        }
    }, [permission, isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 300);
    };

    const handleAccept = async () => {
        setLoading(true);
        try {
            const fcmToken = await requestPermission();

            if (!fcmToken) {
                setLoading(false);
                alert("Failed to enable notifications. Please check your browser settings.");
                return;
            }

            // ✅ Send welcome notification only the first time
            //TODO: Test this notification route
            const alreadySentWelcome = localStorage.getItem("welcome_notification_sent");
            if (!alreadySentWelcome) {
                const response = await axios({
                    method: "POST",
                    url: "/api/v1/notifications/welcome",
                    data: {
                        token: fcmToken,
                    },
                });
                console.log("Getting data from the notification route: ", response.data);
            } else {
                alert("Failed to enable notifications. Please check your browser settings.");
            }
        } catch (error) {
            setLoading(false);
            console.error("Error enabling notifications:", error);
            alert("An error occurred while enabling notifications.");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @keyframes backdropIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -44%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translate(-50%, -44%) scale(0.95);
                    }
                }

                @keyframes ringPulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 0; transform: scale(1.4); }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .notif-backdrop {
                    animation: backdropIn 0.3s ease-out;
                }

                .notif-modal {
                    animation: ${isVisible ? "slideUp" : "slideDown"} 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .ring-pulse {
                    animation: ringPulse 2s ease-in-out infinite;
                }

                .spinner {
                    animation: spin 0.9s linear infinite;
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="notif-backdrop fixed inset-0 z-50"
                style={{backgroundColor: "rgba(25, 24, 59, 0.55)", backdropFilter: "blur(4px)"}}
                onClick={handleClose}
            >
                {/* Modal */}
                <div
                    className="notif-modal fixed"
                    style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "#f5ddc9",
                        borderRadius: "24px",
                        padding: "36px 32px 32px",
                        width: "min(420px, 90vw)",
                        boxShadow: "0 24px 64px rgba(25, 24, 59, 0.25)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: "transparent",
                            color: "#19183b",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(25, 24, 59, 0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>

                    {/* Bell Icon */}
                    <div style={{display: "flex", justifyContent: "center", marginBottom: "20px"}}>
                        <div style={{position: "relative", width: "72px", height: "72px"}}>
                            <div
                                className="ring-pulse"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: "50%",
                                    backgroundColor: "#FFB800",
                                }}
                            />
                            <div style={{
                                position: "relative",
                                width: "72px",
                                height: "72px",
                                borderRadius: "50%",
                                backgroundColor: "#FFB800",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#19183b"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#19183b",
                        textAlign: "center",
                        marginBottom: "10px",
                        lineHeight: "1.3",
                    }}>
                        Never Miss Your Learning Streak!
                    </h2>

                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        color: "#19183b",
                        opacity: 0.7,
                        textAlign: "center",
                        lineHeight: "1.65",
                        marginBottom: "28px",
                    }}>
                        Get timely reminders to keep leveling up and stay on track with your tech learning goals
                    </p>

                    {/* Buttons */}
                    <div style={{display: "flex", gap: "12px"}}>
                        {/* Secondary */}
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "13px",
                                borderRadius: "50px",
                                border: "2px solid #19183b",
                                backgroundColor: "transparent",
                                color: "#19183b",
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.5 : 1,
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.backgroundColor = "rgba(25, 24, 59, 0.06)"
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) e.currentTarget.style.backgroundColor = "transparent"
                            }}
                        >
                            Maybe Later
                        </button>

                        {/* Primary */}
                        <button
                            onClick={handleAccept}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "13px",
                                borderRadius: "50px",
                                border: "2px solid #19183b",
                                backgroundColor: "#19183b",
                                color: "#f5ddc9",
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                boxShadow: "0 4px 14px rgba(25, 24, 59, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                transition: "background-color 0.2s, transform 0.2s, box-shadow 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = "#2a2851";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(25, 24, 59, 0.4)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = "#19183b";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(25, 24, 59, 0.3)";
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <div
                                        className="spinner"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            border: "2px solid rgba(245, 221, 201, 0.3)",
                                            borderTop: "2px solid #f5ddc9",
                                            borderRadius: "50%",
                                        }}
                                    />
                                    Enabling...
                                </>
                            ) : (
                                "Allow Notifications"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
