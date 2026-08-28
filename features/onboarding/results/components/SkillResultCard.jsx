import {
  AlertCircle,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  passed: {
    Icon: CheckCircle2,
    iconClassName: "text-success",
    label: "Strength confirmed",
  },
  partial: {
    Icon: AlertCircle,
    iconClassName: "text-primary",
    label: "Light refresher",
  },
  needs_work: {
    Icon: AlertCircle,
    iconClassName: "text-warning",
    label: "Recommended to keep",
  },
  skipped: {
    Icon: MinusCircle,
    iconClassName: "text-muted-foreground",
    label: "Check skipped",
  },
  not_assessed: {
    Icon: MinusCircle,
    iconClassName: "text-primary",
    label: "Included in roadmap",
  },
};

export default function SkillResultCard({ area }) {
  const {
    title,
    status,
    explanation,
    moduleLabel,
  } = area;

  const {
    Icon,
    iconClassName,
    label,
  } =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.needs_work;

  return (
    <div className="flex h-full flex-col rounded-2xl border-2 border-[#FFDCBC] bg-white p-5 shadow-sm hover:border-[#4EC3FF] transition-colors">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold leading-tight text-[#001D32]">
          {title}
        </h3>

        <span className="ml-2 whitespace-nowrap rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
          {moduleLabel}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Icon
          aria-hidden="true"
          className={`h-5 w-5 ${iconClassName.replace('text-success', 'text-[#00A9FF]').replace('text-primary', 'text-purple-600').replace('text-warning', 'text-orange-500')}`}
        />

        <span
          className={`text-sm font-semibold ${iconClassName.replace('text-success', 'text-[#00A9FF]').replace('text-primary', 'text-purple-600').replace('text-warning', 'text-orange-500')}`}
        >
          {label}
        </span>
      </div>

      <p className="mt-auto flex-grow text-sm leading-relaxed text-slate-600">
        {explanation}
      </p>
    </div>
  );
}