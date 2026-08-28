"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/features/onboarding/components/OnboardingShell";
import QuickCheckHeroVisual from "@/features/onboarding/components/QuickCheckHeroVisual";

const FeatureRow = ({ icon, text }) => (
  <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 max-w-sm mx-auto mb-4">
    <div className="w-10 h-10 rounded-full bg-[#E5F6FF] flex items-center justify-center text-[#00A9FF]">
      {icon}
    </div>
    <span className="font-bold text-[#001D32] text-left">{text}</span>
  </div>
);

export default function OnboardingEntry() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      router.push("/home/onboarding/diagnostic");
    }
  };

  /* ── Step 0: Value Proposition ─────────────────────────── */
  if (step === 0) {
    return (
      <OnboardingShell hideProgress>
        <div className="text-center px-4 max-w-2xl mx-auto pt-16 pb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-[#001D32] mb-16 leading-tight tracking-tight">
            Become the<br />developer<br />companies<br />actually hire.
          </h1>

          <div className="mb-16">
            <FeatureRow
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>}
              text="Accelerated Learning Path"
            />
            <FeatureRow
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>}
              text="AI-Powered Feedback"
            />
            <FeatureRow
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>}
              text="Industry-Recognized Certs"
            />
          </div>

          <button
            onClick={handleNext}
            className="w-full max-w-sm bg-[#00A9FF] text-white px-8 py-4 rounded-full font-bold text-lg uppercase tracking-wide hover:bg-[#0096e6] transition-transform active:translate-y-1 mx-auto block"
            style={{ boxShadow: "0 4px 0 #004B74" }}
          >
            CONTINUE
          </button>
        </div>
      </OnboardingShell>
    );
  }

  /* ── Step 1: Quick Check Intro ─────────────────────────── */
  return (
    <main className="relative h-dvh overflow-hidden bg-[#FCF5EE]">
      <div className="relative mx-auto flex h-full w-full max-w-[900px] flex-col items-center px-5 pt-8 text-center sm:pt-10 lg:pt-10">

        {/* TOP COPY */}
        <h1 className="relative z-30 mx-auto max-w-[760px] text-[22px] font-medium leading-[1.45] text-[#4A5568] sm:text-2xl lg:text-[30px] lg:leading-[1.5]">
          Not to judge you. To make sure we don&apos;t waste your time.
          <br className="hidden sm:block" />
          No re-teaching what you already know, no skipping what you don&apos;t.
        </h1>

        {/* HERO */}
        <QuickCheckHeroVisual
          className="relative z-10 mt-2 min-h-[360px] w-full flex-1 sm:min-h-[390px] lg:min-h-[420px]"
        />

        {/* MICROCOPY + CTA */}
        <div className="relative z-40 mt-[-58px] w-full max-w-[430px] pb-6 sm:mt-[-64px] lg:mt-[-72px] lg:pb-8">
          <p className="mb-4 text-sm text-[#4A5568] sm:text-base">
            Answer where you are, not where you want to be.
          </p>

          <button
            onClick={handleNext}
            className="w-full rounded-full bg-[#00A9FF] px-8 py-4 text-base font-bold uppercase tracking-wide text-white transition-transform hover:bg-[#0096e6] active:translate-y-1 sm:text-lg"
            style={{ boxShadow: "0 4px 0 #004B74" }}
          >
            START MY QUICK CHECK
          </button>
        </div>
      </div>
    </main>
  );
}