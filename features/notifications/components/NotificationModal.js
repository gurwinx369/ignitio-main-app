"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "@/features/context/AuthContext";
import axios from "axios";
import { hasUserCompletedAnyLesson } from "@/lib/roadmaps/progress.helpers";

export default function NotificationModal() {
  const { permission, requestPermission } = useNotification();
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAndShowModal = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. Never show again in the current session if user closed or dismissed it
    try {
      if (sessionStorage.getItem("notification_modal_dismissed_session") === "true") {
        return;
      }
    } catch (e) {
      // ignore storage access errors
    }

    // 2. Must have permission as 'default'
    if (permission !== "default") return;

    // 3. User must have completed at least 1 lesson
    if (!hasUserCompletedAnyLesson()) return;

    // 4. Must NOT be inside a level view
    if (window.__IS_IN_LESSON_VIEW) return;

    // 5. Must be strictly on a Roadmap Screen (pathname contains '/roadmaps' or RoadmapTemplate screen active)
    const isRoadmapRoute =
      (pathname && pathname.includes("/roadmaps")) ||
      window.__IS_ON_ROADMAP_SCREEN === true;

    if (!isRoadmapRoute) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setIsVisible(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [permission, pathname]);

  useEffect(() => {
    const cleanup = checkAndShowModal();
    return cleanup;
  }, [checkAndShowModal, pathname]);

  useEffect(() => {
    const handleCheckModal = () => {
      checkAndShowModal();
    };

    window.addEventListener("returned_to_roadmap", handleCheckModal);
    window.addEventListener("entered_roadmap_screen", handleCheckModal);

    return () => {
      window.removeEventListener("returned_to_roadmap", handleCheckModal);
      window.removeEventListener("entered_roadmap_screen", handleCheckModal);
    };
  }, [checkAndShowModal]);

  useEffect(() => {
    if (permission === "granted" && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
      setIsOpen(false);
    }
  }, [permission, isOpen]);

  const handleClose = useCallback(() => {
    if (loading) return;
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("notification_modal_dismissed_session", "true");
      }
    } catch (e) {
      // ignore storage errors
    }
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300);
  }, [loading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, handleClose]);

  // Removed body scroll lock to allow continuous flow
  useEffect(() => {
    // No-op for scroll
  }, [isVisible]);

  const handleAccept = async () => {
    // Check if user is logged in
    if (!user?.email) {
      alert("Please log in to enable notifications.");
      return;
    }

    setLoading(true);
    try {
      const fcmToken = await requestPermission(user.email);

      if (!fcmToken) {
        setLoading(false);
        alert(
          "Failed to enable notifications. Please check your browser settings.",
        );
        return;
      }

      const alreadySentWelcome = localStorage.getItem(
        "welcome_notification_sent",
      );
      if (process.env.NODE_ENV === "development") {
        console.log("Already sent: ", alreadySentWelcome);
      }
      if (!alreadySentWelcome) {
        const response = await axios({
          method: "POST",
          url: "/api/v1/notifications/welcome",
          data: { token: fcmToken },
        });
        if (process.env.NODE_ENV === "development") {
          console.log("Welcome notification sent");
        }
        // ✅ Mark as sent so we don't send it again on future permission grants
        localStorage.setItem("welcome_notification_sent", "true");
      }

      // ✅ Always stop loading and close modal on success
      setLoading(false);
      handleClose();
    } catch (error) {
      setLoading(false);
      if (process.env.NODE_ENV === "development") {
        console.error("Error enabling notifications:", error?.message || "unknown error");
      }
      // Show the actual error message if available
      const errorMessage =
        error?.message || "An error occurred while enabling notifications.";
      alert(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] pointer-events-none transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 sm:translate-x-16"
      }`}
    >
      <div
        className={`relative w-full bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] border border-slate-100 p-5 sm:p-6 pointer-events-auto transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transform-none ${
          isVisible ? "scale-100" : "scale-[0.97]"
        }`}
        role="alertdialog"
        aria-modal="false"
        aria-labelledby="notif-modal-title"
        aria-describedby="notif-modal-desc"
      >
        <button
          onClick={handleClose}
          disabled={loading}
          aria-label="Close notification prompt"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-20 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar & Streak Icons Column */}
          <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-3 shrink-0">
            <div className="relative w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] bg-gradient-to-b from-[#fffcf8] to-[#fff5e6] rounded-2xl flex items-center justify-center border border-orange-50 shadow-inner">
              <Image
                src="/notifications/noti_kyle.svg"
                alt=""
                width={100}
                height={100}
                className="w-[85px] sm:w-[95px] absolute -bottom-1 object-contain drop-shadow-md z-10"
                priority
              />
            </div>
            
            {/* Small Streak visualization */}
            <div className="flex justify-center gap-2 mt-1 opacity-95">
              <Image src="/streak/streak_done.png" alt="" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm" />
              <Image src="/streak/streak_done.png" alt="" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm" />
              <Image src="/streak/streak_pending_or_skipped.png" alt="" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 object-contain opacity-50 drop-shadow-sm" />
            </div>
          </div>

          {/* Content & Actions Column */}
          <div className="flex flex-col justify-between flex-1 pt-1">
            <div className="pr-6 sm:pr-4">
              <h2 id="notif-modal-title" className="text-[17px] sm:text-[18px] font-extrabold text-[#19183B] mb-1.5 leading-tight tracking-tight">
                Don&apos;t lose your <span className="text-[#06b6d4]">streak</span> to silence.
              </h2>
              <p id="notif-modal-desc" className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
                Get a reminder before your streak is at risk.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 mt-auto">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 h-[42px] text-[13px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
              >
                Maybe later
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                autoFocus
                className="flex-1 h-[42px] px-5 bg-[#00A9FF] hover:bg-[#0098E5] active:scale-[0.98] text-white text-[13.5px] font-bold rounded-xl transition-all shadow-md shadow-[#00A9FF]/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enabling...
                  </>
                ) : (
                  "Enable Notifications"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
