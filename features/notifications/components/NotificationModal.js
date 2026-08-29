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

  // Handle body scroll
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-[390px] h-auto min-h-[500px] max-h-[680px] flex flex-col bg-[#fffaf3] rounded-[28px] shadow-xl overflow-hidden transition-all duration-300 motion-reduce:transform-none ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        style={{ height: "calc(100dvh - 24px)", maxHeight: "680px" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-modal-title"
        aria-describedby="notif-modal-desc"
      >
        <button
          onClick={handleClose}
          disabled={loading}
          aria-label="Close notification prompt"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-black/5 rounded-full transition-colors z-10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col pt-16 px-6 pb-6">
          <div className="text-center px-2">
            <h2 id="notif-modal-title" className="text-[26px] md:text-[30px] font-bold text-slate-900 mb-3 leading-tight tracking-tight">
              Don&apos;t lose your <span className="text-[#06b6d4]">streak</span> to silence.
            </h2>
            <p id="notif-modal-desc" className="text-[15px] text-slate-500 mb-8 leading-relaxed">
              Get a reminder before your streak is at risk.
            </p>
          </div>
          
          {/* Illustration Area */}
          <div className="flex-1 flex flex-row items-end justify-between w-full mb-10 mt-auto px-2 relative">
            <div className="flex flex-col gap-2.5 pb-4 z-10">
              <div className="flex gap-2.5">
                <Image
                  src="/streak/streak_done.png"
                  alt=""
                  width={44}
                  height={44}
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm"
                />
                <Image
                  src="/streak/streak_done.png"
                  alt=""
                  width={44}
                  height={44}
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex gap-2.5">
                <Image
                  src="/streak/streak_pending_or_skipped.png"
                  alt=""
                  width={44}
                  height={44}
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain opacity-50 drop-shadow-sm"
                />
                <Image
                  src="/streak/streak_pending_or_skipped.png"
                  alt=""
                  width={44}
                  height={44}
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain opacity-50 drop-shadow-sm"
                />
              </div>
            </div>
            
            <Image
              src="/notifications/noti_kyle.svg"
              alt=""
              width={195}
              height={195}
              className="w-[165px] md:w-[195px] h-auto object-contain drop-shadow-md z-10 translate-y-2"
              priority
            />
          </div>
          
          <div className="w-full flex flex-col gap-3 mt-auto">
            <button
              onClick={handleAccept}
              disabled={loading}
              autoFocus
              className="w-full py-4 px-4 bg-[#06b6d4] hover:bg-[#0891b2] active:scale-[0.98] text-white font-bold rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enabling...
                </>
              ) : (
                "Enable Notifications"
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="w-full py-3 px-4 bg-transparent hover:bg-black/5 active:scale-[0.98] text-slate-600 font-bold rounded-xl transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
            >
              Maybe later
            </button>
          </div>

          <p className="text-[10.5px] text-slate-400/80 font-medium text-center mt-4">
            You can change this anytime in your browser settings.
          </p>
        </div>
      </div>
    </div>
  );
}
