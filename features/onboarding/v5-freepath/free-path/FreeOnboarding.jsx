"use client";

/**
 * FreeOnboarding — the global onboarding controller.
 *
 * State machine:
 *   goal → year → [shortcut | knowledge_check] → [diagnostic | beginner_stitch] → [reveal] → roadmap_result → auth
 *
 * Paths:
 *   A (Shortcut):   goal + year = 3rd/4th + internship/job/gen_ai → shortcut → exits to Gen AI module
 *   B (Beginner):   knowledge_check "no" → assigns all 4 skills → roadmap_result → auth
 *   C (Diagnostic): knowledge_check "yes" → 12-card diagnostic → reveal → roadmap_result → auth
 *
 * Tap budget:
 *   A: goal(1) + year(1) + shortcut(1) = 3 taps
 *   B: goal(1) + year(1) + knowledge_check(1) = 3 taps
 *   C: goal(1) + year(1) + knowledge_check(1) + [diagnostic auto-advances] + reveal(1) = 5 taps
 *
 * Notification ask moved to post-first-lesson (streak celebration screen).
 *
 * onboarding_progress localStorage key persists across refreshes so users
 * never redo goal/year/diagnostic after abandoning before signup.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/context/AuthContext";
import {
  classifyFreePathSkills,
  buildFreeRoadmap,
} from "@/lib/onboarding/free-path-classifier";
import { SKILL_ORDER } from "@/lib/onboarding/free-path-questions";

import GoalScreen from "./screens/GoalScreen";
import YearScreen from "./screens/YearScreen";
import ShortcutScreen from "./screens/ShortcutScreen";
import KnowledgeCheckScreen from "./screens/KnowledgeCheckScreen";
import FreeDiagnostic from "./FreeDiagnostic";
import RevealScreen from "./screens/RevealScreen";
import MonthRoadmapResult from "./screens/MonthRoadmapResult";
import KiboSignupBridge from "./screens/KiboSignupBridge";

// ── Additional stage rules ───────────────────────────────────────────────────
// Returns stage IDs to append after the base free-path skills.
// The IDs must exist in STAGES in roadmap-data.js.
//
// Rules:
//   1st/2nd year + project goal   → Prompt Engineering (after foundation)
//   3rd/4th year + internship/job → Prompt Engineering + System Design
//   everyone else                 → no additional stages
function getAdditionalStages(goal, year) {
  const isEarlyYear = year === "1" || year === "2";
  const isLateYear = year === "3" || year === "4";

  if (goal === "dsa") return ["dsa"];
  if (isEarlyYear && goal === "project") return ["prompt"];
  if (isLateYear && (goal === "internship" || goal === "job"))
    return ["prompt", "system_design"];
  return [];
}

// ── Screen names ────────────────────────────────────────────────────────────
const SCREENS = {
  GOAL: "goal",
  YEAR: "year",
  SHORTCUT: "shortcut",
  KNOWLEDGE_CHECK: "knowledge_check",
  DIAGNOSTIC: "diagnostic",
  REVEAL: "reveal",
  ROADMAP_RESULT: "roadmap_result",
  SIGNUP_BRIDGE: "signup_bridge",
};

// ── Path A trigger conditions ────────────────────────────────────────────────
const SHORTCUT_GOALS = new Set(["internship", "job", "gen_ai"]);
const SHORTCUT_YEARS = new Set(["3", "4"]);

function isShortcutPath(goal, year) {
  return SHORTCUT_GOALS.has(goal) && SHORTCUT_YEARS.has(year);
}

// ── localStorage persistence (edge-case: never block on parse errors) ───────
const STORAGE_KEY = "ignitio:free_onboarding_v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — not a fatal error
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ── Main controller ──────────────────────────────────────────────────────────
export default function FreeOnboarding() {
  const { user } = useAuth();
  // routing hook for the routing
  const router = useRouter();
  const searchParams = useSearchParams();

  const [screen, setScreen] = useState(SCREENS.YEAR);
  const [goal, setGoal] = useState(null);
  const [year, setYear] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null); // Array<{ skillId, verdict, include }>
  const [roadmap, setRoadmap] = useState(null); // string[] of skillIds
  const [path, setPath] = useState(null); // "A" | "B" | "C

  // Restore progress on mount — users should never redo the diagnostic after abandoning
  useEffect(() => {
    const saved = loadSaved();
    const stepParam = searchParams?.get("step");
    const resumeParam = searchParams?.get("resume");

    let initialGoal = saved?.goal || null;
    let initialYear = saved?.year || null;

    if (!initialGoal || !initialYear) {
      try {
        const genaiEntry = JSON.parse(localStorage.getItem("ignitio:genai_entry"));
        if (genaiEntry) {
          if (!initialGoal) initialGoal = genaiEntry.goal;
          if (!initialYear) initialYear = genaiEntry.year;
        }
      } catch {}
    }

    if (initialGoal) setGoal(initialGoal);
    if (initialYear) setYear(initialYear);

    // Resuming from paywall skip: "Continue with Foundation" routes into the free onboarding path's question set
    if (resumeParam === "foundation") {
      setPath("C");
      setScreen(SCREENS.KNOWLEDGE_CHECK);
      return;
    }

    // Boundary return: user hit back from Gen AI diagnostic screen 1
    if (stepParam === "shortcut") {
      setScreen(SCREENS.SHORTCUT);
      return;
    }

    if (!saved) return;

    setTimeout(() => {
      if (saved.screen) setScreen(saved.screen);
      if (saved.goal) setGoal(saved.goal);
      if (saved.year) setYear(saved.year);
      if (saved.diagnosticResults)
        setDiagnosticResults(saved.diagnosticResults);
      if (saved.roadmap) {
        const isDsaGoal = saved.goal === "dsa";
        let roadmapAdjusted = saved.roadmap;
        if (isDsaGoal) {
          roadmapAdjusted = ["dsa"];
        } else {
          roadmapAdjusted = saved.roadmap.filter((s) => s !== "dsa");
        }
        setRoadmap(roadmapAdjusted);
      }
      if (saved.path) setPath(saved.path);
    }, 0);
  }, [user, searchParams]);

  // Persist whenever key state changes
  useEffect(() => {
    persist({ screen, goal, year, diagnosticResults, roadmap, path });
  }, [screen, goal, year, diagnosticResults, roadmap, path]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleYear = useCallback((selectedYear) => {
    setYear(selectedYear);
    setScreen(SCREENS.GOAL);
  }, []);

  const handleGoal = useCallback(
    (selectedGoal) => {
      setGoal(selectedGoal);

      // Fast-track DSA directly to roadmap result
      if (selectedGoal === "dsa") {
        setPath("B");
        setRoadmap(["dsa"]);
        setDiagnosticResults(null);
        setScreen(SCREENS.ROADMAP_RESULT);
        return;
      }

      // Path A shortcut check
      if (isShortcutPath(selectedGoal, year)) {
        setScreen(SCREENS.SHORTCUT);
      } else {
        setScreen(SCREENS.KNOWLEDGE_CHECK);
      }
    },
    [year],
  );

  const handleShortcutFastTrack = useCallback(() => {
    // Path A — exit to Gen AI module's own onboarding
    setPath("A");
    persist({ screen: SCREENS.SHORTCUT, goal, year, path: "A" });
    // Preserve goal/year in a separate key for the Gen AI module to read
    try {
      localStorage.setItem(
        "ignitio:genai_entry",
        JSON.stringify({ goal, year }),
      );
    } catch {
      // ignore
    }
    router.push("/onboarding/diagnostic");
  }, [goal, year, router]);

  const handleShortcutSeeBasics = useCallback(() => {
    setScreen(SCREENS.KNOWLEDGE_CHECK);
  }, []);

  const handleKnowledgeCheckBeginner = useCallback(() => {
    // Path B — assign skills, no diagnostic
    setPath("B");
    const additional = getAdditionalStages(goal, year).filter(
      (s) => s !== "dsa",
    );
    const fullRoadmap =
      goal === "dsa"
        ? ["dsa"]
        : [...SKILL_ORDER, ...additional];
    setRoadmap(fullRoadmap);
    setDiagnosticResults(null);
    setScreen(SCREENS.ROADMAP_RESULT);
  }, [goal, year]);

  const handleKnowledgeCheckKnows = useCallback(() => {
    // Path C — run the diagnostic
    setScreen(SCREENS.DIAGNOSTIC);
  }, []);

  const handleDiagnosticComplete = useCallback(
    (answers) => {
      // Classify answers → build roadmap
      const results = classifyFreePathSkills(answers);
      const finalRoadmap = buildFreeRoadmap(results);

      // Edge case: if classifier excluded everything somehow, put all skills back in
      const baseRoadmap =
        finalRoadmap.length > 0 ? finalRoadmap : [...SKILL_ORDER];

      setPath("C");
      setDiagnosticResults(results);
      const additional = getAdditionalStages(goal, year).filter(
        (s) => s !== "dsa",
      );
      const combined =
        goal === "dsa"
          ? ["dsa"]
          : [...baseRoadmap.filter((s) => s !== "dsa"), ...additional];
      setRoadmap(combined);
      setScreen(SCREENS.REVEAL);
    },
    [goal, year],
  );

  const handleRevealNext = useCallback(() => {
    setScreen(SCREENS.ROADMAP_RESULT);
  }, []);

  // ponytail: same map as streak/page.js — skills routing
  const LESSON_ROUTES = {
    git: "/home/roadmaps/git-github/interactive-overviews/first-overview",
    python: "/home/roadmaps/python-beginner",
    dsa: "/home/roadmaps/dsa",
  };

  // ponytail: skill → roadmap route ID mapping
  const SKILL_TO_ROADMAP_ID = {
    git: "git-github",
    python: "python-beginner",
    prompt: "prompt-engineering",
    system_design: "system-design-fundamentals",
    dsa: "dsa",
  };

  const handleRoadmapResultContinue = useCallback(() => {
    // Persist onboarding result before auth so it survives the auth flow
    try {
      localStorage.setItem(
        "ignitio:onboarding_result",
        JSON.stringify({
          goal,
          year,
          path,
          roadmap,
          diagnosticResults,
          completedAt: new Date().toISOString(),
        }),
      );
      // Durable filter key — never cleared by syncOnboardingFromLocalStorage.
      // Dashboard reads this to show only the user's assigned roadmaps.
      if (goal === "dsa") {
        localStorage.setItem(
          "ignitio:assigned_roadmaps",
          JSON.stringify(["dsa"]),
        );
      } else if (roadmap?.length) {
        const roadmapIds = roadmap
          .map((s) => SKILL_TO_ROADMAP_ID[s])
          .filter(Boolean);
        localStorage.setItem(
          "ignitio:assigned_roadmaps",
          JSON.stringify(roadmapIds),
        );
      }
      // Set streak phase so /onboarding/streak shows StreakAnticipation
      localStorage.setItem("ignitio:streak_phase", "anticipated");
      // Write lesson href separately — survives syncOnboardingFromLocalStorage clearing onboarding_result
      const firstSkill = goal === "dsa" ? "dsa" : (roadmap?.[0] || "python");
      localStorage.setItem(
        "ignitio:streak_lesson_href",
        LESSON_ROUTES[firstSkill] ?? (goal === "dsa" ? "/home/roadmaps/dsa" : "/home/roadmaps/python-beginner"),
      );
    } catch {
      // ignore
    }

    clearPersisted();

    // If already authenticated, activate and proceed directly — no bridge needed.
    if (user) {
      (async () => {
        try {
          const idToken = await user.getIdToken();
          const { deriveScheduleFromBrowser } =
            await import("@/lib/onboarding/schedule-periods");
          const { syncOnboardingFromLocalStorage } =
            await import("@/lib/onboarding/sync-localstorage");

          const derived = deriveScheduleFromBrowser();
          await syncOnboardingFromLocalStorage(idToken);

          await fetch("/api/v2/onboarding/role-schedule", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              role: "developer",
              schedule: {
                timezone: derived.timezone,
                windows: [
                  {
                    period: derived.period,
                    startTime: derived.startTime,
                    endTime: derived.endTime,
                  },
                ],
              },
            }),
          });

          await fetch("/api/v2/onboarding/activate", {
            method: "POST",
            headers: { Authorization: `Bearer ${idToken}` },
          });

          window.location.href = "/onboarding/streak";
        } catch {
          window.location.href = "/onboarding/streak";
        }
      })();
    } else {
      // Show Kibo bridge before the signup form for unauthenticated users
      setScreen(SCREENS.SIGNUP_BRIDGE);
    }
  }, [goal, year, path, roadmap, diagnosticResults, user]);

  const handleSignupBridgeContinue = useCallback(() => {
    // ?from=freepath tells SignupForm to render the dark onboarding theme
    window.location.href = "/auth/signup?from=freepath";
  }, []);

  // ── Screen rendering ─────────────────────────────────────────────────────────

  if (screen === SCREENS.YEAR) {
    return <YearScreen onNext={handleYear} initialYear={year} />;
  }

  if (screen === SCREENS.GOAL) {
    return (
      <GoalScreen
        onNext={handleGoal}
        onBack={() => setScreen(SCREENS.YEAR)}
        initialGoal={goal}
      />
    );
  }

  if (screen === SCREENS.SHORTCUT) {
    return (
      <ShortcutScreen
        onFastTrack={handleShortcutFastTrack}
        onSeeBasics={handleShortcutSeeBasics}
        onBack={() => setScreen(SCREENS.GOAL)}
      />
    );
  }

  if (screen === SCREENS.KNOWLEDGE_CHECK) {
    return (
      <KnowledgeCheckScreen
        onKnowsSomething={handleKnowledgeCheckKnows}
        onBeginner={handleKnowledgeCheckBeginner}
        onBack={() => {
          // If we got here from shortcut, go back to shortcut
          if (isShortcutPath(goal, year)) {
            setScreen(SCREENS.SHORTCUT);
          } else {
            setScreen(SCREENS.YEAR);
          }
        }}
      />
    );
  }

  if (screen === SCREENS.DIAGNOSTIC) {
    return <FreeDiagnostic onComplete={handleDiagnosticComplete} />;
  }

  if (screen === SCREENS.REVEAL && diagnosticResults) {
    return (
      <RevealScreen results={diagnosticResults} onNext={handleRevealNext} />
    );
  }

  if (screen === SCREENS.ROADMAP_RESULT && roadmap) {
    return (
      <MonthRoadmapResult
        roadmap={roadmap}
        path={path}
        goal={goal}
        onContinue={handleRoadmapResultContinue}
        onBack={() => {
          if (path === "C") return setScreen(SCREENS.REVEAL);
          if (goal === "dsa") return setScreen(SCREENS.GOAL);
          return setScreen(SCREENS.KNOWLEDGE_CHECK);
        }}
      />
    );
  }

  if (screen === SCREENS.SIGNUP_BRIDGE) {
    return <KiboSignupBridge onContinue={handleSignupBridgeContinue} />;
  }

  // Fallback — should not be reached in normal flow
  return <YearScreen onNext={handleYear} />;
}
