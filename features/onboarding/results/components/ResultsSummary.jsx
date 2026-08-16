export default function ResultsSummary({ summary }) {
  const {
    passedChecks = 0,
    partialChecks = 0,
    needsWorkChecks = 0,
    skippedChecks = 0,
    notAssessedChecks = 0,
    assessedChecks = 0,
    compressionLabel = "No compression applied",
  } = summary;

  const cards = [
    {
      id: "passed",
      value: passedChecks,
      label: "Strengths confirmed",
      valueClassName: "text-success",
    },
    {
      id: "partial",
      value: partialChecks,
      label: "Light refreshers",
      valueClassName: "text-primary",
    },
    {
      id: "needs-work",
      value: needsWorkChecks,
      label: "Areas retained",
      valueClassName: "text-warning",
    },
    {
      id: "skipped",
      value: skippedChecks,
      label: "Checks skipped",
      valueClassName: "text-muted-foreground",
    },
    {
      id: "not-assessed",
      value: notAssessedChecks,
      label: "Checks not required",
      valueClassName: "text-muted-foreground",
    },
    {
      id: "assessed",
      value: assessedChecks,
      label: "Checks assessed",
      valueClassName: "text-foreground",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="mb-6 border-b border-border pb-4 text-xl font-bold">
        Diagnostic Summary
      </h2>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col items-center rounded-xl border border-border bg-background p-4 text-center"
          >
            <span
              className={`mb-1 text-3xl font-bold ${card.valueClassName}`}
            >
              {card.value}
            </span>

            <span className="text-sm font-medium text-muted-foreground">
              {card.label}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
        <p className="font-semibold text-secondary-foreground">
          {compressionLabel}
        </p>
      </div>
    </div>
  );
}