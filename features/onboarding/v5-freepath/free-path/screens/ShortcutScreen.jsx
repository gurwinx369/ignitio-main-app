"use client";

import { useState, useEffect } from "react";

export default function ShortcutScreen({ onFastTrack, onSeeBasics }) {
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
        @keyframes sc-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sc-in { animation: sc-in 480ms cubic-bezier(0.22,1,0.36,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .sc-in { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div
        className="sc-in w-full max-w-sm"
        style={{ animationDelay: "60ms" }}
      >
        {/* Rocket emoji badge */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #00A9FF, #0277BD)" }}
          >
            🚀
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-[30px] font-black text-[#001D32] leading-[1.1] tracking-tight text-center mb-3">
          You&apos;re closer to internship-ready than you think.
        </h1>
        <p className="text-[15px] text-slate-500 font-medium text-center mb-10 leading-relaxed">
          Want the fast track? We&apos;ll drop you straight into our Gen AI module — the most in-demand skill right now.
        </p>

        {/* Fast-track CTA */}
        <button
          type="button"
          onClick={onFastTrack}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide mb-3 transition-all active:scale-[0.98] focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #00bfff, #0288d1)", boxShadow: "0 4px 0 #005fa3" }}
        >
          Yes, fast-track me
        </button>

        {/* Secondary — fall back to knowledge check */}
        <button
          type="button"
          onClick={onSeeBasics}
          className="w-full py-4 rounded-2xl font-bold text-[15px] text-slate-600 bg-white border-2 border-slate-200 transition-all active:scale-[0.98] focus-visible:outline-none hover:border-slate-300"
        >
          No, show me the basics
        </button>
      </div>
    </main>
  );
}
