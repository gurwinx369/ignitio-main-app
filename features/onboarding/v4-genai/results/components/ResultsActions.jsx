import { Loader2 } from "lucide-react";

export default function ResultsActions({ onContinue, isContinuing }) {
  return (
    <div className="mt-12 mb-8 flex justify-center sticky bottom-6 z-10 px-4">
      <button
        onClick={onContinue}
        disabled={isContinuing}
        className="btn-push w-full max-w-md py-4 px-8 rounded-full bg-[#00A9FF] border-[#004B74] text-white text-lg font-bold uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#0096e6]"
      >
        {isContinuing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>PROCESSING...</span>
          </>
        ) : (
          <span>START MY JOURNEY</span>
        )}
      </button>
    </div>
  );
}
