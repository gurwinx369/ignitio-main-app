import { SKIP_MARKER } from "../constants/skipMarker";

export default function DiagnosticNav({
  onContinue,
  canContinue,
  skippable,
  onSkip,
  isSubmitting,
}) {
  const disabled = !canContinue || isSubmitting;

  return (
    <>
      {skippable && (
        <button
          type="button"
          onClick={() => onSkip(SKIP_MARKER)}
          disabled={isSubmitting}
          className="w-full py-3 text-[#4A5568] font-semibold text-[15px] hover:text-[#001D32] transition-colors disabled:opacity-50"
        >
          Skip
        </button>
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={disabled}
        className="diag-continue-btn w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] hover:bg-[#0096e6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Saving…" : "Continue"}
      </button>
    </>
  );
}
