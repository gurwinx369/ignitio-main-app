import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";

/**
 * PaywallActions — Primary CTA and Foundation fallback link.
 *
 * @param {boolean} isPremiumLoading  — Premium checkout in progress
 * @param {boolean} isSkipping        — Foundation skip in progress
 * @param {function} onPremium        — Called when user clicks the primary CTA
 * @param {function} onSkip           — Called when user clicks Continue with Foundation
 */
export default function PaywallActions({ isPremiumLoading, isSkipping, onPremium, onSkip }) {
  const isAnyLoading = isPremiumLoading || isSkipping;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {/* Primary CTA */}
      <motion.button
        id="paywall-premium-btn"
        onClick={onPremium}
        disabled={isAnyLoading}
        aria-busy={isPremiumLoading}
        whileTap={
          !isAnyLoading
            ? { scale: 0.98, y: 2, transition: { type: "spring", stiffness: 400, damping: 20 } }
            : {}
        }
        className="w-full py-4 px-8 rounded-full bg-[#00A9FF] text-white text-base font-bold uppercase tracking-wide transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#0096e6]"
        style={isPremiumLoading ? {} : { boxShadow: "0 4px 0 #004B74" }}
      >
        {isPremiumLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Opening checkout…</span>
          </>
        ) : (
          <span>START MY PLAN</span>
        )}
      </motion.button>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>Secure payment · Cancel anytime · No hidden fees</span>
      </div>

      {/* Foundation fallback — subtle bordered pill so users can clearly see it's clickable */}
      <button
        id="paywall-skip-btn"
        onClick={onSkip}
        disabled={isAnyLoading}
        aria-busy={isSkipping}
        className="mt-2 w-full py-3 px-6 rounded-full border border-slate-300 bg-white/60 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-white active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        {isSkipping ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span>Continuing…</span>
          </>
        ) : (
          <span>Continue with Foundation (free, limited access)</span>
        )}
      </button>
    </div>
  );
}
