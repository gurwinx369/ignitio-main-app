"use client";

import { useRouter } from "next/navigation";
import { Home, Globe2, Crown, User } from "lucide-react";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    type: "tab",
  },
  {
    id: "worlds",
    label: "Worlds",
    icon: Globe2,
    type: "tab",
  },
  {
    id: "premium",
    label: "Premium",
    icon: Crown,
    type: "tab",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    type: "route",
    href: "/home/profile",
  },
];

export default function DashboardBottomNav({ activeTab, setActiveTab }) {
  const router = useRouter();

  const handleClick = (item) => {
    if (item.type === "route") {
      router.push(item.href);
    } else {
      setActiveTab(item.id);
    }
  };

  const isActive = (item) => {
    if (item.type === "route") return false;
    return activeTab === item.id;
  };

  return (
    <nav
      aria-label="Dashboard navigation"
      className={[
        // Fixed positioning
        "fixed bottom-0 left-0 right-0 z-50",
        // Safe area for iOS notched devices
        "pb-[env(safe-area-inset-bottom)]",
        // Pointer events passthrough outside the pill
        "pointer-events-none",
        "flex items-end justify-center",
        // Small gap from true bottom edge on devices without notch
        "mb-4",
      ].join(" ")}
    >
      {/* Pill container */}
      <div
        className={[
          "pointer-events-auto",
          // Desktop: compact centered pill
          "mx-auto",
          "w-[calc(100%-2rem)] max-w-xs sm:max-w-sm",
          // Card styling
          "bg-white/95 backdrop-blur-md",
          "border border-slate-200",
          "rounded-2xl",
          "shadow-lg shadow-slate-900/10",
          // Layout
          "grid grid-cols-4",
          "p-1",
          "gap-0.5",
        ].join(" ")}
        role="tablist"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              role={item.type === "tab" ? "tab" : "button"}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => handleClick(item)}
              className={[
                // Base
                "flex flex-col items-center justify-center gap-0.5",
                // Min touch target (44px)
                "min-h-[44px]",
                "px-1 py-2",
                "rounded-xl",
                "text-xs font-semibold",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4] focus-visible:ring-offset-1",
                // Active vs inactive
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
              ].join(" ")}
            >
              <Icon
                className="w-[18px] h-[18px] shrink-0"
                aria-hidden="true"
              />
              <span className="truncate leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
