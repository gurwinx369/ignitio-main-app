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
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold leading-tight">
          {title}
        </h3>

        <span className="ml-2 whitespace-nowrap rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
          {moduleLabel}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Icon
          aria-hidden="true"
          className={`h-5 w-5 ${iconClassName}`}
        />

        <span
          className={`text-sm font-semibold ${iconClassName}`}
        >
          {label}
        </span>
      </div>

      <p className="mt-auto flex-grow text-sm leading-relaxed text-muted-foreground">
        {explanation}
      </p>
    </div>
  );
}