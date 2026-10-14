"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ResultsLoader from "./components/ResultsLoader";
import ResultsActions from "./components/ResultsActions";
import { motion, AnimatePresence } from "framer-motion";
import { buildDiagnosticResults } from "./server/buildDiagnosticResults";

export default function PreviewDiagnosticResults() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isAnimatingLoader, setIsAnimatingLoader] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    let payload = {};
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("genai_preview_assessment");
      if (stored) {
        try {
          payload = JSON.parse(stored);
        } catch (e) {}
      }
    }

    // ponytail: lazy mock grading for unauth preview - assume passed for everything answered
    const responses = Object.keys(payload)
      .filter(k => k !== "diagnosticPath")
      .map(k => ({ questionId: k, passed: true }));

    const doc = {
      responses,
      dailyDurationCategory: payload.Q9 || "45_60",
      primaryGoalSnapshot: payload.Q10 || "curiosity_general",
    };

    setData(buildDiagnosticResults(doc));
  }, []);

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/auth/signup?from=genai_preview");
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#07131D] text-white relative">
      <AnimatePresence mode="wait">
        {isAnimatingLoader ? (
          <ResultsLoader key="loader" onComplete={() => setIsAnimatingLoader(false)} />
        ) : data ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex-col flex-grow flex"
          >
            <div className="w-full max-w-[430px] mx-auto flex flex-col pt-12 pb-12 px-4 flex-grow">
              <header className="mb-10 text-center">
                <h1 className="mb-4 text-3xl font-bold sm:text-4xl text-white">
                  Your transformation starts here.
                </h1>
                <p className="text-lg text-slate-300">
                  We analyzed how you think and learn. This path is built for you — no one else.
                </p>
              </header>

              <div className="w-full flex-grow mt-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 px-4 leading-tight">
                  {(data.summary?.passedChecks ?? 0) > 0
                    ? "You're already ahead. Your roadmap skips what you've mastered."
                    : "Your path is clear. Every step is a level up."}
                </h2>

                {(data.summary?.passedChecks ?? 0) > 0 && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-[#102235] border border-slate-700/60 rounded-full px-4 py-2 inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-pulse"></span>
                      <span className="text-sm font-semibold text-[#E0F2FE]">
                        You already know {data.summary.passedChecks} of {data.summary.totalChecks} topics
                      </span>
                    </div>
                  </div>
                )}

                {/* Scroll Prompt */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  transition={{ opacity: { delay: 1, duration: 1 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                  className="flex flex-col items-center justify-center mb-10 text-[#0EA5E9]"
                >
                  <span className="text-xs uppercase tracking-widest font-semibold mb-1">Scroll to see your transformation map</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7"/>
                  </svg>
                </motion.div>

                {/* Roadmap spine + alternating nodes */}
                <div className="relative flex flex-col items-center w-full pb-8">
                  {data.areas.map((area, index) => {
                    const isLeft = index % 2 === 0;
                    const isPassed = area.status === 'passed';
                    const isLast = index === data.areas.length - 1;
                    
                    const bgColor = isPassed ? "#1E293B" : "#0EA5E9";
                    const borderColor = isPassed ? "#334155" : "#0EA5E9";
                    const shadowColor = isPassed ? "#0F172A" : "#0284C7";
                    const textColor = isPassed ? "#94A3B8" : "#FFFFFF";
                    const labelColor = isPassed ? "#64748B" : "#E0F2FE";

                    return (
                      <div key={area.id} className="relative w-full h-[140px]">
                        {!isLast && (
                          <motion.svg 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewBox="0 0 400 140" 
                            preserveAspectRatio="none" 
                            className="absolute top-1/2 left-0 w-full h-[140px] z-0 pointer-events-none"
                          >
                            <path 
                              d={isLeft 
                                ? "M 120 0 C 120 70, 280 70, 280 140" 
                                : "M 280 0 C 280 70, 120 70, 120 140"} 
                              stroke="#0EA5E9" strokeOpacity="0.4" strokeWidth="4" strokeDasharray="8 8" fill="none" vectorEffect="non-scaling-stroke" 
                            />
                          </motion.svg>
                        )}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                          className={`absolute top-1/2 -translate-y-1/2 w-[44%] sm:w-[40%] z-20 ${isLeft ? "left-[8%] sm:left-[10%]" : "right-[8%] sm:right-[10%]"}`}
                        >
                          <div 
                            className="cursor-pointer transition-all duration-200 rounded-[2rem] p-4 font-medium select-none flex flex-col items-center justify-center text-center relative w-full min-h-[80px]"
                            style={{ backgroundColor: bgColor, color: textColor, border: `2px solid ${borderColor}`, boxShadow: `0 6px 0 ${shadowColor}`, transform: "translateY(0)" }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(6px)"; e.currentTarget.style.boxShadow = `0 0px 0 ${shadowColor}`; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 0 ${shadowColor}`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 0 ${shadowColor}`; }}
                          >
                            <p className="text-[13px] font-bold leading-snug mb-1">{area.title}</p>
                            {area.moduleLabel && (
                              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: labelColor }}>
                                {area.moduleLabel}
                              </span>
                            )}
                          </div>
                          <div className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-[calc(100%+12px)] sm:left-[calc(100%+16px)]" : "right-[calc(100%+12px)] sm:right-[calc(100%+16px)]"}`}>
                            <span className={`whitespace-nowrap text-[9px] font-semibold uppercase tracking-widest ${isPassed ? "text-[#0EA5E9]" : "text-slate-500"}`}>
                              {isPassed ? "already yours" : area.status === "partial" ? "almost there" : "your next unlock"}
                            </span>
                          </div>
                          {isPassed && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0, rotate: -45 }}
                              whileInView={{ scale: [0, 1.2, 1], opacity: [0, 1, 0], rotate: 45 }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className="absolute -top-3 -right-3 w-8 h-8 pointer-events-none"
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" fill="#0EA5E9"/>
                              </svg>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8 pb-4 pt-6 border-t border-slate-700/40">
                  {data.pacing?.label && (
                    <div className="flex-1 bg-gradient-to-br from-[#102235] to-[#0A1622] border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#0EA5E9] opacity-5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                      <p className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-widest mb-1.5 opacity-80">Your Pace</p>
                      <p className="text-white text-[15px] font-bold tracking-tight">{data.pacing.label}</p>
                    </div>
                  )}
                  {data.goal?.label && (
                    <div className="flex-1 bg-gradient-to-br from-[#102235] to-[#0A1622] border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#FCD34D] opacity-5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
                      <p className="text-[10px] font-bold text-[#FCD34D] uppercase tracking-widest mb-1.5 opacity-80">Your Target</p>
                      <p className="text-white text-[15px] font-bold tracking-tight">{data.goal.label}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <ResultsActions
                  onContinue={handleContinue}
                  isContinuing={isContinuing}
                />
              </div>

            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
