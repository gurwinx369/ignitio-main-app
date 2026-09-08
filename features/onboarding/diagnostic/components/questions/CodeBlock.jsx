'use client';

// ─── Color theme mirrored exactly from features/compiler/components/CodeEditor.jsx ───
const SYNTAX_COLORS = {
  keyword:     '#9334E6', // purple
  type:        '#4EC9B0', // teal  (adapted for dark bg — was #267F00 on light)
  preprocessor:'#9334E6', // purple
  string:      '#CE9178', // warm orange-red (VS Code dark string color, readable on dark bg)
  number:      '#B5CEA8', // soft green-blue (VS Code dark number color)
  comment:     '#6A9955', // muted green
  function:    '#DCDCAA', // yellow (VS Code dark function call color)
  operator:    '#D4D4D4', // light grey
  bracket:     '#FFD700', // gold (VS Code bracket pair color 1)
  variable:    '#9CDCFE', // light blue (VS Code dark variable color)
  constant:    '#B5CEA8', // same as number
  text:        '#D4D4D4', // default light-on-dark text
  builtin:     '#4EC9B0', // teal for builtins
  decorator:   '#DCDCAA', // yellow for decorators
};

// ─── Token patterns — covers Python, pseudo-code, JSON-style, and LCEL snippets ───
const PATTERNS = [
  // Comments: # (Python) and // (C-style / pseudo)
  { name: 'comment', re: /^(#|\/\/).*/  },
  // Decorators: @something
  { name: 'decorator', re: /^@[a-zA-Z_][a-zA-Z0-9_.]*/ },
  // Triple-quoted strings (Python)
  { name: 'string', re: /^"""[\s\S]*?"""|^'''[\s\S]*?'''/ },
  // Double-quoted strings
  { name: 'string', re: /^"(?:[^"\\]|\\.)*"/ },
  // Single-quoted strings
  { name: 'string', re: /^'(?:[^'\\]|\\.)*'/ },
  // Numbers (hex, float, int)
  { name: 'number', re: /^(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?)/ },
  // Operators / punctuation
  { name: 'operator', re: /^[+\-*/%=&|<>!~^?:]+/ },
  // Brackets
  { name: 'bracket', re: /^[{}[\]()]/ },
  // Commas / semicolons
  { name: 'punctuation', re: /^[;,.]/ },
  // Whitespace (preserve exactly)
  { name: 'whitespace', re: /^\s+/ },
  // Identifiers / keywords
  { name: 'word', re: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  // Fallback: one character
  { name: 'text', re: /^./ },
];

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
  'while', 'with', 'yield',
  // Common pseudo/LCEL keywords that should be purple
  'chain', 'model', 'prompt', 'result', 'answer',
]);

const PYTHON_BUILTINS = new Set([
  'print', 'len', 'range', 'int', 'str', 'float', 'bool', 'list',
  'dict', 'set', 'tuple', 'type', 'isinstance', 'hasattr', 'getattr',
  'setattr', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed',
  'open', 'input', 'super', 'property', 'classmethod', 'staticmethod',
  // Common GenAI / LCEL names
  'StrOutputParser', 'JsonOutputParser', 'RunnablePassthrough',
  'ChatPromptTemplate', 'run_rag',
]);

const PYTHON_CONSTANTS = new Set(['True', 'False', 'None', 'null', 'undefined']);

/**
 * Tokenise a string of code into { text, color } segments.
 * Language-agnostic with Python / pseudo-code / JSON bias.
 */
function tokenise(code) {
  const segments = [];
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;
    for (const { name, re } of PATTERNS) {
      const m = remaining.match(re);
      if (!m) continue;

      const value = m[0];
      remaining = remaining.slice(value.length);
      matched = true;

      let color = SYNTAX_COLORS.text;

      switch (name) {
        case 'comment':
          color = SYNTAX_COLORS.comment; break;
        case 'decorator':
          color = SYNTAX_COLORS.decorator; break;
        case 'string':
          color = SYNTAX_COLORS.string; break;
        case 'number':
          color = SYNTAX_COLORS.number; break;
        case 'bracket':
          color = SYNTAX_COLORS.bracket; break;
        case 'operator':
          color = SYNTAX_COLORS.operator; break;
        case 'punctuation':
          color = SYNTAX_COLORS.operator; break;
        case 'whitespace':
          color = SYNTAX_COLORS.text; break;
        case 'word':
          if (PYTHON_CONSTANTS.has(value))      color = SYNTAX_COLORS.constant;
          else if (PYTHON_KEYWORDS.has(value))  color = SYNTAX_COLORS.keyword;
          else if (PYTHON_BUILTINS.has(value))  color = SYNTAX_COLORS.builtin;
          else                                  color = SYNTAX_COLORS.variable;
          break;
        default:
          color = SYNTAX_COLORS.text;
      }

      segments.push({ text: value, color });
      break;
    }

    // Safety valve — should never hit due to fallback pattern
    if (!matched) {
      segments.push({ text: remaining[0], color: SYNTAX_COLORS.text });
      remaining = remaining.slice(1);
    }
  }

  return segments;
}

/**
 * CodeBlock
 *
 * Apple-style terminal widget with the exact syntax-color palette from
 * the project compiler (features/compiler/components/CodeEditor.jsx).
 *
 * Background: #1E1E1E (VS Code Dark+ / same dark feel the compiler implies)
 * All token colors: same SYNTAX_COLORS map as CodeEditor, adapted for dark bg.
 */
export default function CodeBlock({ code }) {
  if (!code) return null;

  const segments = tokenise(code);

  return (
    <div className="rounded-2xl overflow-hidden mb-5 border border-[#3c3c3c] shadow-[0_8px_32px_rgba(0,0,0,0.18)] mx-2">
      {/* Title bar — macOS traffic-light style */}
      <div
        className="flex items-center justify-between px-4 h-10 border-b border-[#3c3c3c]"
        style={{ backgroundColor: '#2d2d2d' }}
      >
        <div className="flex items-center gap-[6px]">
          <div className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] border border-[#e0443e]" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#FFBD2E] border border-[#dea123]" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#27C93F] border border-[#1aab29]" />
        </div>

        <span
          className="text-[12px] font-semibold tracking-wide select-none"
          style={{ color: '#8a8a8a' }}
        >
          Exercise
        </span>

        {/* Spacer — mirrors left dots width for perfect centering */}
        <div className="w-[54px]" />
      </div>

      {/* Code body */}
      <div
        className="overflow-x-auto p-4"
        style={{ backgroundColor: '#1e1e1e' }}
      >
        <pre
          className="font-mono text-[13px] leading-[1.65] whitespace-pre m-0"
          style={{ color: SYNTAX_COLORS.text }}
        >
          {segments.map((seg, i) => (
            <span key={i} style={{ color: seg.color }}>
              {seg.text}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}
