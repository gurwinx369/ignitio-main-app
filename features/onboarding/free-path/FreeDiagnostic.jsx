"use client";

import { useState, useCallback, useRef } from "react";
import DiagnosticProgress from "@/features/onboarding/diagnostic/components/DiagnosticProgress";
import { FREE_PATH_QUESTIONS, SKILL_LABELS } from "@/lib/onboarding/free-path-questions";
import KiboBody from "@/features/kyle/pet/KiboBody";
import TextType from "@/components/ui/TextType";
import { useKiboEyeTracking } from "@/features/kyle/pet/useKiboEyeTracking";
// Splits a title string on backtick (`...`) and single-quote ('...') delimiters.
// Returns an array of { text, highlight } segments with delimiters stripped.
function parseTitleSegments(title) {
  const segments = [];
  const pattern = /(`[^`]+`|'[^']+')/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(title)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: title.slice(lastIndex, match.index), highlight: false });
    }
    segments.push({ text: match[0].slice(1, -1), highlight: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < title.length) {
    segments.push({ text: title.slice(lastIndex), highlight: false });
  }
  return segments;
}

// Thin CSS marker-pen highlight — a gradient strip covering the bottom 38% of
// the line height. Works correctly on wrapped text (each line gets its own strip),
// never overflows, and requires zero JS/ResizeObserver overhead.
const KEYWORD_STYLE = {
  background: "linear-gradient(transparent 56%, rgba(0, 169, 255, 0.32) 44%)",
  borderRadius: "2px",
  paddingInline: "1px",
};

function HighlightedTitle({ title }) {
  const segments = parseTitleSegments(title);
  if (!segments.some((s) => s.highlight)) return <span>{title}</span>;
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} style={KEYWORD_STYLE} className="bg-transparent">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

const FOMO_MESSAGES = [
  "Your peers are already mastering this. Skipping means starting from zero with everyone else.",
  "90% of resumes get filtered out over basics like this. Give it a shot.",
  "The tech market is brutal. Guessing here won't save you in an actual interview.",
  "Every student you're competing against knows this. Don't fall behind.",
  "If you don't know this now, it's going to hurt when you build your capstone.",
  "Companies expect this as a baseline. Not knowing it is a massive red flag.",
  "This is often the difference between an internship and a rejection email.",
  "Your competition is studying this right now. What are you doing?",
  "Leaving this blank is leaving your future to chance. Prove yourself.",
  "This isn't just a test, it's a reality check. Don't lie to yourself.",
  "Don't just tap skip. Your career literally depends on this foundation.",
  "Top 1% of students get this instantly. Let's see where you stand."
];

// ── Code block — dark terminal window (One Dark palette) ──

// One Dark Pro palette, calibrated for dark #1e1e2e background
const SYNTAX_COLORS = {
  keyword:   "#c678dd",
  builtin:   "#61afef",
  string:    "#98c379",
  number:    "#d19a66",
  comment:   "#5c6370",
  decorator: "#e5c07b",
  operator:  "#abb2bf",
  bracket:   "#abb2bf",
  text:      "#abb2bf",
};

const PY_KEYWORDS = new Set([
  "False","None","True","and","as","assert","async","await",
  "break","class","continue","def","del","elif","else","except",
  "finally","for","from","global","if","import","in","is",
  "lambda","nonlocal","not","or","pass","raise","return",
  "try","while","with","yield",
]);

const PY_BUILTINS = new Set([
  "abs","all","any","bin","bool","bytes","callable","chr","dict",
  "dir","divmod","enumerate","eval","exec","filter","float","format",
  "frozenset","getattr","globals","hasattr","hash","help","hex","id",
  "input","int","isinstance","issubclass","iter","len","list","locals",
  "map","max","min","next","object","oct","open","ord","pow","print",
  "property","range","repr","reversed","round","set","setattr","slice",
  "sorted","staticmethod","str","sum","super","tuple","type","vars","zip",
]);

function tokenizePython(code) {
  const tokens = [];
  const patterns = [
    { name: "comment",   re: /^#[^\n]*/ },
    { name: "string",    re: /^(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
    { name: "decorator", re: /^@[a-zA-Z_]\w*/ },
    { name: "number",    re: /^(?:0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?)/ },
    { name: "operator",  re: /^[+\-*/%=&|<>!~^:]+/ },
    { name: "bracket",   re: /^[{}[\]()]/ },
    { name: "punctuation", re: /^[;,.]/ },
    { name: "whitespace",  re: /^\s+/ },
    { name: "word",      re: /^[a-zA-Z_]\w*/ },
  ];

  let remaining = code;
  while (remaining.length > 0) {
    let matched = false;
    for (const { name, re } of patterns) {
      const m = remaining.match(re);
      if (m) {
        tokens.push({ type: name, value: m[0] });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "text", value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }
  return tokens;
}

function getTokenColor(token) {
  const { type, value } = token;
  if (type === "comment")   return SYNTAX_COLORS.comment;
  if (type === "string")    return SYNTAX_COLORS.string;
  if (type === "number")    return SYNTAX_COLORS.number;
  if (type === "decorator") return SYNTAX_COLORS.decorator;
  if (type === "bracket")   return SYNTAX_COLORS.bracket;
  if (type === "operator" || type === "punctuation") return SYNTAX_COLORS.operator;
  if (type === "word") {
    if (PY_KEYWORDS.has(value))  return SYNTAX_COLORS.keyword;
    if (PY_BUILTINS.has(value))  return SYNTAX_COLORS.builtin;
  }
  return SYNTAX_COLORS.text;
}

function CodeBlock({ code }) {
  if (!code) return null;

  const lineTokens = [];
  let currentLine = [];
  for (const tok of tokenizePython(code)) {
    if (tok.value.includes("\n")) {
      const parts = tok.value.split("\n");
      parts.forEach((part, i) => {
        if (part) currentLine.push({ value: part, color: getTokenColor(tok) });
        if (i < parts.length - 1) { lineTokens.push(currentLine); currentLine = []; }
      });
    } else {
      currentLine.push({ value: tok.value, color: getTokenColor(tok) });
    }
  }
  if (currentLine.length) lineTokens.push(currentLine);

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-3"
      style={{ background: "#1e1e2e" }}
      aria-label="Code snippet"
    >
      {/* macOS window chrome */}
      <div
        className="relative flex items-center justify-center px-4"
        style={{ background: "#1a1a28", borderBottom: "1px solid rgba(255,255,255,0.07)", height: "36px" }}
      >
        <div className="absolute left-4 flex items-center gap-[6px]">
          <span className="block w-[11px] h-[11px] rounded-full" style={{ background: "#FF5F57" }} />
          <span className="block w-[11px] h-[11px] rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="block w-[11px] h-[11px] rounded-full" style={{ background: "#28C840" }} />
        </div>
        <span className="font-mono text-[12px] tracking-wide select-none" style={{ color: "rgba(255,255,255,0.28)" }}>
          Exercise
        </span>
      </div>

      {/* Code body */}
      <div className="flex overflow-x-auto pt-3 pb-4">
        <div className="flex-shrink-0 select-none pl-4 pr-3" aria-hidden="true">
          {lineTokens.map((_, i) => (
            <div
              key={i}
              className="font-mono text-[13px] leading-[1.65] tabular-nums text-right"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <pre
          className="flex-1 m-0 p-0 pr-5 font-mono text-[13px] leading-[1.65] whitespace-pre"
          style={{ background: "transparent" }}
        >
          {lineTokens.map((toks, lineIdx) => (
            <div key={lineIdx}>
              {toks.map((seg, i) => (
                <span key={i} style={{ color: seg.color }}>{seg.value}</span>
              ))}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function QuestionCard({ question, value, onChange, index }) {
  const [isTyping, setIsTyping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const eyesRef = useRef(null);
  const wrapperRef = useRef(null);

  useKiboEyeTracking({ eyesRef, wrapperRef, active: true, trackFullPage: true });

  const handleTypingDone = useCallback(() => setIsTyping(false), []);
  const fomoMsg = FOMO_MESSAGES[index % FOMO_MESSAGES.length];

  return (
    <div
      key={question.id}
      className="diag-free-enter w-full max-w-[500px] mx-auto px-5 sm:px-6 py-6 flex flex-col gap-5"
    >
      {/* Kibo row */}
      <div className="flex items-center gap-4 w-full ob-row-in">
        <div
          className="relative flex-shrink-0 select-none cursor-pointer"
          style={{
            width: 72, height: 72,
            filter: isHovered
              ? "drop-shadow(0 0 12px rgba(6,182,212,0.5))"
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.10))",
            transition: "filter 300ms",
          }}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
        >
          <KiboBody
            visualState={isTyping ? "speaking" : "idle"}
            petSize={72}
            wrapperRef={wrapperRef}
            eyesRef={eyesRef}
          />
        </div>

        <div className="ob-bubble-pop relative flex-1 min-w-0">
          <div className="ob-bubble relative bg-[#F0F9FF] rounded-2xl border-2 border-[#00A9FF] shadow-[0_4px_20px_rgba(0,169,255,0.12)] px-4 py-3">
            <p className="text-[14px] leading-snug font-bold text-[#001D32]">
              <TextType
                text={fomoMsg}
                typingSpeed={20}
                showCursor={false}
                loop={false}
                onSentenceComplete={handleTypingDone}
              />
            </p>
          </div>
        </div>
      </div>

      <h2 className="font-bold text-[#001D32] text-[21px] leading-snug mt-2">
        <HighlightedTitle title={question.title} />
      </h2>

      <CodeBlock code={question.code} />

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={isSelected}
              className={[
                "ob-chip-in w-full text-left px-5 py-4 rounded-2xl border-2 select-none cursor-pointer focus-visible:outline-none",
                "font-semibold text-[15px] leading-snug",
                "transition-[border-color,background-color,box-shadow,transform] duration-100",
                "active:translate-y-[3px] active:shadow-none",
                isSelected
                  ? "border-[#00a9ff] bg-[#ddf2ff] text-[#001d32] shadow-[0_3px_0_#3081AD]"
                  : "border-[#e5d5c5] bg-white text-[#1a2a3a] shadow-[0_3px_0_#FFDCBC]",
              ].join(" ")}
              style={{ animationDelay: `${100 + i * 40}ms` }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FreeDiagnostic({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = FREE_PATH_QUESTIONS[currentIndex];
  const total = FREE_PATH_QUESTIONS.length;

  const handleChange = useCallback((value) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion?.id]: value }));
  }, [currentQuestion]);

  const advance = useCallback(() => {
    if (currentIndex >= total - 1) {
      onComplete(answers);
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, total, answers, onComplete]);

  const handleSkip = useCallback(() => {
    const newAnswers = { ...answers, [currentQuestion?.id]: "skipped" };
    setAnswers(newAnswers);
    if (currentIndex >= total - 1) {
      onComplete(newAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total, answers, currentQuestion, onComplete]);

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const currentValue = answers[currentQuestion?.id] ?? null;

  return (
    <main
      className="h-dvh flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FCF5EE" }}
    >
      <style>{`
        @keyframes diag-free-enter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .diag-free-enter { animation: diag-free-enter 280ms cubic-bezier(0.22,1,0.36,1) both; }
        
        @keyframes ob-chip-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-chip-in { animation: ob-chip-in 360ms cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes ob-row-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-row-in { animation: ob-row-in 380ms cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes ob-bubble-pop {
          0%   { opacity: 0; transform: scale(0.88) translateX(6px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }
        .ob-bubble-pop { animation: ob-bubble-pop 480ms cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 60ms; }

        .ob-bubble::before {
          content: '';
          position: absolute;
          top: 50%; left: -12px;
          transform: translateY(-50%);
          border: 11px solid transparent;
          border-right-color: #00A9FF;
          border-left: 0;
        }
        .ob-bubble::after {
          content: '';
          position: absolute;
          top: 50%; left: -9px;
          transform: translateY(-50%);
          border: 10px solid transparent;
          border-right-color: #F0F9FF;
          border-left: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .diag-free-enter, .ob-chip-in, .ob-row-in, .ob-bubble-pop { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* ── Zone 1: Top bar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 w-full px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3 w-full max-w-[500px] mx-auto">
          {/* Back button */}
          <div className="w-10 flex-shrink-0">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#001D32] hover:bg-black/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex-1 min-w-0">
            <DiagnosticProgress
              current={currentIndex + 1}
              total={total}
            />
          </div>

          {/* Counter */}
          <span className="text-xs font-semibold text-slate-400 flex-shrink-0 tabular-nums">
            {currentIndex + 1}/{total}
          </span>
        </div>
      </div>

      {/* ── Zone 2: Scrollable question ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            value={currentValue}
            onChange={handleChange}
            index={currentIndex}
          />
        )}
      </div>

      {/* ── Zone 3: Sticky footer ───────────────────────────────────── */}
      <div
        className="flex-shrink-0 w-full border-t border-[#e8ddd4]"
        style={{ backgroundColor: "#FCF5EE" }}
      >
        <div className="w-full max-w-[500px] mx-auto px-5 sm:px-6 py-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 rounded-2xl text-[#4A5568] font-semibold text-[15px] bg-[#f9ebe0] hover:text-[#001D32] hover:bg-[#f3dfce] transition-colors focus-visible:outline-none"
          >
            Skip
          </button>
          <button
            onClick={advance}
            disabled={!currentValue}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-[16px] uppercase tracking-wide bg-[#00A9FF] hover:bg-[#0096e6] shadow-[0_4px_0_#007bcc] hover:shadow-[0_4px_0_#007bcc] hover:-translate-y-[1px] active:translate-y-[2px] active:shadow-[0_0px_0_#007bcc] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_4px_0_#007bcc]"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}
