"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/context/AuthContext";
import CodeEditor from "@/features/compiler/components/CodeEditor";
import MilestoneCard from "./MilestoneCard";
import GraduatedHintDrawer from "./GraduatedHintDrawer";
import MilestoneSuccessModal from "./MilestoneSuccessModal";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  CloudCheck,
  RefreshCw,
  Sparkles,
  Terminal,
  FileCode,
  AlertCircle,
  HelpCircle,
  Maximize2,
  RotateCcw,
} from "lucide-react";

export default function ProjectWorkspace({ slug }) {
  const router = useRouter();
  const { user } = useAuth();

  // Workspace Data
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [workspaceData, setWorkspaceData] = useState(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState(1);
  const [currentCode, setCurrentCode] = useState("");
  const [activeFileName, setActiveFileName] = useState("main.py");

  // Output & Execution
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [saveStatus, setSaveStatus] = useState("synced"); // "synced" | "saving" | "error"
  const [coachSpeech, setCoachSpeech] = useState("Let's break this milestone down into small, solvable steps!");

  // Modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isUnlockingHint, setIsUnlockingHint] = useState(false);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  const saveTimeoutRef = useRef(null);
  const handleExecuteRef = useRef(null);

  // Keyboard Shortcut: Ctrl+Enter / Cmd+Enter to Run Code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleExecuteRef.current?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper: Token retriever
  const getAuthToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken ? await user.getIdToken() : null;
  }, [user]);

  // Load project workspace data
  const loadWorkspace = useCallback(async () => {
    try {
      // Optimistic cache check: instantly hydrate from localStorage to feel instant
      const cacheKey = `ignitio_proj_${slug}_1`;
      const localCached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (localCached) {
        setCurrentCode(localCached);
      }

      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/v2/projects/${slug}`, { headers });
      const json = await res.json();

      if (json.ok && json.data) {
        setProjectData(json.data.project);
        setWorkspaceData(json.data.workspace);

        const currentMilestone = json.data.workspace.currentMilestoneId || 1;
        setActiveMilestoneId(currentMilestone);

        const files = json.data.workspace.workingFiles || [];
        const entryFile = files.find((f) => f.path === "main.py") || files[0];

        // If local storage has newer edits, prefer it, otherwise use DB code
        const activeMilestoneCache = `ignitio_proj_${slug}_${currentMilestone}`;
        const activeCached = typeof window !== "undefined" ? localStorage.getItem(activeMilestoneCache) : null;

        const isValidCode = (c) => typeof c === "string" && c.trim().length > 0;
        const codeToSet = isValidCode(activeCached)
          ? activeCached
          : (isValidCode(entryFile?.content)
              ? entryFile.content
              : (json.data.project?.milestones?.[0]?.starterSnippet || ""));

        setCurrentCode(codeToSet);
        setActiveFileName(entryFile?.path || "main.py");
      }
    } catch (err) {
      console.error("[ProjectWorkspace] Load error:", err);
      setExecutionOutput(`Error loading workspace: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [slug, getAuthToken]);

  useEffect(() => {
    loadWorkspace(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadWorkspace]);

  // Handle Keystrokes: Local Cache + Debounced Backend Sync
  const handleCodeChange = (newCode) => {
    setCurrentCode(newCode);
    setSaveStatus("saving");

    // Instant local sync (0ms)
    const cacheKey = `ignitio_proj_${slug}_${activeMilestoneId}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey, newCode);
    }

    // Debounce save to database (1.5s)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          setSaveStatus("synced");
          return;
        }

        const res = await fetch(`/api/v2/projects/${slug}/progress`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentMilestoneId: activeMilestoneId,
            workingFiles: [{ path: activeFileName, content: newCode }],
          }),
        });

        if (res.ok) {
          setSaveStatus("synced");
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.warn("[ProjectWorkspace] Sync error:", err);
        setSaveStatus("error");
      }
    }, 1500);
  };

  // Reset Code to Original Starter Snippet / File
  const handleResetCode = () => {
    const files = workspaceData?.workingFiles || projectData?.starterFiles || [];
    const entryFile = files.find((f) => f.path === activeFileName) || files[0];
    const starter = entryFile?.content || currentMilestone?.starterSnippet || "";
    if (starter) {
      handleCodeChange(starter);
      setExecutionOutput("Template reset to starter milestone code.");
    }
  };

  // Run Code in Sandbox
  const handleExecute = async () => {
    if (!currentCode || currentCode.trim().length === 0) {
      setExecutionOutput("⚠️ Cannot execute empty code. Write your solution in the editor before running.");
      return;
    }

    try {
      setIsRunning(true);
      setExecutionOutput("Executing code in sandbox...\n");
      setTestResults([]);

      const token = await getAuthToken();
      if (!token) {
        setExecutionOutput("Please sign in to execute and verify your code.");
        setIsRunning(false);
        return;
      }

      const res = await fetch(`/api/v2/projects/${slug}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId: activeMilestoneId,
          code: currentCode,
          language: projectData?.language || "python3",
        }),
      });

      const json = await res.json();

      if (json.ok && json.data) {
        const { output, testResults: tests, allPassed } = json.data;
        setExecutionOutput(output || "Program finished with no output.");
        setTestResults(tests || []);

        if (allPassed) {
          setCoachSpeech("Brilliant! All tests passed. Lock in your milestone to complete the step!");
        } else {
          setCoachSpeech("Almost there! One or more assertions didn't match. Check output below.");
        }
      } else {
        setExecutionOutput(`Execution error: ${json.error || "Failed to execute"}`);
      }
    } catch (err) {
      setExecutionOutput(`Network error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Keep ref in sync via effect to avoid stale closure in Ctrl+Enter handler
  useEffect(() => {
    handleExecuteRef.current = handleExecute;
  }); // no dep array — intentionally runs every render to stay fresh

  // Step Verification Trigger
  const handleVerifyStep = async () => {
    if (testResults.length === 0 || !testResults.every((t) => t.passed)) {
      await handleExecute();
      return;
    }
    setIsSuccessModalOpen(true);
  };

  // Complete Milestone
  const handleProceedMilestone = async (reflectionAnswer) => {
    try {
      setIsSubmittingCompletion(true);
      const token = await getAuthToken();
      if (!token) return;

      const res = await fetch(`/api/v2/projects/${slug}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId: activeMilestoneId,
          reflectionAnswer: reflectionAnswer || undefined,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setIsSuccessModalOpen(false);
        if (json.data.isProjectCompleted) {
          router.push("/home/projects");
        } else {
          setActiveMilestoneId(json.data.nextMilestoneId);
          loadWorkspace();
        }
      }
    } catch (err) {
      console.error("[ProjectWorkspace] Complete error:", err);
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Unlock Graduated Hint
  const handleUnlockHint = async (hintLevel) => {
    try {
      setIsUnlockingHint(true);
      const token = await getAuthToken();
      if (!token) return;

      const res = await fetch(`/api/v2/projects/${slug}/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          milestoneId: activeMilestoneId,
          hintLevel,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        loadWorkspace();
      }
    } catch (err) {
      console.error("[ProjectWorkspace] Unlock hint error:", err);
    } finally {
      setIsUnlockingHint(false);
    }
  };

  const milestones = projectData?.milestones || [];
  const currentMilestone = milestones.find((m) => m.milestoneId === activeMilestoneId) || milestones[0];
  const completedMilestones = workspaceData?.completedMilestones || [];
  const isFinalMilestone = activeMilestoneId >= milestones.length;

  return (
    <div className="min-h-screen bg-[#FCF5EE] text-[#19183B] select-none pb-12">
      {/* ── WORKSPACE HEADER ── */}
      <header
        className="sticky top-0 z-30 px-4 py-3 backdrop-blur-md"
        style={{
          background: "rgba(242, 224, 208, 0.95)",
          borderBottom: "1px solid #DFC8B5",
          boxShadow: "0 2px 10px rgba(25, 24, 59, 0.04)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Left: Back & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/home/projects"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-[#DFC8B5] text-[#19183B] shadow-2xs transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-[#19183B] tracking-tight">
                  {projectData?.title || "Loading Mission..."}
                </h1>
                <span className="rounded-lg bg-[#00A9FF]/15 px-2 py-0.5 text-[10px] font-black uppercase text-[#0085C7]">
                  {projectData?.track || "Code"}
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#19183B]/55">
                Milestone {activeMilestoneId} of {milestones.length || 3}
              </p>
            </div>
          </div>

          {/* Right: Autosave status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#19183B]/70 bg-white/70 px-3 py-1 rounded-xl border border-[#DFC8B5]/60 shadow-2xs">
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-[#00A9FF]" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "error" ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sync Pending</span>
                </>
              ) : (
                <>
                  <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Saved</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE SPLIT-VIEW (UNIFIED ARENA) ── */}
      <main className="mx-auto max-w-7xl p-3 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── LEFT PANE: UNIFIED MISSION CONSOLE (5 COLS) ── */}
          <section className="lg:col-span-5 space-y-4">
            <div className="overflow-hidden rounded-[24px] bg-white border border-[#DFC8B5] shadow-sm p-5 space-y-4">
              {/* Coach Guidance Header */}
              <div className="flex items-start gap-3 rounded-2xl bg-[#FCF5EE] border border-[#DFC8B5]/80 p-3.5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#00A9FF] text-white shadow-[0_2px_0_#0085C7] text-base font-black">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#19183B]">
                      Mission Guide
                    </span>
                    <span className="text-[10px] font-extrabold text-[#0085C7] bg-[#00A9FF]/15 px-2 py-0.5 rounded-full">
                      Step {activeMilestoneId} of {milestones.length || 3}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[#19183B]/80">
                    {coachSpeech}
                  </p>
                </div>
              </div>

              {/* Milestone Step Selector Chips */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#19183B]/45">
                  Milestones
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {milestones.map((m) => {
                    const isDone = completedMilestones.includes(m.milestoneId);
                    const isCurrent = m.milestoneId === activeMilestoneId;

                    return (
                      <button
                        key={m.milestoneId}
                        type="button"
                        onClick={() => setActiveMilestoneId(m.milestoneId)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                          isCurrent
                            ? "bg-[#00A9FF] text-white shadow-[0_2px_0_#0085C7] translate-y-[-1px]"
                            : isDone
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/60"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
                        } active:scale-95`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-md text-[9px] font-black ${
                            isCurrent
                              ? "bg-white text-[#0085C7]"
                              : isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isDone ? "✓" : m.milestoneId}
                        </span>
                        <span>Step {m.milestoneId}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Milestone Title & Brief */}
              <div className="border-t border-slate-100 pt-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#00A9FF]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0085C7]">
                    Active Goal
                  </span>
                  <h2 className="text-base font-black text-[#19183B] tracking-tight">
                    {currentMilestone?.title}
                  </h2>
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-[#19183B]/75">
                  {currentMilestone?.brief}
                </p>
              </div>

              {/* Action Checklist */}
              {currentMilestone?.instructions?.length > 0 && (
                <div className="rounded-2xl bg-[#FCF5EE]/60 border border-[#DFC8B5]/60 p-3.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#19183B]/60">
                    Action Checklist
                  </span>
                  <ul className="mt-2 space-y-2">
                    {currentMilestone.instructions.map((inst, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs font-medium text-[#19183B]/85 leading-relaxed"
                      >
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#00A9FF]/20 text-[10px] font-black text-[#0085C7]">
                          {idx + 1}
                        </span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expected Verification */}
              {currentMilestone?.testCases?.length > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#00A9FF]" />
                    <span className="font-extrabold text-[#19183B]">Automated Check:</span>
                    <span className="text-slate-600 font-medium">
                      {currentMilestone.testCases[0]?.name || "Input & Output Validation"}
                    </span>
                  </div>
                  <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5">
                    Live Runner
                  </span>
                </div>
              )}

              {/* Graduated Hints Drawer */}
              {currentMilestone?.hints?.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <GraduatedHintDrawer
                    milestoneId={activeMilestoneId}
                    hints={currentMilestone.hints}
                    unlockedHints={workspaceData?.unlockedHints || []}
                    onUnlockHint={handleUnlockHint}
                    isUnlocking={isUnlockingHint}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── RIGHT PANE: ARENA IDE & TERMINAL (7 COLS) ── */}
          <section className="lg:col-span-7 space-y-4">
            {/* Integrated IDE Shell */}
            <div className="overflow-hidden rounded-[24px] bg-[#0f172a] border border-slate-800 shadow-md">
              {/* Tab Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1 border border-slate-700/80 text-xs font-bold text-slate-200">
                    <FileCode className="h-3.5 w-3.5 text-[#00A9FF]" />
                    <span>{activeFileName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetCode}
                    title="Reset to starter milestone template"
                    className="flex items-center gap-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300 transition-all active:scale-95"
                  >
                    <RotateCcw className="h-3 w-3 text-amber-400" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {projectData?.language === "python3" ? "Python 3 Sandbox" : projectData?.language || "Live Compiler"}
                  </span>
                </div>
              </div>

              {/* In-Browser Code Editor */}
              <div className="relative h-[340px] sm:h-[390px] w-full overflow-hidden bg-[#0f172a]">
                <CodeEditor
                  value={currentCode}
                  onChange={handleCodeChange}
                  language={projectData?.language || "python3"}
                  dark={true}
                  className="!rounded-none !border-0"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#1e293b] border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={handleExecute}
                    className="flex items-center gap-2 rounded-xl bg-[#00A9FF] px-5 py-2.5 text-xs font-black text-white shadow-[0_3px_0_#0085C7] hover:bg-[#0098e6] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>{isRunning ? "Running Sandbox..." : "Run Code"}</span>
                  </button>

                  <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400 font-mono">
                    Ctrl + Enter
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {testResults.length > 0 && testResults.every((t) => t.passed) ? (
                    <button
                      type="button"
                      onClick={handleVerifyStep}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-black text-white shadow-[0_3px_0_#047857] hover:brightness-110 active:translate-y-[2px] active:shadow-none transition-all animate-pulse cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Lock In Milestone {activeMilestoneId} ➔</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyStep}
                      className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>Verify Step</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Test Assertion Badges Strip */}
              {testResults.length > 0 && (
                <div className="border-t border-slate-800 bg-[#0b1120] p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>Automated Verification Tests</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-extrabold ${
                        testResults.every((t) => t.passed)
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                          : "bg-rose-950 text-rose-400 border border-rose-700"
                      }`}
                    >
                      {testResults.filter((t) => t.passed).length}/{testResults.length} Passed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {testResults.map((t, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-1 rounded-xl p-2.5 text-xs font-bold border transition-all ${
                          t.passed
                            ? "border-emerald-700/60 bg-emerald-950/50 text-emerald-300"
                            : "border-rose-700/60 bg-rose-950/50 text-rose-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{t.name}</span>
                          <span>{t.passed ? "✓ Passed" : "✗ Needs Fix"}</span>
                        </div>
                        {t.reason && !t.passed && (
                          <p className="text-[10px] font-medium text-rose-300/85 leading-snug">
                            {t.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terminal Standard Output Console */}
              <div className="border-t border-slate-800 bg-[#090d16]">
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#0b101b] border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <Terminal className="h-3 w-3 text-[#00A9FF]" />
                    <span>CONSOLE OUTPUT</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">STDIN / STDOUT</span>
                </div>

                <pre className="p-3.5 text-xs font-mono text-emerald-400 min-h-[100px] max-h-[180px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                  {executionOutput || "Click 'Run Code' or press Ctrl+Enter to test your solution."}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── MILESTONE COMPLETION MODAL ── */}
      <MilestoneSuccessModal
        isOpen={isSuccessModalOpen}
        milestone={currentMilestone}
        isProjectComplete={isFinalMilestone}
        onProceed={handleProceedMilestone}
        isSubmitting={isSubmittingCompletion}
      />
    </div>
  );
}
