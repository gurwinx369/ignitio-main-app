"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuickCheckHeroVisual from "@/features/onboarding/components/QuickCheckHeroVisual";

/* ─────────────────────────────────────────────
   Step 0 — Value Proposition
───────────────────────────────────────────── */
function ValuePropScreen({ onNext }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
      ),
      label: "Accelerated Learning Path",
      delay: 80,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
      ),
      label: "AI-Powered Feedback",
      delay: 160,
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      ),
      label: "Industry-Recognized Certs",
      delay: 240,
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-12" style={{ backgroundColor: "#FCF5EE" }}>
      <div className={`w-full max-w-sm flex flex-col items-center ob-fade-up ${visible ? "ob-visible" : ""}`}>

        {/* Headline — no badge */}
        <div className="text-center mb-10">
          <h1 className="text-[40px] sm:text-[46px] font-black text-[#001D32] leading-[1.1] tracking-tight">
            Become the<br />
            <span className="relative inline-block">
              developer
              <span className="absolute -bottom-1 left-0 w-full h-[5px] rounded-full" style={{ background: "linear-gradient(90deg,#00a9ff,#0277bd)" }} aria-hidden="true" />
            </span>
            <br />companies<br />
            actually hire.
          </h1>
        </div>

        {/* Feature rows */}
        <div className="w-full flex flex-col gap-3 mb-10">
          {features.map((f) => (
            <div
              key={f.label}
              className={`ob-fade-up ${visible ? "ob-visible" : ""} flex items-center gap-4 bg-white px-5 py-4 rounded-2xl shadow-sm border border-white`}
              style={{ transitionDelay: visible ? `${f.delay}ms` : "0ms" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5F6FF] flex items-center justify-center text-[#00A9FF] shrink-0">
                {f.icon}
              </div>
              <span className="font-bold text-[#001D32] text-[15px]">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <p className="text-[13px] text-[#9ca3af] text-center mb-6">
          Joined by <strong className="text-[#6b7280]">2,400+</strong> learners building real AI skills
        </p>

        {/* CTA */}
        <button
          onClick={onNext}
          className="ob-press-btn w-full py-4 rounded-full text-white font-extrabold text-[16px] uppercase tracking-wide focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg,#00bfff,#0288d1)" }}
        >
          Continue
        </button>
      </div>

      <style>{`
        .ob-fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1);
        }
        .ob-fade-up.ob-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .ob-fade-up { transition: none; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step 1 — Quick Check Intro
   No badge, no subheading, no stats.
   h-dvh so the CTA never scrolls off screen.
───────────────────────────────────────────── */
function QuickCheckScreen({ onNext }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="h-dvh flex flex-col items-center overflow-hidden"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      {/* Headline — pinned top, no badge, no subheading */}
      <div
        className={`relative z-30 w-full max-w-[480px] px-6 pt-10 sm:pt-12 text-center flex-shrink-0 ob-fade-up ${visible ? "ob-visible" : ""}`}
      >
        <h1 className="text-[30px] sm:text-[36px] font-black text-[#001D32] leading-[1.15] tracking-tight">
          Let&apos;s curate your<br />
          <span className="relative inline-block text-[#0288d1]">
            personalized
            <span
              className="absolute -bottom-1 left-0 w-full h-[4px] rounded-full"
              style={{ background: "linear-gradient(90deg,#29b6f6,#0277bd)" }}
              aria-hidden="true"
            />
          </span>
          {" "}learning path
        </h1>
      </div>

      {/* Kyle + Earth — takes all remaining vertical space */}
      <QuickCheckHeroVisual
        className="relative z-10 w-full flex-1 min-h-0"
      />

      {/* CTA — pinned at bottom, always visible */}
      <div
        className={`relative z-40 w-full max-w-[420px] px-6 pb-8 flex-shrink-0 ob-fade-up ${visible ? "ob-visible" : ""}`}
        style={{ transitionDelay: visible ? "200ms" : "0ms" }}
      >
        <button
          onClick={onNext}
          className="ob-press-btn w-full rounded-full text-white py-4 font-extrabold text-[16px] uppercase tracking-wide focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg,#00bfff,#0288d1)" }}
        >
          Start My Quick Check
        </button>
      </div>

      <style>{`
        .ob-fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 480ms cubic-bezier(0.22,1,0.36,1), transform 480ms cubic-bezier(0.22,1,0.36,1);
        }
        .ob-fade-up.ob-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .ob-fade-up { transition: none; opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Page entry
───────────────────────────────────────────── */
export default function OnboardingEntry() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step === 0) setStep(1);
    else router.push("/home/onboarding/diagnostic");
  };

  if (step === 0) return <ValuePropScreen onNext={handleNext} />;
  return <QuickCheckScreen onNext={handleNext} />;
}