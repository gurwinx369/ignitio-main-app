import { Loader2 } from "lucide-react";

export default function ResultsActions({ onContinue, isContinuing }) {
  return (
    <div className="mt-12 mb-8 flex justify-center sticky bottom-6 z-10 px-4">
      <button
        onClick={onContinue}
        disabled={isContinuing}
        className="w-full max-w-md py-4 px-8 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isContinuing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Continue</span>
        )}
      </button>
    </div>
  );
}
