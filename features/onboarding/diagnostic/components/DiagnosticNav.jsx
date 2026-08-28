import { SKIP_MARKER } from "../constants/skipMarker";

export default function DiagnosticNav({ 
  onContinue, 
  canContinue, 
  skippable, 
  onSkip,
  isSubmitting 
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6">
      <div />
      <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-end flex-col-reverse sm:flex-row">
        {skippable && (
          <button
            type="button"
            onClick={() => onSkip(SKIP_MARKER)}
            disabled={isSubmitting}
            className="text-[#001D32] hover:bg-slate-200/50 px-4 py-3 sm:py-2 rounded-full font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSubmitting}
          className="bg-[#00A9FF] text-white px-8 py-4 sm:py-3 w-full sm:w-auto rounded-full font-bold uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#0096e6] active:translate-y-1"
          style={{
            boxShadow: (!canContinue || isSubmitting) ? "none" : "0 4px 0 #004B74"
          }}
        >
          {isSubmitting ? "SAVING..." : "CONTINUE"}
        </button>
      </div>
    </div>
  );
}
