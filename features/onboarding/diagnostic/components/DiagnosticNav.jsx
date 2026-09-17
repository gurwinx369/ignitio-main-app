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
          className="btn-push-sm w-full py-3 text-[#4A5568] font-semibold text-[15px] bg-[#f9ebe0] border-[#e8e8f0] hover:text-[#001D32] disabled:opacity-50 rounded-xl"
        >
          Skip
        </button>
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={disabled}
        className="btn-push w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] border-[#007bcc] hover:bg-[#0096e6] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Saving…" : "Continue"}
      </button>
    </>
  );
}
