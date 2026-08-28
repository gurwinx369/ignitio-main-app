import { Loader2 } from "lucide-react";

/**
 * PaywallActions — "Unlock Premium" and "Continue with Foundation" buttons.
 *
 * @param {boolean} isPremiumLoading  — Premium checkout in progress
 * @param {boolean} isSkipping        — Foundation skip in progress
 * @param {function} onPremium        — Called when user clicks Unlock Premium
 * @param {function} onSkip           — Called when user clicks Continue with Foundation
 */
export default function PaywallActions({ isPremiumLoading, isSkipping, onPremium, onSkip }) {
  const isAnyLoading = isPremiumLoading || isSkipping;

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Primary: Premium */}
      <button
        id="paywall-premium-btn"
        onClick={onPremium}
        disabled={isAnyLoading}
        aria-busy={isPremiumLoading}
        className="w-full py-4 px-8 rounded-full bg-[#00A9FF] text-white text-lg font-bold uppercase tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#0096e6] active:translate-y-1"
        style={{ boxShadow: isPremiumLoading ? "none" : "0 4px 0 #004B74" }}
      >
        {isPremiumLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>OPENING CHECKOUT...</span>
          </>
        ) : (
          <span>UNLOCK PREMIUM</span>
        )}
      </button>

      {/* Secondary: Foundation */}
      <button
        id="paywall-skip-btn"
        onClick={onSkip}
        disabled={isAnyLoading}
        aria-busy={isSkipping}
        className="w-full py-4 px-8 rounded-full border-2 border-[#FFDCBC] bg-white text-[#001D32] text-base font-bold hover:border-[#4EC3FF] active:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSkipping ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>CONTINUING...</span>
          </>
        ) : (
          <span>CONTINUE WITH FOUNDATION</span>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground px-4">
        Foundation gives you access to a standard learning path. You can still choose your role,
        set your schedule, and complete onboarding — without the personalized Premium roadmap.
      </p>
    </div>
  );
}
