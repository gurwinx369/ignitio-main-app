"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
import { ArrowRight, Check, Lock } from "lucide-react";
import { CanvasBackground } from "./canvas-background";
import { ConfettiLayer } from "./confetti-layer";
import { RoadmapConnectors } from "./roadmap-connectors";
import {
  CARD_H,
  FINISH_H,
  HEADER_MS,
  INTRO_MS,
  LABEL_H,
  STAGES,
  DSA_STAGES,
  STAGE_MS,
  STEP_X,
  TRACK_HEIGHT,
  TRACK_WIDTH,
  cardTop,
  checkDelay,
  stageX,
} from "./roadmap-data";
import { RoadmapIntro } from "./roadmap-intro";
import { PixelSwap } from "@/components/ui/PixelSwap";
import { delay, prefersReducedMotion } from "@/lib/onboarding/reveal-utils";
import { StageCard } from "./stage-card";
import KiboBody from "@/features/kyle/pet/KiboBody";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";

function KiboHeaderAvatar({ size = 72, className = "", eyeTracking = true }) {
  const wrapperRef = useRef(null);
  const eyesRef = useRef(null);
  useKiboEyeTracking({
    eyesRef,
    wrapperRef,
    active: eyeTracking,
    trackFullPage: true,
  });

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <KiboBody
        visualState="idle"
        petSize={size}
        wrapperRef={wrapperRef}
        eyesRef={eyesRef}
      />
    </div>
  );
}

// ponytail: duration rules for stages to compute dynamic weeks
const STAGE_WEEKS = {
  git: 1,
  python: 2,
  dsa: 2,
  ship: 1,
  prompt: 1,
  system_design: 1,
};

export function RoadmapResult({ roadmapIds, goal, onContinue, onBack }) {
  const isDsa =
    goal === "dsa" ||
    (roadmapIds && roadmapIds.length === 1 && roadmapIds[0] === "dsa");

  // ponytail: compute active stages and dynamic labels inline instead of complex state
  const activeStages = useMemo(() => {
    if (isDsa) return DSA_STAGES;
    return STAGES.filter(
      (s) => s.kind === "finish" || !roadmapIds || roadmapIds.includes(s.id),
    );
  }, [roadmapIds, isDsa]);

  const dynamicStages = useMemo(() => {
    if (isDsa) return DSA_STAGES;
    let currentWeek = 1;
    let currentDay = 1;
    // ponytail: always badge the first real stage regardless of which stages survive filtering
    const firstStageIdx = activeStages.findIndex((s) => s.kind === "stage");
    return activeStages.map((stage, i) => {
      if (stage.kind === "finish") {
        return {
          ...stage,
          weekLabel: `Week ${currentWeek}`,
          days: `Days ${currentDay}–${currentDay + 6}`,
          startHere: false,
        };
      }
      const weeks = STAGE_WEEKS[stage.id] || 1;
      const endWeek = currentWeek + weeks - 1;
      const endDay = currentDay + weeks * 7 - 1;
      const res = {
        ...stage,
        number: String(i + 1).padStart(2, "0"),
        weekLabel:
          weeks > 1 ? `Weeks ${currentWeek}–${endWeek}` : `Week ${currentWeek}`,
        days: `Days ${currentDay}–${endDay}`,
        startHere: i === firstStageIdx,
      };
      currentWeek += weeks;
      currentDay += weeks * 7;
      return res;
    });
  }, [activeStages, isDsa]);

  const totalWeeks = useMemo(() => {
    if (isDsa) return 4;
    return activeStages.reduce(
      (acc, stage) =>
        acc +
        (stage.kind === "stage"
          ? STAGE_WEEKS[stage.id] || 1
          : stage.kind === "finish"
            ? 1
            : 0),
      0,
    );
  }, [activeStages, isDsa]);

  // ponytail: dynamic geometry based on filtered stages
  const trackWidth = stageX(dynamicStages.length - 1) + 296 + 20;
  const trackHeight =
    cardTop(dynamicStages.length - 1) +
    (dynamicStages[dynamicStages.length - 1]?.kind === "finish"
      ? FINISH_H
      : 196) +
    32;
  const scrollerRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });
  const timers = useRef([]);
  const userControl = useRef(false);
  const burstId = useRef(0);
  const scrollTargetRef = useRef(0);
  const scrollRafRef = useRef(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [phase, setPhase] = useState("intro");
  const [introExiting, setIntroExiting] = useState(false);
  const [pixelActive, setPixelActive] = useState(false);
  const [pixelSwapDone, setPixelSwapDone] = useState(false);
  const [headerOn, setHeaderOn] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [linked, setLinked] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [done, setDone] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [bursts, setBursts] = useState([]);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(max <= 40 || el.scrollLeft > max - 8);
  }, []);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const at = useCallback((ms, fn) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const addBurst = useCallback((x, y, kind, colors) => {
    if (prefersReducedMotion()) return;
    const id = ++burstId.current;
    setBursts((prev) => [...prev, { id, x, y, kind, colors }]);
  }, []);

  const removeBurst = useCallback((id) => {
    setBursts((prev) => prev.filter((burst) => burst.id !== id));
  }, []);

  const burstAtKey = useCallback(
    (key, kind, colors) => {
      const el = document.querySelector(`[data-burst="${key}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const visible =
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight;
      if (!visible) return;
      addBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        kind,
        colors,
      );
    },
    [addBurst],
  );

  const follow = useCallback(
    (index) => {
      if (userControl.current) return;
      document
        .getElementById(`rm-stage-${dynamicStages[index].id}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
    },
    [dynamicStages],
  );

  const showEverything = useCallback(() => {
    clearTimers();
    setPixelActive(false);
    setPixelSwapDone(true);
    setPhase("reveal");
    setIntroExiting(false);
    setHeaderOn(true);
    setRevealed(dynamicStages.length);
    setLinked(dynamicStages.length - 1);
    setCelebrated(true);
    setDone(true);
  }, [clearTimers, dynamicStages.length]);

  const run = useCallback(
    ({ withIntro, reset }) => {
      clearTimers();
      userControl.current = false;

      if (reset) {
        setHeaderOn(false);
        setRevealed(0);
        setLinked(0);
        setCelebrated(false);
        setDone(false);
        setBursts([]);
        setIntroExiting(false);
        setPixelActive(false);
        setPixelSwapDone(false);
        window.scrollTo({ top: 0 });
        scrollerRef.current?.scrollTo({ left: 0 });
      }

      setPhase(withIntro ? "intro" : "reveal");
      setPixelActive(false);
      setPixelSwapDone(!withIntro);

      let t = reset ? 140 : 40;
      if (withIntro) {
        // Steps in intro run at 200ms, 1200ms, 2200ms, 3200ms
        // By 3700ms, all checkmarks have completed and settled
        // Trigger PixelSwap to transition from beige to dark mode navy blue
        const swapStart = t + 3700;
        const swapDuration = 1800;
        at(swapStart, () => setPixelActive(true));

        const revealStart = swapStart + swapDuration;
        at(revealStart, () => {
          setPixelSwapDone(true);
          setPhase("reveal");
          setHeaderOn(true);
        });

        t = revealStart;
      } else {
        at(t, () => setHeaderOn(true));
      }

      const first = t + HEADER_MS;
      dynamicStages.forEach((stage, i) => {
        const revealAt = first + i * STAGE_MS;
        at(revealAt, () => setRevealed(i + 1));
        if (i > 0) {
          at(revealAt - 600, () => {
            setLinked(i);
            follow(i);
          });
        }
        if (stage.kind === "stage") {
          at(revealAt + checkDelay(stage.concepts.length) + 80, () =>
            burstAtKey(stage.id, "mini", [stage.accent, "#fcf5ee"]),
          );
        }
      });

      const finishAt = first + (dynamicStages.length - 1) * STAGE_MS;
      at(finishAt + 650, () => {
        setCelebrated(true);
        burstAtKey("live", "big");
      });
      at(finishAt + 1100, () => {
        if (userControl.current) return;
        document
          .getElementById("rm-cta")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      at(finishAt + 1400, () => setDone(true));
    },
    [at, burstAtKey, clearTimers, dynamicStages, follow],
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      showEverything();
    } else {
      run({ withIntro: true, reset: false });
    }
    return clearTimers;
  }, [run, showEverything, clearTimers]);

  useEffect(() => {
    const takeOver = () => {
      userControl.current = true;
    };
    const events = ["wheel", "touchstart", "pointerdown", "keydown"];
    events.forEach((name) =>
      window.addEventListener(name, takeOver, { passive: true }),
    );
    return () =>
      events.forEach((name) => window.removeEventListener(name, takeOver));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // If user is scrolling horizontally with trackpad, let native handle it
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // Allow natural page vertical scroll at boundaries
      if (
        (el.scrollLeft <= 5 && scrollingUp) ||
        (el.scrollLeft >= max - 5 && scrollingDown)
      ) {
        return;
      }

      e.preventDefault();
      userControl.current = true;
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const commit = (event) => {
    if (committed) return;
    setCommitted(true);
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    if (rect) {
      addBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, "big");
    }
    navigator.vibrate?.(14);
    if (onContinue) {
      setTimeout(onContinue, 1200);
    }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if (event.target.closest("button") || event.target.closest("a") || event.target.closest('[role="button"]')) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    drag.current = {
      active: true,
      startX: event.clientX,
      startLeft: el.scrollLeft,
    };
    scrollTargetRef.current = el.scrollLeft;
    el.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!drag.current.active || !scrollerRef.current) return;
    const nextLeft =
      drag.current.startLeft - (event.clientX - drag.current.startX);
    scrollerRef.current.scrollLeft = nextLeft;
    scrollTargetRef.current = nextLeft;
  };

  const endDrag = () => {
    drag.current.active = false;
    setDragging(false);
  };

  return (
    <section
      aria-labelledby="roadmap-title"
      data-celebrate={celebrated}
      style={{
        "--font-sans": "var(--font-jakarta)",
        "--font-mono": "var(--font-jetbrains)",
      }}
      className={`relative isolate min-h-screen overflow-hidden bg-ig-bg pb-36 text-ig-text font-sans dark ${jakarta.variable} ${jetbrains.variable}`}
    >
      <CanvasBackground />
      <div
        aria-hidden="true"
        className="rm-bloom pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(44rem 28rem at 85% 85%, rgb(92 200 255 / 0.22), transparent 65%)",
        }}
      />

      {!pixelSwapDone && phase === "intro" && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <PixelSwap
            firstContent={
              <RoadmapIntro
                exiting={false}
                theme="beige"
                title="Building your custom roadmap"
                icon={() => (
                  <KiboHeaderAvatar
                    size={72}
                    className="rm-float"
                    eyeTracking={false}
                  />
                )}
                steps={[
                  { label: "Analyzing your diagnostic answers...", at: 200 },
                  { label: "Matching your pace and goals...", at: 1200 },
                  { label: "Crafting a path especially for you...", at: 2200 },
                  { label: "Finalizing custom roadmap...", at: 3200 },
                ]}
              />
            }
            secondContent={
              <div
                className="relative isolate flex h-full w-full min-h-screen items-center justify-center overflow-hidden bg-ig-bg text-ig-text"
                style={{ backgroundColor: "#13122e" }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10"
                  style={{
                    background:
                      "radial-gradient(44rem 28rem at 85% 85%, rgb(92 200 255 / 0.22), transparent 65%)",
                  }}
                />
              </div>
            }
            active={pixelActive}
            trigger="none"
            pixelColor="#13122e"
            pattern="center"
            pixelSize={64}
            gap={0}
            pixelRadius={6}
            duration={1800}
            pixelDuration={700}
            randomness={0.08}
            easing="cubic-bezier(0.16, 1, 0.3, 1)"
            aspectRatio="auto"
            className="h-full w-full"
            style={{ width: "100vw", height: "100vh" }}
            onComplete={(to) => {
              if (to) {
                setPixelSwapDone(true);
                setPhase("reveal");
                setHeaderOn(true);
              }
            }}
          />
        </div>
      )}

      <header
        data-on={headerOn}
        className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16"
      >
        <div className="flex items-start gap-4 sm:gap-6 max-w-3xl relative">
          <div className="rm-reveal shrink-0 z-10" style={delay(0)}>
            <KiboHeaderAvatar size={112} className="rm-float drop-shadow-xl" />
          </div>
          <div className="flex-1 min-w-0 pt-4 relative z-0">
            {/* Chat Bubble Tail */}
            <div
              className="rm-reveal absolute -left-3 top-10 w-6 h-6 bg-ig-text/5 border-l border-t border-ig-text/10 transform -rotate-45"
              style={{
                ...delay(140),
                zIndex: -1,
                backdropFilter: "blur(12px)",
              }}
            />
            <div
              className="rm-reveal rm-fade relative rounded-3xl rounded-tl-sm bg-ig-text/5 px-6 py-5 border border-ig-text/10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md"
              style={delay(140)}
            >
              <h1 id="roadmap-title" className="sr-only">
                Your customized roadmap
              </h1>
              <p className="text-pretty text-base sm:text-lg leading-relaxed text-ig-text font-medium">
                {isDsa ? (
                  <>
                    I&apos;ve analyzed everything and crafted a personalized
                    path especially for you. Stick to this plan, and in just{" "}
                    <strong className="text-ig-cyan-soft font-bold">
                      4 weeks
                    </strong>
                    , you&apos;ll be{" "}
                    <strong className="text-ig-cyan-soft font-bold">
                      interview &amp; placement ready
                    </strong>{" "}
                    in Data Structures &amp; Algorithms!
                  </>
                ) : (
                  <>
                    I&apos;ve analyzed everything and crafted a personalized
                    path especially for you. Stick to this plan, and in just{" "}
                    <strong className="text-ig-cyan-soft font-bold">
                      {totalWeeks} weeks
                    </strong>
                    , you&apos;ll launch your very own project directly to{" "}
                    <strong className="text-ig-cyan-soft font-bold">
                      GitHub
                    </strong>
                    !
                  </>
                )}
              </p>
              <p
                className="rm-reveal rm-fade mt-3 text-sm text-ig-muted"
                style={delay(880)}
              >
                {isDsa
                  ? "Top 23 curated patterns. No fluff, just small wins every day. Are you ready?"
                  : "No fluff, just small wins every week. Are you ready?"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto mt-8 max-w-6xl">
        <div
          ref={scrollerRef}
          role="region"
          aria-label="Roadmap timeline. Scroll sideways to see every stage."
          tabIndex={0}
          onScroll={measure}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`rm-scroll overflow-x-auto overscroll-x-contain rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ig-cyan/60 ${
            dragging
              ? "cursor-grabbing select-none"
              : "cursor-grab snap-x snap-proximity"
          }`}
        >
          <ol
            className="relative list-none"
            style={{ width: trackWidth, height: trackHeight }}
          >
            <RoadmapConnectors
              linked={linked}
              stages={dynamicStages}
              trackWidth={trackWidth}
              trackHeight={trackHeight}
            />
            {dynamicStages.map((stage, i) => (
              <li
                key={stage.id}
                id={`rm-stage-${stage.id}`}
                className="absolute scroll-m-5"
                style={{
                  left: stageX(i),
                  top: cardTop(i) - LABEL_H,
                  width: 296,
                }}
              >
                <div
                  aria-hidden="true"
                  data-show={headerOn && revealed <= i}
                  className="rm-ghost pointer-events-none absolute inset-x-0 rounded-3xl border border-dashed border-ig-text/15"
                  style={{
                    top: LABEL_H,
                    height: stage.kind === "finish" ? FINISH_H : CARD_H,
                  }}
                >
                  <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ig-text/25" />
                </div>
                <StageCard stage={stage} on={revealed > i} onCommit={done ? commit : null} />
              </li>
            ))}
            {dynamicStages.map((stage, i) => (
              <span
                key={`snap-${stage.id}`}
                aria-hidden="true"
                className="absolute top-0 size-px snap-start"
                style={{ left: i === 0 ? 0 : stageX(i) - 20 }}
              />
            ))}
          </ol>
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-ig-bg to-transparent transition-opacity duration-300 ${
            atStart ? "opacity-0" : "opacity-100"
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-ig-bg to-transparent transition-opacity duration-300 ${
            atEnd ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {/* ── STICKY PRIMARY CTA DOCK (Apple HIG Floating Bar + Glassmorphic Antigravity) ── */}
      <div
        id="rm-cta"
        className={`fixed bottom-0 inset-x-0 z-40 w-full bg-[#13122e]/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-12px_32px_rgba(0,0,0,0.4)] px-5 sm:px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-all duration-500 ${
          pixelSwapDone
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Subtle top gradient feather to soften scrolling cards behind the dock */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 inset-x-0 h-8 bg-gradient-to-t from-[#13122e]/85 to-transparent"
        />

        <div className="mx-auto w-full max-w-[480px] flex flex-col items-center gap-2 relative z-10">
          <button
            type="button"
            disabled={!done || committed}
            aria-disabled={!done || committed}
            onClick={commit}
            aria-live="polite"
            className={`group flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-base font-extrabold text-white transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ig-cyan focus-visible:outline-none ${
              !done
                ? "cursor-not-allowed bg-white/10 text-white/45 border border-white/10 shadow-none select-none"
                : committed
                  ? "cursor-default bg-ig-teal shadow-[0_4px_0_#0D9488]"
                  : "cursor-pointer bg-[#00A9FF] hover:bg-[#0096e6] shadow-[0_4px_0_#007bcc] hover:shadow-[0_4px_0_#007bcc] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-none active:scale-[0.99]"
            }`}
          >
            {!done ? (
              <span className="flex items-center gap-2.5 text-sm sm:text-base font-semibold tracking-wide">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ig-cyan opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-ig-cyan" />
                </span>
                <span>Preparing your roadmap...</span>
              </span>
            ) : committed ? (
              <span className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                <Check aria-hidden="true" className="size-5" strokeWidth={3} />
                You're in!
              </span>
            ) : (
              <>
                <span>Start Week 1 today</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-5 transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <p
            className="text-xs sm:text-sm text-ig-muted text-center transition-opacity duration-300"
            aria-live="polite"
          >
            {!done
              ? isDsa
                ? "Calibrating 4-week algorithmic curriculum..."
                : "Matching milestones to your target pace..."
              : committed
                ? isDsa
                  ? "First step: Day 1 — Orientation & Big O intuition (10 min)"
                  : "First step: write your first Python script (5 min)"
                : isDsa
                  ? "Your first step takes about 10 minutes"
                  : "Your first step takes about 5 minutes"}
          </p>
        </div>
      </div>

      <p role="status" className="sr-only">
        {done
          ? isDsa
            ? "Your DSA roadmap is ready: master search patterns, recursion, trees, and graphs for FAANG interviews."
            : "Your roadmap is ready: learn to code, push to Git, then ship a live project to GitHub."
          : ""}
      </p>

      <ConfettiLayer bursts={bursts} onDone={removeBurst} />
    </section>
  );
}
