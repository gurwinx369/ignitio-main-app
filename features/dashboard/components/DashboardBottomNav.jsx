"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Globe2, Crown, User } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "worlds", label: "Worlds", icon: Globe2 },
  { id: "premium", label: "Premium", icon: Crown },
  { id: "profile", label: "Profile", icon: User },
];

export default function DashboardBottomNav({ activeTab, setActiveTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/home";

  const [hoveredItem, setHoveredItem] = useState(null);

  const handleClick = (item) => {
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
    if (item.id === "profile") {
      return pathname === "/home/profile";
    }
    if (!isDashboard) {
      return false;
    }
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
          const isHighlighted = currentHighlight === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onPointerEnter={() => setHoveredItem(item.id)}
              onClick={() => handleClick(item)}
              className={[
                "group relative flex min-h-[44px] items-center justify-center gap-1.5 rounded-[13px]",
                isHighlighted ? "px-3.5 sm:px-4" : "px-2.5 sm:px-3",
                "text-[11px] sm:text-xs font-extrabold text-[#19183B]",
                "transition-[padding] duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0CAA8]",
                "active:translate-y-[2px] active:scale-[0.98]",
              ].join(" ")}
            >
              {isHighlighted && (
                <motion.div
                  layoutId="bottom-nav-highlight"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  className="absolute inset-0 z-0 rounded-[13px] bg-[#00A9FF] shadow-[0_3px_0_#0085C7]"
                />
              )}

              {!isHighlighted && (
                <div className="absolute inset-0 z-0 rounded-[13px] bg-transparent transition-colors hover:bg-white/25" />
              )}

              <div className="relative z-10 flex pointer-events-none items-center gap-1.5">
                <Icon
                  className={[
                    "h-[18px] w-[18px] shrink-0 transition-transform duration-150",
                    isHighlighted ? "scale-105" : "group-hover:-translate-y-px",
                  ].join(" ")}
                  strokeWidth={2.1}
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap leading-none">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}