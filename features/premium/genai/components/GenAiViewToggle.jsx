"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * GenAiViewToggle
 *
 * A two-option sliding-pill toggle ("Levels" | "Projects") with a spring/jelly
 * easing on the highlight pill — cubic-bezier(0.34, 1.56, 0.64, 1) overshoots
 * ~10% then settles, giving the "jelly" feel requested.
 *
 * Falls back to an instant switch when prefers-reduced-motion is active.
 *
 * Props:
 *   activeView  "levels" | "projects"
 *   onChange    (view: "levels" | "projects") => void
 */
export default function GenAiViewToggle({ activeView, onChange }) {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);

        const handler = (e) => setReducedMotion(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const isProjects = activeView === "projects";

    const pillStyle = {
        transform: isProjects ? "translateX(100%)" : "translateX(0%)",
        transition: reducedMotion
            ? "none"
            : "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
    };

    return (
        <div
            role="group"
            aria-label="View toggle"
            className="relative inline-flex items-center rounded-full bg-white/70 backdrop-blur-md border border-gray-200/60 p-1 shadow-sm"
        >
            {/* Sliding jelly highlight pill */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-slate-900 shadow-md"
                style={pillStyle}
            />

            <button
                type="button"
                onClick={() => onChange("levels")}
                aria-pressed={!isProjects}
                className={`relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    !isProjects ? "text-white" : "text-gray-600 hover:text-slate-900"
                }`}
            >
                Levels
            </button>

            <button
                type="button"
                onClick={() => onChange("projects")}
                aria-pressed={isProjects}
                className={`relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    isProjects ? "text-white" : "text-gray-600 hover:text-slate-900"
                }`}
            >
                Projects
            </button>
        </div>
    );
}
