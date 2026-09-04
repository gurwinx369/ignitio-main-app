export default function DiagnosticProgress({ current, total }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div
      className="w-full max-w-[200px]"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Diagnostic progress: ${current} of ${total}`}
    >
      <div className="h-2 w-full bg-[#E5F6FF] rounded-full overflow-hidden shadow-sm">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: "#00A9FF" }}
        />
      </div>
    </div>
  );
}
