"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useCardLoader,
  SpinnerIcon,
  SuccessIcon,
  StatusBadge,
  CardInfoShimmer,
} from "./CardLoader";
import { clangBeginnerRoadmapData } from "@/data/clangBeginnerRoadmap";
import useRoadmapCanvasActivity from "./useRoadmapCanvasActivity";

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
  const visualRef =
    useRef(null);

  const animationActiveRef =
    useRoadmapCanvasActivity(
      visualRef,
    );

  const [
    phase,
    setPhase,
  ] = useState("typing");

  const [
    lineIndex,
    setLineIndex,
  ] = useState(0);

  const [
    charIndex,
    setCharIndex,
  ] = useState(0);

  const [
    reducedMotion,
    setReducedMotion,
  ] = useState(false);

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

    let timer = null;

    /*
     * A pending step waits here while:
     *
     * - Worlds rail is scrolling
     * - card is outside the viewport
     * - browser tab is hidden
     *
     * No React animation state changes while paused.
     */
    const scheduleWhenActive = (
      callback,
      delay,
    ) => {
      const run = () => {
        if (
          !animationActiveRef.current
        ) {
          timer =
            window.setTimeout(
              run,
              120,
            );

          return;
        }

        callback();
      };

      timer =
        window.setTimeout(
          run,
          delay,
        );
    };

    if (phase === "typing") {
      if (
        lineIndex >=
        CODE_LINES.length
      ) {
        scheduleWhenActive(
          () => {
            setPhase(
              "running",
            );
          },
          280,
        );

        return () => {
          if (timer) {
            clearTimeout(
              timer,
            );
          }
        };
      }

      const currentLine =
        CODE_LINES[
        lineIndex
        ];

      const currentLineLength =
        getLineLength(
          currentLine,
        );

      if (
        currentLineLength ===
        0
      ) {
        scheduleWhenActive(
          () => {
            setLineIndex(
              (current) =>
                current +
                1,
            );

            setCharIndex(
              0,
            );
          },
          150,
        );

        return () => {
          if (timer) {
            clearTimeout(
              timer,
            );
          }
        };
      }

      if (
        charIndex <
        currentLineLength
      ) {
        scheduleWhenActive(
          () => {
            setCharIndex(
              (current) =>
                current +
                1,
            );
          },
          42,
        );

        return () => {
          if (timer) {
            clearTimeout(
              timer,
            );
          }
        };
      }

      scheduleWhenActive(
        () => {
          setLineIndex(
            (current) =>
              current +
              1,
          );

          setCharIndex(
            0,
          );
        },
        190,
      );
    } else if (
      phase === "running"
    ) {
      scheduleWhenActive(
        () => {
          setPhase(
            "output",
          );
        },
        750,
      );
    } else if (
      phase === "output"
    ) {
      scheduleWhenActive(
        () => {
          setPhase(
            "typing",
          );

          setLineIndex(
            0,
          );

          setCharIndex(
            0,
          );
        },
        2600,
      );
    }

    return () => {
      if (timer) {
        clearTimeout(
          timer,
        );
      }
    };
  }, [
    phase,
    lineIndex,
    charIndex,
    reducedMotion,
    animationActiveRef,
  ]);

  const outputVisible = reducedMotion || phase === "output";
  const running = !reducedMotion && phase === "running";

  return (
    <div
      ref={visualRef}
      data-roadmap-animated-visual
      style={{
        position:
          "absolute",

        inset: 0,

        fontFamily:
          "'Fira Code', 'Consolas', monospace",
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
  variant = "world",
}) {
  const allLevels =
    clangBeginnerRoadmapData.days.flatMap(
      (day) => day.levels
    );

  const calculatedTotalLevels =
    allLevels.length;

  const totalMinutes =
    allLevels.reduce(
      (acc, level) =>
        acc + (level.durationInMinutes || 0),
      0
    );

  const formattedDuration =
    totalMinutes >= 60
      ? `${Math.round(totalMinutes / 60)} Hours`
      : `${totalMinutes} Minutes`;

  const displayTotalLevels =
    totalLevels ||
    calculatedTotalLevels;

  const [hovered, setHovered] =
    useState(false);

  const {
    state,
    handleClick,
    isLocked,
    isLoading,
    isSuccess,
    isPressing,
  } = useCardLoader(onClick, 1400);

  const isActive =
    isLoading || isSuccess;

  const transform = isPressing
    ? "translateY(2px) scale(0.985)"
    : hovered && !isLocked
      ? "translateY(-2px)"
      : "translateY(0)";

  const cardShadow = isActive
    ? "drop-shadow(0 7px 12px rgba(25,24,59,0.09))"
    : hovered
      ? "drop-shadow(0 10px 15px rgba(25,24,59,0.12))"
      : "drop-shadow(0 5px 10px rgba(25,24,59,0.07))";

  return (
    <div
      id="c-course-card"
      onClick={handleClick}
      onMouseEnter={() =>
        setHovered(true)
      }
      onMouseLeave={() =>
        setHovered(false)
      }
      className="
        group
        w-full
        relative
        overflow-hidden
        select-none
        flex
        flex-col
      "
      style={{
        borderRadius: 24,

        minHeight:
          variant === "home"
            ? 580
            : 560,

        transform,

        filter: cardShadow,

        transition:
          "transform 160ms ease, filter 160ms ease",

        cursor: isLocked
          ? "not-allowed"
          : "pointer",

        pointerEvents: isLocked
          ? "none"
          : "auto",
        background: "#F2E0D0",
      }}
    >
      {/* HERO */}
      <div className="px-3 pt-3">
        <div
          className="
            relative
            overflow-hidden
            shrink-0
            rounded-[18px]
          "
          style={{
            height:
              variant === "home"
                ? 310
                : 300,
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          }}
        >
          <CCodeVisual />

        {isActive && (
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              pointer-events-none
            "
            style={{
              background: isSuccess
                ? "rgba(0,169,255,0.06)"
                : "rgba(25,24,59,0.05)",
            }}
          />
        )}

        <StatusBadge
          state={state}
          status={status}
        />
        </div>
      </div>

      {/* INFO */}
      <div
        className="
          relative
          px-6
          pt-5
          pb-6
          flex-grow
          flex
          flex-col
        "
      >
        <CardInfoShimmer
          state={state}
        />

        <div className="flex items-center gap-1.5 mb-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#19183B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: 0.55,
              flexShrink: 0,
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <polyline points="12 6 12 12 16 14" />
          </svg>

          <span className="text-[11px] font-bold tracking-widest uppercase text-[#19183B]">
            {totalMinutes > 0
              ? formattedDuration
              : "18 Hours"}
          </span>
        </div>

        <h3 className="text-[18px] font-extrabold leading-tight text-[#19183B] mb-1.5">
          {clangBeginnerRoadmapData.title}
        </h3>

        <p className="text-[14px] font-medium leading-[1.5] text-[#19183B] mb-3 line-clamp-2">
          {clangBeginnerRoadmapData.description ||
            "Learn C programming from scratch — variables, logic, loops, memory management, and pointers for software development."}
          <span className="text-[#00A9FF] font-bold ml-1">...more</span>
        </p>

        <p className="text-[11px] font-semibold text-[#19183B]/55">
          {levelsFinished}/
          {displayTotalLevels} levels
        </p>

        <div className="flex justify-center mt-auto pt-4">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#00A9FF]
              text-[#19183B]
              shadow-[0_4px_0_#0085C7]
              transition-[transform,box-shadow]
              duration-150
              ease-out
              group-hover:-translate-y-px
              group-active:translate-y-[2px]
              group-active:scale-[0.98]
              group-active:shadow-[0_1px_0_#0085C7]
            "
          >
            {isLoading && (
              <SpinnerIcon
                size={16}
                color="#19183B"
              />
            )}

            {isSuccess && (
              <SuccessIcon
                size={16}
                color="#19183B"
              />
            )}

            {!isLoading &&
              !isSuccess && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#19183B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                  />

                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}