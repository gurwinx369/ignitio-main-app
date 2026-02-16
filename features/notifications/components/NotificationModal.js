"use client";

import {useEffect, useState} from "react";
import {useNotification} from "../context/NotificationContext";
import axios from "axios";

export default function NotificationModal() {
    const {permission, requestPermission} = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        if (permission === "default") {
            const timer = setTimeout(() => {
                setIsOpen(true);
                setIsVisible(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [permission]);

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

            const alreadySentWelcome = localStorage.getItem("welcome_notification_sent");
            if (alreadySentWelcome) {
                const response = await axios({
                    method: "POST",
                    url: "/api/v1/notifications/welcome",
                    data: { token: fcmToken },
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
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                @keyframes backdropIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -46%) scale(0.97);
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
                        transform: translate(-50%, -46%) scale(0.97);
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .notif-backdrop {
                    animation: backdropIn 0.3s ease-out;
                }

                .notif-modal {
                    animation: ${isVisible ? "slideUp" : "slideDown"} 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
                }

                .spinner {
                    animation: spin 0.9s linear infinite;
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="notif-backdrop fixed inset-0 z-50"
                style={{
                    backgroundColor: "rgba(26, 26, 46, 0.45)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                }}
                onClick={handleClose}
            >
                {/* Modal */}
                <div
                    className="notif-modal fixed"
                    style={{
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "#f0ede6",
                        borderRadius: "24px",
                        width: "min(430px, 92vw)",
                        boxShadow: "0 20px 60px rgba(26, 26, 46, 0.22), 0 4px 16px rgba(26, 26, 46, 0.1)",
                        overflow: "hidden",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Top hero band — dark navy, matches course card feel ── */}
                    <div style={{
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                        padding: "32px 32px 30px",
                        position: "relative",
                        overflow: "hidden",
                    }}>
                        {/* Dashed border inset — signature course-card detail */}
                        <svg
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                            }}
                            preserveAspectRatio="none"
                            viewBox="0 0 430 160"
                        >
                            <rect
                                x="8" y="8"
                                width="414" height="144"
                                rx="16" ry="16"
                                fill="none"
                                stroke="rgba(255,255,255,0.13)"
                                strokeWidth="2"
                                strokeDasharray="9 7"
                            />
                        </svg>

                        {/* Yellow circle decoration — matches ignitio.cloud hero */}
                        <div style={{
                            position: "absolute",
                            top: "-48px",
                            right: "-48px",
                            width: "160px",
                            height: "160px",
                            borderRadius: "50%",
                            border: "2.5px solid rgba(250, 204, 21, 0.18)",
                            pointerEvents: "none",
                        }} />
                        <div style={{
                            position: "absolute",
                            top: "-24px",
                            right: "-24px",
                            width: "110px",
                            height: "110px",
                            borderRadius: "50%",
                            border: "2px solid rgba(250, 204, 21, 0.1)",
                            pointerEvents: "none",
                        }} />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            style={{
                                position: "absolute",
                                top: "14px",
                                right: "14px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                border: "1px solid rgba(255,255,255,0.14)",
                                backgroundColor: "rgba(255,255,255,0.07)",
                                color: "rgba(255,255,255,0.45)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s",
                                zIndex: 2,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>

                        {/* Eyebrow label — matches "FOR ASPIRING DEVELOPERS" style */}
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            fontWeight: "700",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "rgba(250, 204, 21, 0.75)",
                            margin: "0 0 12px 0",
                            position: "relative",
                            zIndex: 1,
                        }}>
                            For active learners
                        </p>

                        {/* Heading */}
                        <h2 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "27px",
                            fontWeight: "900",
                            color: "#ffffff",
                            lineHeight: "1.22",
                            margin: 0,
                            position: "relative",
                            zIndex: 1,
                        }}>
                            Never miss your<br />
                            {/* Peach highlight — same treatment as "hired" on ignitio.cloud */}
                            <span style={{ position: "relative", display: "inline" }}>
                                learning streak.
                                <span style={{
                                    position: "absolute",
                                    bottom: "2px",
                                    left: "-2px",
                                    right: "-2px",
                                    height: "11px",
                                    backgroundColor: "rgba(251, 191, 99, 0.22)",
                                    borderRadius: "4px",
                                    zIndex: -1,
                                }} />
                            </span>
                        </h2>
                    </div>

                    {/* ── Bottom content area — warm cream bg ── */}
                    <div style={{ padding: "24px 32px 30px" }}>

                        {/* Description */}
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "#4a4a6a",
                            lineHeight: "1.65",
                            marginBottom: "20px",
                        }}>
                            Get timely reminders to keep leveling up and stay on track with your tech learning goals — we&#39;ll only ping you when it matters.
                        </p>

                        {/* Perk chips — coloured squares like the course progress indicators */}
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "24px",
                        }}>
                            {[
                                { label: "Streak reminders", color: "#0EA5E9" },
                                { label: "New challenges",   color: "#6366F1" },
                                { label: "Weekly progress",  color: "#10B981" },
                            ].map(({ label, color }) => (
                                <span key={label} style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#1a1a2e",
                                    backgroundColor: `${color}1a`,
                                    border: `1.5px solid ${color}40`,
                                    borderRadius: "8px",
                                    padding: "5px 11px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}>
                                    <span style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "3px",
                                        backgroundColor: color,
                                        display: "inline-block",
                                        flexShrink: 0,
                                    }} />
                                    {label}
                                </span>
                            ))}
                        </div>

                        {/* Divider */}
                        <div style={{
                            height: "1px",
                            backgroundColor: "rgba(26, 26, 46, 0.08)",
                            marginBottom: "22px",
                        }} />

                        {/* Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                            {/* Primary — Allow Notifications */}
                            <button
                                onClick={handleAccept}
                                disabled={loading}
                                onMouseDown={() => !loading && setButtonPressed(true)}
                                onMouseUp={() => setButtonPressed(false)}
                                onMouseLeave={() => setButtonPressed(false)}
                                style={{
                                    width: "100%",
                                    padding: "15px",
                                    borderRadius: "50px",
                                    border: "none",
                                    backgroundColor: loading ? "#38A5D0" : "#0EA5E9",
                                    color: "#ffffff",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    boxShadow: buttonPressed || loading
                                        ? "0 2px 0 #0284C7"
                                        : "0 6px 0 #0284C7",
                                    transform: buttonPressed ? "translateY(4px)" : "translateY(0)",
                                    transition: "background-color 0.15s",
                                    opacity: loading ? 0.8 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div
                                            className="spinner"
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                border: "2.5px solid rgba(255,255,255,0.3)",
                                                borderTop: "2.5px solid #fff",
                                                borderRadius: "50%",
                                            }}
                                        />
                                        Enabling...
                                    </>
                                ) : (
                                    "Allow Notifications"
                                )}
                            </button>

                            {/* Secondary — Maybe Later */}
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "15px",
                                    borderRadius: "50px",
                                    border: "none",
                                    backgroundColor: loading ? "#D4D4D4" : "#A0C4E8",
                                    color: "#1a1a2e",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    boxShadow: loading ? "0 6px 0 #B8B8B8" : "0 6px 0 #7FA8CC",
                                    opacity: loading ? 0.6 : 1,
                                    transition: "background-color 0.15s",
                                }}
                                onMouseDown={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = "translateY(6px)";
                                        e.currentTarget.style.boxShadow = "0 0px 0 #7FA8CC";
                                    }
                                }}
                                onMouseUp={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 6px 0 #7FA8CC";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 6px 0 #7FA8CC";
                                    }
                                }}
                            >
                                Maybe Later
                            </button>
                        </div>

                        {/* Fine print */}
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "11px",
                            color: "rgba(74, 74, 106, 0.45)",
                            textAlign: "center",
                            marginTop: "16px",
                        }}>
                            You can change this anytime in your browser settings.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
