import { Check, Zap } from "lucide-react";

import PremiumBenefits from "./PremiumBenefits";
import {
  CLIENT_SUBSCRIPTION_PLANS,
} from "../constants/plans";

export default function PremiumPlanCard({
  selectedPlan,
  onSelectPlan,
  disabled = false,
  showOnboardingNote = true,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-secondary/10 rounded-lg">
          <Zap
            className="w-5 h-5 text-foreground"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Ignitio Premium
          </h2>

          <p className="text-sm text-muted-foreground">
            Choose your billing plan. Cancel any time.
          </p>
        </div>
      </div>

      <div
        className="grid gap-3 mb-6 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Premium billing plan"
      >
        {CLIENT_SUBSCRIPTION_PLANS.map(
          (plan) => {
            const isSelected =
              selectedPlan === plan.slug;

            return (
              <button
                key={plan.slug}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() =>
                  onSelectPlan(plan.slug)
                }
                className={`relative rounded-xl border p-4 text-left transition-all ${isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:border-primary/40"
                  } ${disabled
                    ? "cursor-not-allowed opacity-60"
                    : ""
                  }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                    {plan.badge}
                  </span>
                ) : null}

                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">
                    {plan.name}
                  </span>

                  {isSelected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-bold">
                    {plan.price}
                  </span>

                  <span className="ml-1 text-xs text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                {plan.helper ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {plan.helper}
                  </p>
                ) : null}
              </button>
            );
          },
        )}
      </div>

      <PremiumBenefits />

      {showOnboardingNote ? (
        <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border">
          Your role and learning schedule will be
          collected in the next step. Your personalized
          roadmap is built after you complete onboarding.
        </p>
      ) : null}
    </div>
  );
}