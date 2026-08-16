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
        className="w-full py-4 px-8 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPremiumLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Opening checkout...</span>
          </>
        ) : (
          <span>Unlock Premium</span>
        )}
      </button>

      {/* Secondary: Foundation */}
      <button
        id="paywall-skip-btn"
        onClick={onSkip}
        disabled={isAnyLoading}
        aria-busy={isSkipping}
        className="w-full py-3 px-8 rounded-full border border-border bg-background text-foreground text-base font-semibold hover:bg-muted/50 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSkipping ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Continuing...</span>
          </>
        ) : (
          <span>Continue with Foundation</span>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground px-4">
        Foundation gives you access to a standard learning path. You can still choose your role,
        set your schedule, and complete onboarding — without the personalized Premium roadmap.
      </p>
    </div>
  );
}
