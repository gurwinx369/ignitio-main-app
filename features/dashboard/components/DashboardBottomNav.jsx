"use client";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Home,
  Globe2,
  Crown,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
  },

  {
    id: "worlds",
    label: "Worlds",
    icon: Globe2,
  },

  {
    id: "premium",
    label: "Premium",
    icon: Crown,
  },

  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
];

export default function DashboardBottomNav({
  activeTab,
  setActiveTab,
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const isDashboard =
    pathname === "/home";

  const handleClick =
    (item) => {
      /*
       * Profile is always a real route.
       */
      if (
        item.id === "profile"
      ) {
        router.push(
          "/home/profile",
        );

        return;
      }

      /*
       * Already on Dashboard:
       * preserve the existing in-page tab system.
       */
      if (
        isDashboard &&
        typeof setActiveTab ===
        "function"
      ) {
        setActiveTab(
          item.id,
        );

        if (
          item.id === "home"
        ) {
          router.replace(
            "/home",
            {
              scroll: false,
            },
          );
        } else {
          router.replace(
            `/home?tab=${item.id}`,
            {
              scroll: false,
            },
          );
        }

        return;
      }

      /*
       * From Profile or another child route,
       * return to the requested dashboard surface.
       */
      if (
        item.id === "home"
      ) {
        router.push(
          "/home",
        );

        return;
      }

      router.push(
        `/home?tab=${item.id}`,
      );
    };

  const isActive =
    (item) => {
      if (
        item.id === "profile"
      ) {
        return (
          pathname ===
          "/home/profile"
        );
      }

      if (!isDashboard) {
        return false;
      }

      return (
        activeTab ===
        item.id
      );
    };

  return (
    <nav
      aria-label="Dashboard navigation"
      className="
        fixed
        inset-x-0
        bottom-0
        z-50

        flex
        justify-center

        px-3

        pb-[calc(12px+env(safe-area-inset-bottom))]

        pointer-events-none
      "
    >
      <div
        className="
          pointer-events-auto

          flex
          items-center
          justify-center
          gap-1

          rounded-[18px]

          border
          border-[#DFC8B5]

          bg-[#F2E0D0]

          p-1.5

          shadow-[0_10px_28px_rgba(25,24,59,0.16)]
        "
      >
        {NAV_ITEMS.map(
          (item) => {
            const active =
              isActive(
                item,
              );

            const Icon =
              item.icon;

            return (
              <button
                key={
                  item.id
                }
                type="button"
                aria-label={
                  item.label
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  handleClick(
                    item,
                  )
                }
                className={[
                  "group",

                  "flex min-h-[44px] items-center justify-center gap-1.5",

                  "rounded-[13px]",

                  "px-2.5 sm:px-3",

                  "text-[11px] sm:text-xs",

                  "font-extrabold",

                  "text-[#19183B]",

                  "transition-[transform,background-color,box-shadow,padding]",

                  "duration-150 ease-out",

                  "focus-visible:outline-none",

                  "focus-visible:ring-2",

                  "focus-visible:ring-[#00A9FF]",

                  "focus-visible:ring-offset-2",

                  "focus-visible:ring-offset-[#F0CAA8]",

                  "active:translate-y-[2px]",

                  "active:scale-[0.98]",

                  active
                    ? [
                      "bg-[#00A9FF]",
                      "px-3.5 sm:px-4",
                      "shadow-[0_3px_0_#0085C7]",
                      "active:shadow-[0_1px_0_#0085C7]",
                    ].join(
                      " ",
                    )
                    : "bg-transparent hover:bg-white/25",
                ].join(
                  " ",
                )}
              >
                <Icon
                  className={[
                    "h-[18px] w-[18px] shrink-0",

                    "transition-transform duration-150",

                    active
                      ? "scale-105"
                      : "group-hover:-translate-y-px",
                  ].join(
                    " ",
                  )}
                  strokeWidth={
                    2.1
                  }
                  aria-hidden="true"
                />

                <span className="whitespace-nowrap leading-none">
                  {
                    item.label
                  }
                </span>
              </button>
            );
          },
        )}
      </div>
    </nav>
  );
}