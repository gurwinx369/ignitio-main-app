"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Globe2, Crown, User, Code2, Lock } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "worlds", label: "Worlds", icon: Globe2 },
  { id: "projects", label: "Projects", icon: Code2, locked: true },
  { id: "premium", label: "Premium", icon: Crown },
  { id: "profile", label: "Profile", icon: User },
];

export default function DashboardBottomNav({ activeTab, setActiveTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/home";

  const [hoveredItem, setHoveredItem] = useState(null);
  const [lockedTooltip, setLockedTooltip] = useState(null);

  const handleClick = (item) => {
    // Locked items — show tooltip, block navigation
    if (item.locked) {
      setLockedTooltip(item.id);
      setTimeout(() => setLockedTooltip(null), 2200);
      return;
    }

    if (item.id === "profile") {
      router.push("/home/profile");
      return;
    }

    if (isDashboard && typeof setActiveTab === "function") {
      setActiveTab(item.id);
      if (item.id === "home") {
        router.replace("/home", { scroll: false });
      } else {
        router.replace(`/home?tab=${item.id}`, { scroll: false });
      }
      return;
    }

    if (item.id === "home") {
      router.push("/home");
      return;
    }

    router.push(`/home?tab=${item.id}`);
  };

  const isActive = (item) => {
    if (item.locked) return false;
    if (item.id === "profile") {
      return pathname === "/home/profile";
    }
    if (!isDashboard) return false;
    return activeTab === item.id;
  };

  const activeItemId = NAV_ITEMS.find((item) => isActive(item))?.id;
  const currentHighlight = hoveredItem || activeItemId;

  return (
    <nav
      aria-label="Dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div
        onPointerLeave={() => setHoveredItem(null)}
        className="pointer-events-auto flex items-center justify-center gap-1 rounded-[18px] border border-[#DFC8B5] bg-[#F2E0D0] p-1.5 shadow-[0_10px_28px_rgba(25,24,59,0.16)]"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const isHighlighted = !item.locked && currentHighlight === item.id;
          const isLocked = item.locked;
          const showTooltip = lockedTooltip === item.id;
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative">
              {/* Coming Soon tooltip */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 pointer-events-none"
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#19183B] px-3 py-1.5 shadow-[0_6px_20px_rgba(25,24,59,0.35)]">
                      <Lock className="h-3 w-3 text-[#00A9FF] shrink-0" strokeWidth={2.5} />
                      <span className="text-[11px] font-bold text-white tracking-wide">Coming Soon</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#19183B]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                aria-label={isLocked ? `${item.label} — Coming Soon` : item.label}
                aria-current={active ? "page" : undefined}
                aria-disabled={isLocked}
                onPointerEnter={() => !isLocked && setHoveredItem(item.id)}
                onClick={() => handleClick(item)}
                className={[
                  "group relative flex min-h-[40px] sm:min-h-[44px] items-center justify-center gap-1 sm:gap-1.5 rounded-[13px]",
                  isHighlighted ? "px-3 sm:px-4" : "px-2 sm:px-3",
                  "text-[10px] sm:text-xs font-extrabold",
                  isLocked
                    ? "text-[#19183B]/40 cursor-not-allowed"
                    : "text-[#19183B]",
                  "transition-[padding] duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0CAA8]",
                  !isLocked && "active:translate-y-[2px] active:scale-[0.98]",
                ].join(" ")}
              >
                {isHighlighted && (
                  <motion.div
                    layoutId="bottom-nav-highlight"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    className="absolute inset-0 z-0 rounded-[13px] bg-[#00A9FF] shadow-[0_3px_0_#0085C7]"
                  />
                )}

                {!isHighlighted && !isLocked && (
                  <div className="absolute inset-0 z-0 rounded-[13px] bg-transparent transition-colors hover:bg-white/25" />
                )}

                {/* Locked dimmed background */}
                {isLocked && (
                  <div className="absolute inset-0 z-0 rounded-[13px] bg-black/5" />
                )}

                <div className="relative z-10 flex pointer-events-none items-center gap-1.5">
                  <div className="relative shrink-0">
                    <Icon
                      className={[
                        "h-[18px] w-[18px] transition-transform duration-150",
                        isHighlighted ? "scale-105" : !isLocked ? "group-hover:-translate-y-px" : "",
                        isLocked ? "opacity-40" : "",
                      ].join(" ")}
                      strokeWidth={2.1}
                      aria-hidden="true"
                    />
                    {/* Lock badge */}
                    {isLocked && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#19183B] shadow-sm">
                        <Lock className="h-2 w-2 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className={["whitespace-nowrap leading-none", isLocked ? "opacity-40" : ""].join(" ")}>
                    {item.label}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}