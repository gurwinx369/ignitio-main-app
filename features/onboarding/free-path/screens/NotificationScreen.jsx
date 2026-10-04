"use client";

import { useState, useEffect } from "react";

export default function NotificationScreen({ onAllow, onSkip }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <style>{`
        @keyframes notif-bell {
          0%,100% { transform: rotate(0); }
          20%      { transform: rotate(-18deg); }
          40%      { transform: rotate(18deg); }
          60%      { transform: rotate(-10deg); }
          80%      { transform: rotate(10deg); }
        }
        .bell-ring { animation: notif-bell 1.2s cubic-bezier(0.36,0.07,0.19,0.97) 0.5s both; }
        @media (prefers-reduced-motion: reduce) {
          .bell-ring { animation: none; }
        }
      `}</style>

      <div
        className="w-full max-w-sm flex flex-col items-center text-center gap-6 transition-all duration-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* Bell icon */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg bell-ring"
          style={{ background: "linear-gradient(135deg, #FEF9C3, #FDE68A)" }}
          aria-hidden="true"
        >
          🔔
        </div>

        {/* Copy */}
        <div>
          <h1 className="text-[30px] font-black text-[#001D32] leading-[1.1] tracking-tight mb-3">
            Want us to tell you the moment tomorrow&apos;s step unlocks?
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed">
            Daily streaks are the fastest path from zero to job-ready. We&apos;ll nudge you once a day — that&apos;s it.
          </p>
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={onAllow}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide transition-all active:scale-[0.98] focus-visible:outline-none"
            style={{ background: "linear-gradient(135deg, #00bfff, #0288d1)", boxShadow: "0 4px 0 #005fa3" }}
          >
            Allow
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-3 rounded-2xl font-semibold text-[14px] text-slate-500 hover:text-slate-700 transition-colors focus-visible:outline-none"
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}
