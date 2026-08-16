import { SKIP_MARKER } from "../constants/skipMarker";

export default function DiagnosticNav({ 
  canGoBack, 
  onBack, 
  onContinue, 
  canContinue, 
  skippable, 
  onSkip,
  isSubmitting 
}) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
      <div>
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {skippable && (
          <button
            type="button"
            onClick={() => onSkip(SKIP_MARKER)}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
