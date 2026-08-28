import { Loader2 } from "lucide-react";

export default function ResultsActions({ onContinue, isContinuing }) {
  return (
    <div className="mt-12 mb-8 flex justify-center sticky bottom-6 z-10 px-4">
      <button
        onClick={onContinue}
        disabled={isContinuing}
        className="w-full max-w-md py-4 px-8 rounded-full bg-[#00A9FF] text-white text-lg font-bold uppercase tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#0096e6] active:translate-y-1"
        style={{ boxShadow: isContinuing ? "none" : "0 4px 0 #004B74" }}
      >
        {isContinuing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>PROCESSING...</span>
          </>
        ) : (
          <span>CONTINUE</span>
        )}
      </button>
    </div>
  );
}
