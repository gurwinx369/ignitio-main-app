"use client";
// features/kyle/behavior-quiz/BehaviorQuizModal.jsx
//
// Behavior quiz UI — zero internal state, all state from useBehaviorQuiz.
//
// Timer phases:
//   Normal (timerSec > 0):  amber ring counting 60→0
//   Grace (isInGrace):      red ring counting 10→0 (graceTimerSec)
//   Timed out (isTimedOut): "Time's Up" screen, user clicks Continue

import React, { useEffect } from "react";
import Image from "next/image";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

function TimerRing({ timerSec, graceTimerSec, isInGrace, isTimedOut }) {
  // Normal phase: counts 60→0 on a 60-unit ring
  // Grace phase: counts 10→0 on a 10-unit ring (restarts the ring in red)
  const total = isInGrace ? 10 : 60;
  const current = isInGrace ? graceTimerSec : timerSec;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const fill = isTimedOut ? 0 : (current / total) * circumference;
  const stroke = isInGrace ? "#ef4444" : "#f59e0b";
  const textColor = isInGrace ? "text-red-500" : "text-amber-600";
  const display = isTimedOut ? 0 : current;

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - fill}
          style={{ transition: "stroke-dashoffset 0.2s linear, stroke 0.4s ease" }}
        />
      </svg>
      <span className={`text-sm font-bold tabular-nums ${textColor}`}>{display}s</span>
    </div>
  );
}

function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-orange-50 bg-white">
      <span className="text-xs font-semibold text-gray-500 shrink-0">{current + 1} / {total}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function BehaviorQuizModal({
  isOpen,
  currentItem,
  currentIndex,
  totalItems,
  selectedOption,
  isCorrect,
  timerSec,
  graceTimerSec,
  isInGrace,
  isTimedOut,
  recordAnswer,
  recordUnattempted,
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  const hasAnswered = selectedOption !== null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Behavior Knowledge Quiz"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-orange-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/kyle/kyle.svg"
                alt="Kyle"
                width={48}
                height={48}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Knowledge Check</h3>
              <p className="text-sm text-gray-500">Alright. Let&apos;s see if you were actually watching.</p>
            </div>
          </div>
          {!hasAnswered && (
            <TimerRing
              timerSec={timerSec}
              graceTimerSec={graceTimerSec}
              isInGrace={isInGrace}
              isTimedOut={isTimedOut}
            />
          )}
        </div>

        {/* Progress */}
        <ProgressBar current={currentIndex} total={totalItems} />

        {/* Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[70vh]">

          {/* Grace period warning banner */}
          {isInGrace && !hasAnswered && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-2xl">
              <Clock className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm font-medium text-red-700">
                Running out of time — {graceTimerSec}s left!
              </p>
            </div>
          )}

          {/* Timed out screen */}
          {isTimedOut && !hasAnswered && (
            <div className="flex flex-col items-center text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Time&apos;s Up</h4>
                <p className="text-gray-500 text-sm mt-1">No answer recorded for this question.</p>
              </div>
              <button
                id="behavior-quiz-continue-btn"
                onClick={recordUnattempted}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all shadow-md active:scale-95"
              >
                Continue
              </button>
            </div>
          )}

          {/* Normal / grace question */}
          {!isTimedOut && (
            <div className="space-y-5">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                  {currentItem.concept}
                </span>
                <h4 className="text-lg font-bold text-gray-800 leading-snug">
                  {currentItem.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentItem.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isRight = option === currentItem.correctOption;

                  let cls = "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm";
                  if (!hasAnswered) {
                    cls += " border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] cursor-pointer";
                  } else if (isRight) {
                    cls += " border-green-400 bg-green-50 text-green-800";
                  } else if (isSelected) {
                    cls += " border-red-400 bg-red-50 text-red-800";
                  } else {
                    cls += " border-gray-200 bg-white text-gray-400 opacity-60";
                  }

                  let bulletCls = "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ";
                  if (!hasAnswered) bulletCls += "bg-gray-100 text-gray-500";
                  else if (isRight) bulletCls += "bg-green-500 text-white";
                  else if (isSelected) bulletCls += "bg-red-500 text-white";
                  else bulletCls += "bg-gray-100 text-gray-400";

                  return (
                    <button
                      key={idx}
                      id={`behavior-quiz-option-${idx}`}
                      onClick={() => !hasAnswered && recordAnswer(option)}
                      disabled={hasAnswered}
                      className={cls}
                    >
                      <div className="flex items-center gap-3">
                        <span className={bulletCls}>{String.fromCharCode(65 + idx)}</span>
                        <span className="leading-relaxed">{option}</span>
                        {hasAnswered && isRight && <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />}
                        {hasAnswered && isSelected && !isRight && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback banner */}
              {hasAnswered && isCorrect !== null && (
                <div className={`flex items-center gap-2 p-3.5 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  {isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  <p className={`text-sm font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                    {isCorrect ? "Correct! Moving on…" : "Incorrect — correct answer highlighted above"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
