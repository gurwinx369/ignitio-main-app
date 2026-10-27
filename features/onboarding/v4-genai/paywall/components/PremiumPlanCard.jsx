"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Map,
  Hammer,
  Headphones,
  Infinity as InfinityIcon,
  Rocket,
  Users,
  Loader2,
} from "lucide-react";

/* -----------------------------------------------------------------------
   Redesign of PremiumPlanCard.
   Same prop contract as the original component (selectedPlan, onSelectPlan,
   disabled, showOnboardingNote) — this is a drop-in replacement.

   In production, swap the local PLANS array below back out for:
     import { CLIENT_SUBSCRIPTION_PLANS } from "../../constants/plans";
   As long as the three slugs stay ignitio_weekly / ignitio_monthly /
   ignitio_three_monthly, everything else below just works unchanged.
-------------------------------------------------------------------------- */

const PLANS = [
  { slug: "ignitio_weekly", name: "Weekly", price: "₹149", cadence: "/week" },
  {
    slug: "ignitio_monthly",
    name: "Monthly",
    price: "₹599",
    cadence: "/month",
  },
  {
    slug: "ignitio_three_monthly",
    name: "3 Months",
    price: "₹1,499",
    cadence: "",
  },
];

const COLORS = {
  ink: "#001D32",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  peach: "#FFDCBC",
  peachShade: "#EFB98A",
  white: "#FFFFFF",
  blue: "#00A9FF",
  blueDark: "#0089D1",
  blueTint: "#EBF8FF",
  gold: "#E2841C",
  goldDark: "#B8690D",
  goldTint: "#FFF3E2",
};

const ACCENTS = {
  blue: { solid: COLORS.blue, dark: COLORS.blueDark, tint: COLORS.blueTint },
  gold: { solid: COLORS.gold, dark: COLORS.goldDark, tint: COLORS.goldTint },
};

// Identity-first content: each tier is framed as a level of commitment,
// not a feature bundle. Price/duration stays concrete and unmissable —
// the emotional line sits next to it, never instead of it.
const PLAN_CONTENT = {
  ignitio_weekly: {
    identity: "Curious",
    dots: 1,
    accent: "blue",
    promise: "No big decision yet — just start showing up.",
    includesNote: null,
    features: [
      { Icon: Compass, label: "AI mentor (Kyle)" },
      { Icon: Map, label: "Your personalized roadmap" },
    ],
    helper: null,
    badge: null,
    cta: "I'm Curious",
  },
  ignitio_monthly: {
    identity: "Committed",
    dots: 2,
    accent: "blue",
    promise: "30 days of showing up — this is where builders live.",
    includesNote: "Everything in Curious, plus",
    features: [
      { Icon: Hammer, label: "A real project, every month" },
      { Icon: Headphones, label: "Priority support — real answers" },
    ],
    helper: "₹599/month · less than ₹20/day",
    badge: "mostPopular",
    cta: "I'm Committed",
  },
  ignitio_three_monthly: {
    identity: "All In",
    dots: 3,
    accent: "gold",
    promise:
      "One season, all in — how \u2018maybe\u2019 becomes \u2018placed\u2019.",
    includesNote: "Everything in Committed, plus",
    features: [
      { Icon: InfinityIcon, label: "Unlimited AI mentor" },
      { Icon: Rocket, label: "First access to everything next" },
    ],
    helper: "₹1,499 total · ≈₹500/month · save ₹298",
    badge: "bestValue",
    cta: "I'm All In",
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};
const tapSpring = { type: "spring", stiffness: 460, damping: 20 };

export default function PremiumPlanCard({
  selectedPlan,
  onSelectPlan,
  onContinue,
  disabled = false,
  isVerifying = false,
  showOnboardingNote = true,
  // Coupon props
  couponCode = "",
  onCouponChange,
  onApplyCoupon,
  couponLoading = false,
  appliedCoupon = null,
  couponError = null,
  secondaryAction = null,
}) {
  const [internal, setInternal] = useState("ignitio_monthly");
  const active = selectedPlan ?? internal;

  const isLocked = disabled || isVerifying;

  const select = (slug) => {
    if (isLocked) return;
    setInternal(slug);
    onSelectPlan?.(slug);
  };

  const activeContent = PLAN_CONTENT[active];
  const activeAccent = ACCENTS[activeContent.accent];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 rounded-3xl">
      {/* Cards */}
      <motion.div
        role="radiogroup"
        aria-label="Premium billing plan"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-5 md:items-end"
      >
        {PLANS.map((plan) => {
          const content = PLAN_CONTENT[plan.slug];
          const accent = ACCENTS[content.accent];
          const isSelected = active === plan.slug;
          const isHero = content.badge === "mostPopular";

          return (
            <motion.button
              key={plan.slug}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => select(plan.slug)}
              variants={cardVariants}
              whileTap={!disabled ? { scale: 0.97, transition: tapSpring } : {}}
              className={[
                "relative w-full rounded-2xl text-left transition-all duration-150",
                content.badge ? "mt-4 md:mt-6" : "",
                isHero ? "md:z-10 md:scale-105" : "",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ].join(" ")}
              style={{
                background: isSelected ? accent.solid : COLORS.white,
                border: `2px solid ${isSelected ? accent.dark : COLORS.peach}`,
                boxShadow: isSelected ? "none" : `0 5px 0 ${COLORS.peachShade}`,
                transform: isSelected ? "translateY(5px)" : "translateY(0px)",
              }}
            >
              {content.badge === "mostPopular" && (
                <span
                  className="absolute -top-3.5 left-4 z-20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  style={{ background: COLORS.blue }}
                >
                  Most popular
                </span>
              )}
              {content.badge === "bestValue" && (
                <span
                  className="absolute -top-3.5 left-4 z-20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  style={{ background: COLORS.gold }}
                >
                  Best value
                </span>
              )}

              <div className="p-4 sm:p-5">
                {/* identity label + commitment-level dots */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.85)"
                        : accent.solid,
                    }}
                  >
                    {content.identity}
                  </span>
                  <div className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            i < content.dots
                              ? isSelected
                                ? "rgba(255,255,255,0.9)"
                                : accent.solid
                              : isSelected
                                ? "rgba(255,255,255,0.3)"
                                : COLORS.peach,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* plan name + price — kept concrete and unmissable */}
                <p
                  className="font-bold text-base leading-tight mb-1"
                  style={{ color: isSelected ? COLORS.white : COLORS.ink }}
                >
                  {plan.name}
                  <span
                    className="font-normal mx-2"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.7)"
                        : COLORS.mutedLight,
                    }}
                  >
                    —
                  </span>
                  {plan.price}
                  <span className="text-sm font-normal">{plan.cadence}</span>
                </p>

                {/* identity / emotional promise line */}
                <p
                  className="text-xs italic mb-3 leading-snug"
                  style={{
                    color: isSelected ? "rgba(255,255,255,0.85)" : COLORS.muted,
                  }}
                >
                  {content.promise}
                </p>

                {content.includesNote && (
                  <p
                    className="text-xs mb-3 -mt-1"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.7)"
                        : COLORS.mutedLight,
                    }}
                  >
                    {content.includesNote}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  {content.features.map(({ Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: isSelected
                            ? "rgba(255,255,255,0.2)"
                            : accent.tint,
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{
                            color: isSelected ? COLORS.white : accent.solid,
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      <span
                        className="text-sm leading-snug"
                        style={{
                          color: isSelected ? COLORS.white : COLORS.ink,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {content.helper && (
                  <p
                    className="mt-3 text-xs font-semibold"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.85)"
                        : accent.solid,
                    }}
                  >
                    {content.helper}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Coupon section */}
      <div className="mt-6 rounded-2xl border border-[#FFDCBC] bg-white/60 p-4">
        <div className="mb-3">
          <p className="text-sm font-bold" style={{ color: COLORS.ink }}>
            Have a coupon code?
          </p>
          <p className="mt-1 text-xs" style={{ color: COLORS.muted }}>
            Enter a creator or promotional code before checkout.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponChange?.(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onApplyCoupon?.();
              }
            }}
            placeholder="e.g. HARRY20"
            maxLength={50}
            disabled={couponLoading || disabled}
            aria-label="Coupon code"
            className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#001D32] outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#00A9FF] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponLoading || disabled || !couponCode.trim()}
            className="rounded-xl bg-[#001D32] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-[#00304d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {couponLoading ? "CHECKING..." : "APPLY"}
          </button>
        </div>

        {appliedCoupon && (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-bold text-green-700">
              {appliedCoupon.code} applied
            </p>
            <p className="mt-1 text-xs text-green-600">
              Your promotional offer will be applied at checkout.
            </p>
          </div>
        )}

        {couponError && (
          <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
            {couponError}
          </p>
        )}
      </div>

      {/* trust line */}
      <div className="flex items-center justify-center gap-1.5 mt-8 mb-3">
        <Users className="w-3.5 h-3.5" style={{ color: COLORS.mutedLight }} />
        <span className="text-xs" style={{ color: COLORS.mutedLight }}>
          1,300+ students already building their roadmap
        </span>
      </div>

      {/* Identity CTA */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="button"
          disabled={isLocked}
          aria-busy={isVerifying}
          whileTap={!isLocked ? { scale: 0.97, transition: tapSpring } : {}}
          onClick={() => {
            if (isLocked) return;
            onContinue?.(active);
          }}
          className={[
            "w-full md:w-auto md:min-w-80 rounded-2xl px-8 py-4 font-extrabold text-base uppercase tracking-wide text-white flex items-center justify-center gap-3 transition-all duration-200",
            isLocked
              ? "opacity-60 cursor-not-allowed pointer-events-none select-none"
              : "cursor-pointer hover:brightness-105 active:translate-y-0.5",
          ].join(" ")}
          style={{
            background: activeAccent.solid,
            boxShadow: isLocked ? "none" : `0 5px 0 ${activeAccent.dark}`,
          }}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Securing Payment & Preparing Access…</span>
            </>
          ) : disabled ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Starting checkout…</span>
            </>
          ) : (
            <span>{activeContent.cta} →</span>
          )}
        </motion.button>
        {secondaryAction}
      </div>

      {showOnboardingNote && (
        <p
          className="text-xs mt-5 pt-4 border-t text-center leading-relaxed"
          style={{ color: COLORS.mutedLight, borderColor: "rgba(0,0,0,0.06)" }}
        >
          Your role & schedule come next — we'll build your roadmap the moment
          you're in.
        </p>
      )}
    </div>
  );
}
