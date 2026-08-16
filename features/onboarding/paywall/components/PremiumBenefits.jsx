import { CheckCircle2 } from "lucide-react";

const BENEFITS = [
  {
    id: "personalized",
    text: "Diagnostic-personalized roadmap — built from your actual answers.",
  },
  {
    id: "compression",
    text: "Skill-based compression where competence was demonstrated.",
  },
  {
    id: "refreshers",
    text: "Focused refreshers for areas that need targeted practice.",
  },
  {
    id: "genai",
    text: "Premium GenAI roadmap access with curated learning paths.",
  },
  {
    id: "kyle",
    text: "Role-aware guidance with Kyle integration where supported.",
  },
  {
    id: "cancel",
    text: "Cancel at the end of your billing cycle — no lock-in.",
  },
];

export default function PremiumBenefits() {
  return (
    <ul className="space-y-3">
      {BENEFITS.map((b) => (
        <li key={b.id} className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" aria-hidden="true" />
          <span className="text-sm text-foreground leading-snug">{b.text}</span>
        </li>
      ))}
    </ul>
  );
}
