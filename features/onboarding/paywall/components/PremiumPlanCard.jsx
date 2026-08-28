import { Check } from "lucide-react";

import {
  CLIENT_SUBSCRIPTION_PLANS,
} from "../constants/plans";

// Approved shared benefits sourced from PremiumBenefits.jsx
// These apply to ALL plans — no per-tier fabrication
const SHARED_BENEFITS = [
  "Diagnostic-personalized roadmap",
  "Skill-based compression",
  "Premium GenAI roadmap access",
  "Role-aware Kyle guidance",
];

export default function PremiumPlanCard({
  selectedPlan,
  onSelectPlan,
  disabled = false,
  showOnboardingNote = true,
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFDCBC] bg-white p-6 shadow-sm">
      {/* Coding geometry decorations — CSS only, no artwork */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-2 right-4 text-5xl font-mono font-bold text-[#00A9FF]/8 leading-none"
      >
        {"{"}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-2 left-4 text-5xl font-mono font-bold text-[#FFDCBC]/60 leading-none"
      >
        {"</>"}
      </span>

      {/* Headline */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#001D32] leading-tight mb-1">
          Pick your commitment.
          <br />
          Not just your price.
        </h2>
        <p className="text-sm text-slate-500">
          The longer you commit, the more Ignitio commits back.
        </p>
      </div>

      {/* Shared benefit pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {SHARED_BENEFITS.map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF8FF] border border-[#00A9FF]/20 px-3 py-1 text-[11px] font-semibold text-[#004B74]"
          >
            <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
            {b}
          </span>
        ))}
      </div>

      {/* Plan cards */}
      <div
        className="flex flex-col gap-3"
        role="radiogroup"
        aria-label="Premium billing plan"
      >
        {CLIENT_SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.slug;

          return (
            <button
              key={plan.slug}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectPlan(plan.slug)}
              className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-[#00A9FF] bg-[#EBF8FF] shadow-[0_0_0_4px_rgba(0,169,255,0.12)]"
                  : "border-[#FFDCBC] bg-white hover:border-[#4EC3FF]"
              } ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-2.5 left-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
                  plan.badge === "Hot Pick"
                    ? "bg-[#00A9FF]"
                    : "bg-amber-500"
                }`}>
                  {plan.badge}
                </span>
              )}

              <div className="flex items-center justify-between gap-2">
                <div>
                  <p
                    className={`font-bold text-base leading-tight ${
                      isSelected ? "text-[#001D32]" : "text-[#001D32]"
                    }`}
                  >
                    {plan.name}
                  </p>

                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-[#001D32]">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {plan.period}
                    </span>
                  </div>

                  {plan.helper && (
                    <p className="mt-1.5 text-[11px] font-bold text-[#00A9FF]">
                      {plan.helper}
                    </p>
                  )}
                </div>

                {/* Selection indicator */}
                <div
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-[#00A9FF] bg-[#00A9FF]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 text-white"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showOnboardingNote && (
        <p className="text-xs text-slate-400 mt-5 pt-4 border-t border-slate-100">
          Your role and learning schedule will be
          collected in the next step. Your personalized
          roadmap is built after you complete onboarding.
        </p>
      )}
    </div>
  );
}