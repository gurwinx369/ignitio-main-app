"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { delay } from "@/lib/onboarding/reveal-utils";

export function RoadmapIntro({
  exiting,
  title = "Preparing roadmap",
  steps = [],
  icon: Icon,
  theme = "beige",
  className = "",
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setOn(true), 30);
    return () => window.clearTimeout(id);
  }, []);

  const isBeige = theme === "beige";

  return (
    <div
      data-on={on}
      data-exiting={exiting}
      role="status"
      aria-live="polite"
      className={`rm-intro flex h-full w-full flex-col items-center justify-center px-6 text-center ${
        isBeige ? "bg-[#FCF5EE] text-[#13122e]" : "bg-ig-bg text-ig-text"
      } ${className || "fixed inset-0 z-50"}`}
    >
      <div className="relative size-28">
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            strokeWidth="4"
            className={isBeige ? "stroke-[#e5dbcf]" : "stroke-ig-text/10"}
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={1}
            className={`rm-ring ${isBeige ? "stroke-[#00a9ff]" : "stroke-ig-cyan-soft"}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon && (
            <Icon
              aria-hidden="true"
              className={`rm-float size-9 ${isBeige ? "text-[#00a9ff]" : "text-ig-cyan-soft"}`}
            />
          )}
        </div>
      </div>

      <h2
        className={`rm-reveal rm-fade mt-7 text-xl font-extrabold tracking-tight ${
          isBeige ? "text-[#13122e]" : "text-ig-text"
        }`}
        style={delay(100)}
      >
        {title}
      </h2>

      <ul className="mt-5 flex flex-col gap-3 text-left">
        {steps.map((step) => (
          <li
            key={step.label}
            className={`rm-reveal rm-slide flex items-center gap-3 text-sm font-medium ${
              isBeige ? "text-[#4b4969]" : "text-ig-muted"
            }`}
            style={delay(step.at)}
          >
            <span
              aria-hidden="true"
              className={`rm-node flex size-5 items-center justify-center rounded-full ${
                isBeige
                  ? "bg-[#00a9ff] text-white shadow-sm"
                  : "bg-ig-teal text-ig-bg"
              }`}
              style={delay(step.at + 260)}
            >
              <Check className="size-3" strokeWidth={3.5} />
            </span>
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
