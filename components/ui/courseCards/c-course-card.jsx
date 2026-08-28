"use client";

import { useEffect, useState } from "react";
import {
  useCardLoader,
  SpinnerIcon,
  SuccessIcon,
  StatusBadge,
  CardInfoShimmer,
  LevelSquaresLoading,
} from "./CardLoader";
import { clangBeginnerRoadmapData } from "@/data/clangBeginnerRoadmap";

const ANIM_STYLE = `
@keyframes c-cursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

@keyframes c-run-pulse {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
}

@keyframes c-terminal-in {
    from {
        opacity: 0;
        transform: translateY(7px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes c-output-in {
    from {
        opacity: 0;
        transform: translateX(-5px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
`;

const CODE_LINES = [
  {
    tokens: [
      { t: "#include ", c: "#c678dd" },
      { t: "<stdio.h>", c: "#98c379" },
    ],
  },
  {
    tokens: [],
  },
  {
    tokens: [
      { t: "int ", c: "#c678dd" },
      { t: "main", c: "#61afef" },
      { t: "() {", c: "#abb2bf" },
    ],
  },
  {
    tokens: [
      { t: "    printf", c: "#61afef" },
      { t: "(", c: "#abb2bf" },
      { t: '"Hello, C!\\n"', c: "#98c379" },
      { t: ");", c: "#abb2bf" },
    ],
  },
  {
    tokens: [
      { t: "    ", c: "#abb2bf" },
      { t: "return ", c: "#c678dd" },
      { t: "0;", c: "#d19a66" },
    ],
  },
  {
    tokens: [{ t: "}", c: "#abb2bf" }],
  },
];

function getLineLength(line) {
  return line.tokens.reduce((total, token) => total + token.t.length, 0);
}

function renderVisibleTokens(tokens, visibleCharacters) {
  let remaining = visibleCharacters;

  return tokens.map((token, tokenIndex) => {
    if (remaining <= 0) {
      return null;
    }

    const visibleText = token.t.slice(0, remaining);
    remaining -= token.t.length;

    return (
      <span key={tokenIndex} style={{ color: token.c }}>
        {visibleText}
      </span>
    );
  });
}

function CCodeVisual() {
  const [phase, setPhase] = useState("typing");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };

    handleChange();

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    let timer;

    if (phase === "typing") {
      if (lineIndex >= CODE_LINES.length) {
        timer = setTimeout(() => {
          setPhase("running");
        }, 280);

        return () => clearTimeout(timer);
      }

      const currentLine = CODE_LINES[lineIndex];

      const currentLineLength = getLineLength(currentLine);

      if (currentLineLength === 0) {
        timer = setTimeout(() => {
          setLineIndex((current) => current + 1);
          setCharIndex(0);
        }, 150);

        return () => clearTimeout(timer);
      }

      if (charIndex < currentLineLength) {
        timer = setTimeout(() => {
          setCharIndex((current) => current + 1);
        }, 42);

        return () => clearTimeout(timer);
      }

      timer = setTimeout(() => {
        setLineIndex((current) => current + 1);
        setCharIndex(0);
      }, 190);
    } else if (phase === "running") {
      timer = setTimeout(() => {
        setPhase("output");
      }, 750);
    } else if (phase === "output") {
      timer = setTimeout(() => {
        setPhase("typing");
        setLineIndex(0);
        setCharIndex(0);
      }, 2600);
    }

    return () => clearTimeout(timer);
  }, [phase, lineIndex, charIndex, reducedMotion]);

  const outputVisible = reducedMotion || phase === "output";
  const running = !reducedMotion && phase === "running";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: "'Fira Code', 'Consolas', monospace",
      }}
    >
      <style>{ANIM_STYLE}</style>

      {/* Header bar */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          height: 38,
          background: "rgba(15,23,42,0.65)",
          borderBottom: "1px solid rgba(148,163,184,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ef4444",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#eab308",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 10.5,
            color: "#94a3b8",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          main.c
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: running ? "#60a5fa" : "#64748b",
            transition: "color 0.2s ease",
          }}
        >
          <span
            style={{
              fontSize: 8,
              transform: "translateY(-0.5px)",
            }}
          >
            ▶
          </span>

          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {running ? "Running" : "Run"}
          </span>
        </div>
      </div>

      {/* Code editor */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "15px 17px 0",
          fontSize: 12.5,
          lineHeight: 1.7,
        }}
      >
        {CODE_LINES.map((line, index) => {
          const lineLength = getLineLength(line);

          let visibleCharacters = 0;

          if (reducedMotion) {
            visibleCharacters = lineLength;
          } else if (index < lineIndex) {
            visibleCharacters = lineLength;
          } else if (index === lineIndex && phase === "typing") {
            visibleCharacters = charIndex;
          }

          const isActiveLine =
            !reducedMotion && phase === "typing" && index === lineIndex;

          return (
            <div
              key={index}
              style={{
                minHeight: "1.7em",
                display: "flex",
                alignItems: "center",
                position: "relative",
                borderRadius: 4,
                background: isActiveLine
                  ? "rgba(96,165,250,0.055)"
                  : "transparent",
                transition: "background 0.2s ease",
              }}
            >
              <span
                style={{
                  width: 25,
                  flexShrink: 0,
                  color: isActiveLine ? "#64748b" : "#475569",
                  fontSize: 10,
                  userSelect: "none",
                  textAlign: "right",
                  paddingRight: 10,
                  transition: "color 0.2s ease",
                }}
              >
                {index + 1}
              </span>

              <span
                style={{
                  whiteSpace: "pre",
                  minHeight: "1em",
                }}
              >
                {renderVisibleTokens(line.tokens, visibleCharacters)}

                {isActiveLine && lineLength > 0 && charIndex <= lineLength && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: "1em",
                      background: "#60a5fa",
                      verticalAlign: "text-bottom",
                      marginLeft: 1,
                      animation: "c-cursor 0.85s step-end infinite",
                    }}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Running state */}
      {running && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            margin: "11px 17px 0",
            padding: "7px 10px",
            borderRadius: 6,
            color: "#94a3b8",
            fontSize: 10,
            background: "rgba(15,23,42,0.62)",
            border: "1px solid rgba(148,163,184,0.10)",
            display: "flex",
            alignItems: "center",
            gap: 7,
            animation: "c-run-pulse 0.9s ease-in-out infinite",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#98c379",
              boxShadow: "0 0 9px rgba(152,195,121,0.45)",
            }}
          />
          Compiling main.c...
        </div>
      )}

      {/* Terminal output */}
      {outputVisible && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            margin: "11px 17px 0",
            borderRadius: 7,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.10)",
            background: "rgba(15,23,42,0.82)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            animation: reducedMotion
              ? "none"
              : "c-terminal-in 0.34s ease forwards",
          }}
        >
          <div
            style={{
              height: 25,
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              color: "#64748b",
              fontSize: 9,
              background: "rgba(30,41,59,0.72)",
              borderBottom: "1px solid rgba(148,163,184,0.08)",
            }}
          >
            TERMINAL
          </div>

          <div
            style={{
              minHeight: 37,
              padding: "9px 10px",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span
              style={{
                color: "#98c379",
                fontSize: 11,
              }}
            >
              ✓
            </span>

            <span
              style={{
                color: "#98c379",
                fontSize: 11.5,
                animation: reducedMotion
                  ? "none"
                  : "c-output-in 0.35s ease forwards",
              }}
            >
              Hello, C!
            </span>
          </div>
        </div>
      )}

      {/* C watermark */}
      <div
        style={{
          position: "absolute",
          right: 15,
          bottom: 11,
          zIndex: 1,
          fontSize: 32,
          fontWeight: 700,
          color: "#f97316",
          opacity: 0.12,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        C
      </div>
    </div>
  );
}

export default function CCourseCard({
  onClick,
  status = "Not Started",
  levelsFinished = 0,
  totalLevels,
}) {
  const allLevels = clangBeginnerRoadmapData.days.flatMap((day) => day.levels);

  const calculatedTotal = allLevels.length;

  const totalMinutes = allLevels.reduce(
    (acc, level) => acc + (level.durationInMinutes || 0),
    0,
  );

  const formattedDuration =
    totalMinutes >= 60
      ? `${Math.round(totalMinutes / 60)} Hours`
      : `${totalMinutes} Minutes`;

  const displayTotal = totalLevels || calculatedTotal;

  const [hovered, setHovered] = useState(false);

  const { state, handleClick, isLocked, isLoading, isSuccess, isPressing } =
    useCardLoader(onClick, 1400);

  const isActive = isLoading || isSuccess;

  const scale = isPressing
    ? "scale(0.972)"
    : hovered && !isLocked
      ? "translateY(-4px)"
      : "translateY(0)";

  const shadow = isActive
    ? "0 12px 40px rgba(0,0,0,0.10)"
    : hovered
      ? "0 20px 56px rgba(0,0,0,0.14)"
      : "0 6px 24px rgba(0,0,0,0.08)";

  const arrowBg = isActive
    ? isSuccess
      ? "rgba(59,130,246,0.16)"
      : "rgba(30,26,24,0.11)"
    : hovered
      ? "rgba(30,26,24,0.14)"
      : "rgba(30,26,24,0.07)";

  const arrowShift = hovered && !isLocked ? "translateX(3px)" : "translateX(0)";

  return (
    <div
      id="c-course-card"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full sm:w-120 overflow-hidden select-none"
      style={{
        borderRadius: 24,
        boxShadow: shadow,
        transform: scale,
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        cursor: isLocked ? "not-allowed" : "pointer",
        pointerEvents: isLocked ? "none" : "auto",
      }}
    >
      {/* Visual header */}
      <div
        className="relative overflow-hidden"
        style={{
          height: 310,
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      >
        <CCodeVisual />

        {isActive && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: isSuccess
                ? "rgba(59,130,246,0.06)"
                : "rgba(0,0,0,0.08)",
              transition: "background 0.28s ease",
              pointerEvents: "none",
            }}
          />
        )}

        <StatusBadge state={state} status={status} />
      </div>

      {/* Info section */}
      <div
        className="px-5 pt-4.5 pb-5"
        style={{ background: "#f2e0d0", position: "relative" }}
      >
        <CardInfoShimmer state={state} />

        <div className="flex items-center gap-1.5 mb-3.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3a3330"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.55, flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />

            <polyline points="12 6 12 12 16 14" />
          </svg>

          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "#3a3330" }}
          >
            {totalMinutes > 0 ? formattedDuration : "18 Hours"}
          </span>
        </div>

        <p
          className="text-[15.5px] font-medium leading-[1.55] mb-4"
          style={{ color: "#1e1a18" }}
        >
          Learn C programming from scratch - variables, logic, loops, memory management, and pointers for software development.
        </p>

        <div className="flex items-center gap-1 mb-4 flex-wrap">
          <LevelSquaresLoading
            state={state}
            levelsFinished={levelsFinished}
            totalLevels={displayTotal}
          />

          <span
            className="text-[11px] font-semibold ml-1"
            style={{ color: "rgba(30,26,24,0.45)" }}
          >
            {levelsFinished}/{displayTotal} levels
          </span>
        </div>

        <div className="flex justify-end">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: arrowBg,
              transform: isLoading ? "none" : arrowShift,
              transition: "all 0.22s ease",
            }}
          >
            {isLoading && <SpinnerIcon size={14} color="#1e1a18" />}
            {isSuccess && <SuccessIcon size={14} color="#2ecc8a" />}
            {!isLoading && !isSuccess && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e1a18"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
