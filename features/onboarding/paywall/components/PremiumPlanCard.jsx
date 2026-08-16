import { Zap } from "lucide-react";
import PremiumBenefits from "./PremiumBenefits";

export default function PremiumPlanCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-secondary/10 rounded-lg">
          <Zap className="w-5 h-5 text-foreground" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ignitio Premium</h2>
          <p className="text-sm text-muted-foreground">Monthly, cancel any time</p>
        </div>
      </div>
      <PremiumBenefits />
      <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border">
        Your role and learning schedule will be collected in the next step.
        Your personalized roadmap is built after you complete onboarding.
      </p>
    </div>
  );
}
