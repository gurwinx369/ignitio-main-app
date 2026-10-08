"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  RotateCcw,
  Rocket,
  Sparkles,
} from "lucide-react";
import { CanvasBackground } from "./canvas-background";
import { ConfettiLayer } from "./confetti-layer";
import { CountUp } from "./count-up";
import { RoadmapConnectors } from "./roadmap-connectors";
import {
  CARD_H,
  FINISH_H,
  HEADER_MS,
  INTRO_MS,
  LABEL_H,
  STAGES,
  STAGE_MS,
  STEP_X,
  TRACK_HEIGHT,
  TRACK_WIDTH,
  cardTop,
  checkDelay,
  stageX,
} from "./roadmap-data";
import { RoadmapIntro } from "./roadmap-intro";
import { delay, prefersReducedMotion } from "./reveal-utils";
import { StageCard } from "./stage-card";

const SUMMARY = [
  { value: 4, label: "weeks" },
  { value: 3, label: "stages" },
  { value: 1, label: "live project" },
];

const TITLE_WORDS = [
  { text: "Ship" },
  { text: "a" },
  { text: "real" },
  { text: "project" },
  { text: "to" },
  { text: "GitHub", accent: true },
  { text: "in" },
  { text: "one", accent: true },
  { text: "month", accent: true },
];

export function RoadmapResult() {
  const scrollerRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });
  const timers = useRef([]);
  const userControl = useRef(false);
  const burstId = useRef(0);

  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [phase, setPhase] = useState("intro");
  const [introExiting, setIntroExiting] = useState(false);
  const [headerOn, setHeaderOn] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [linked, setLinked] = useState(0);
  const [celebrated, setCelebrated] = useState(false);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [bursts, setBursts] = useState([]);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? Math.min(1, el.scrollLeft / max) : 1);
    setAtStart(el.scrollLeft < 8);
    setAtEnd(max <= 0 || el.scrollLeft > max - 8);
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

  const follow = useCallback((index) => {
    if (userControl.current) return;
    document.getElementById(`rm-stage-${STAGES[index].id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, []);

  const showEverything = useCallback(() => {
    clearTimers();
    setSkipped(true);
    setPhase("reveal");
    setIntroExiting(false);
    setHeaderOn(true);
    setRevealed(STAGES.length);
    setLinked(STAGES.length - 1);
    setCelebrated(true);
    setDone(true);
  }, [clearTimers]);

  const run = useCallback(
    ({ withIntro, reset }) => {
      clearTimers();
      userControl.current = false;

      if (reset) {
        setSkipped(true);
        setHeaderOn(false);
        setRevealed(0);
        setLinked(0);
        setCelebrated(false);
        setDone(false);
        setBursts([]);
        setIntroExiting(false);
        window.scrollTo({ top: 0 });
        scrollerRef.current?.scrollTo({ left: 0 });
        at(80, () => setSkipped(false));
      }

      setPhase(withIntro ? "intro" : "reveal");

      let t = reset ? 140 : 40;
      if (withIntro) {
        at(t + INTRO_MS, () => setIntroExiting(true));
        at(t + INTRO_MS + 550, () => setPhase("reveal"));
        t += INTRO_MS;
      }

      at(t, () => setHeaderOn(true));

      const first = t + HEADER_MS;
      STAGES.forEach((stage, i) => {
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

      const finishAt = first + (STAGES.length - 1) * STAGE_MS;
      at(finishAt + 650, () => {
        setCelebrated(true);
        burstAtKey("live", "big");
      });
      at(finishAt + 1100, () => {
        if (userControl.current) return;
        document
          .getElementById("rm-cta")
          ?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
      at(finishAt + 1400, () => setDone(true));
    },
    [at, burstAtKey, clearTimers, follow],
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

  const commit = (event) => {
    if (committed) return;
    setCommitted(true);
    const rect = event.currentTarget.getBoundingClientRect();
    addBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, "big");
    navigator.vibrate?.(14);
  };

  const scrollByStep = (direction) => {
    userControl.current = true;
    scrollerRef.current?.scrollBy({
      left: direction * STEP_X,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startLeft: el.scrollLeft,
    };
    el.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!drag.current.active || !scrollerRef.current) return;
    scrollerRef.current.scrollLeft =
      drag.current.startLeft - (event.clientX - drag.current.startX);
  };

  const endDrag = () => {
    drag.current.active = false;
    setDragging(false);
  };

  return (
    <section
      aria-labelledby="roadmap-title"
      data-celebrate={celebrated}
      className={`relative isolate min-h-screen overflow-hidden bg-ig-bg pb-10 text-ig-text ${
        skipped ? "rm-skip" : ""
      }`}
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

      {phase === "intro" && <RoadmapIntro exiting={introExiting} />}

      {!done && (
        <button
          type="button"
          onClick={showEverything}
          className="fixed right-4 top-4 z-60 rounded-full border border-ig-text/15 bg-ig-bg/70 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ig-muted backdrop-blur transition hover:text-ig-text focus-visible:ring-2 focus-visible:ring-ig-cyan/60 focus-visible:outline-none"
        >
          Skip
        </button>
      )}

      <header
        data-on={headerOn}
        className="mx-auto max-w-6xl px-5 pt-10 sm:pt-14"
      >
        <div className="flex items-start gap-4">
          <div
            className="rm-reveal rm-badge flex size-12 shrink-0 items-center justify-center rounded-2xl border border-ig-text/15 bg-ig-text/5 shadow-[0_0_32px_-6px_rgb(0_169_255/0.55)] sm:size-14"
            style={delay(0)}
          >
            <Rocket
              aria-hidden="true"
              className="rm-float size-6 text-ig-cyan-soft sm:size-7"
            />
          </div>
          <div className="min-w-0">
            <p
              className="rm-reveal rm-fade flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ig-cyan-soft"
              style={delay(140)}
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              Your 30-day result
            </p>
            <h1
              id="roadmap-title"
              className="mt-1.5 text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl"
            >
              {TITLE_WORDS.map((word, i) => (
                <span key={`${word.text}-${i}`}>
                  <span
                    className={`rm-reveal rm-word inline-block ${word.accent ? "text-ig-cyan-soft" : ""}`}
                    style={delay(260 + i * 60)}
                  >
                    {word.text}
                  </span>
                  {i < TITLE_WORDS.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <p
              className="rm-reveal rm-fade mt-2 max-w-xl text-pretty text-sm leading-relaxed text-ig-muted sm:text-base"
              style={delay(880)}
            >
              Three focused stages, small wins every week. By day 30 you&apos;ll
              have a live repo with your name on it.
            </p>
          </div>
        </div>

        <dl className="mt-6 flex flex-wrap gap-2">
          {SUMMARY.map((item, i) => (
            <div
              key={item.label}
              className="rm-reveal rm-pop-sm flex items-baseline gap-1.5 rounded-full border border-ig-text/15 bg-ig-text/5 px-3.5 py-1.5"
              style={delay(1000 + i * 110)}
            >
              <dt className="sr-only">{item.label}</dt>
              <dd className="font-mono text-sm font-bold tabular-nums text-ig-text">
                <CountUp
                  to={item.value}
                  on={headerOn && !skipped}
                  delay={1000 + i * 110}
                />
              </dd>
              <span aria-hidden="true" className="text-xs text-ig-muted">
                {item.label}
              </span>
            </div>
          ))}
        </dl>
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
            style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT }}
          >
            <RoadmapConnectors linked={linked} />
            {STAGES.map((stage, i) => (
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
                <StageCard stage={stage} on={revealed > i} />
              </li>
            ))}
            {STAGES.map((stage, i) => (
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

      <footer className="mx-auto mt-4 flex max-w-6xl flex-col gap-5 px-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div data-on={revealed > 0} className="sm:flex-1">
          <div
            className="rm-reveal rm-fade flex items-center gap-3"
            style={delay(300)}
          >
            <div
              aria-hidden="true"
              className="h-1 max-w-xs flex-1 overflow-hidden rounded-full bg-ig-text/10"
            >
              <div
                className="h-full origin-left rounded-full bg-linear-to-r from-[#5eead4] via-[#a5b4fc] to-[#fdba74] transition-transform duration-150"
                style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }}
              />
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => scrollByStep(-1)}
                disabled={atStart}
                aria-label="Previous stage"
                className="flex size-9 items-center justify-center rounded-full border border-ig-text/15 bg-ig-text/5 text-ig-text transition hover:bg-ig-text/10 focus-visible:ring-2 focus-visible:ring-ig-cyan/60 focus-visible:outline-none disabled:opacity-30"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByStep(1)}
                disabled={atEnd}
                aria-label="Next stage"
                className="flex size-9 items-center justify-center rounded-full border border-ig-text/15 bg-ig-text/5 text-ig-text transition hover:bg-ig-text/10 focus-visible:ring-2 focus-visible:ring-ig-cyan/60 focus-visible:outline-none disabled:opacity-30"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => run({ withIntro: false, reset: true })}
                aria-label="Replay the reveal"
                title="Replay the reveal"
                className="flex size-9 items-center justify-center rounded-full border border-ig-text/15 bg-ig-text/5 text-ig-muted transition hover:bg-ig-text/10 hover:text-ig-text focus-visible:ring-2 focus-visible:ring-ig-cyan/60 focus-visible:outline-none"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          id="rm-cta"
          data-on={celebrated}
          className="flex scroll-mb-6 flex-col gap-2.5 sm:items-end"
        >
          <div className="rm-reveal rm-pop" style={delay(250)}>
            <button
              type="button"
              onClick={commit}
              aria-live="polite"
              className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold text-ig-bg transition duration-300 focus-visible:ring-2 focus-visible:ring-ig-text focus-visible:outline-none ${
                committed
                  ? "bg-ig-teal shadow-[0_10px_30px_-8px_rgb(94_234_212/0.55)]"
                  : "rm-cta-idle bg-ig-cyan shadow-[0_10px_30px_-8px_rgb(0_169_255/0.6)] hover:-translate-y-0.5 hover:bg-ig-cyan-soft active:scale-95"
              }`}
            >
              {committed ? (
                <span className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                  <Check
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={3}
                  />
                  You&apos;re in. Week 1 starts now
                </span>
              ) : (
                <>
                  Start Week 1 today
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </div>
          <p
            className="rm-reveal rm-fade text-xs text-ig-muted"
            style={delay(450)}
            aria-live="polite"
          >
            {committed
              ? "First step: create your GitHub account (5 min)"
              : "Your first step takes about 5 minutes"}
          </p>
        </div>
      </footer>

      <p role="status" className="sr-only">
        {done
          ? "Your roadmap is ready: three stages over four weeks, ending with a live GitHub project."
          : ""}
      </p>

      <ConfettiLayer bursts={bursts} onDone={removeBurst} />
    </section>
  );
}
