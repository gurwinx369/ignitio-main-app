'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

// C++ syntax highlighting tokens
const CPP_TOKENS = {
  keywords: [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
    'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
    'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
    'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
    'unsigned', 'void', 'volatile', 'while', '_Bool', '_Complex', '_Imaginary',
    'class', 'public', 'private', 'protected', 'virtual', 'friend', 'new',
    'delete', 'this', 'operator', 'template', 'typename', 'namespace',
    'using', 'try', 'catch', 'throw', 'const_cast', 'dynamic_cast',
    'reinterpret_cast', 'static_cast', 'typeid', 'explicit', 'export',
    'mutable', 'nullptr', 'override', 'final', 'constexpr', 'decltype',
    'noexcept', 'thread_local', 'alignas', 'alignof'
  ],
  types: [
    'int', 'float', 'double', 'char', 'void', 'bool', 'long', 'short',
    'unsigned', 'signed', 'wchar_t', 'char16_t', 'char32_t', 'auto',
    'size_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t',
    'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'string', 'vector',
    'map', 'set', 'unordered_map', 'unordered_set', 'pair', 'array'
  ],
  preprocessor: [
    '#include', '#define', '#undef', '#if', '#ifdef', '#ifndef', '#else',
    '#elif', '#endif', '#error', '#pragma', '#line', '#warning'
  ],
  constants: ['true', 'false', 'NULL', 'nullptr']
};

// Syntax colors optimized for light beige background
const SYNTAX_COLORS = {
  keyword: '#9334E6',       // Purple for keywords
  type: '#267F00',          // Green for types
  preprocessor: '#9334E6',  // Purple for preprocessor
  string: '#C53929',        // Red for strings
  number: '#0066CC',        // Blue for numbers
  comment: '#6A9955',       // Green for comments
  function: '#795E26',      // Brown for functions
  operator: '#19183b',      // Navy for operators
  variable: '#19183b',      // Navy for variables
  constant: '#0066CC',     // Blue for constants
  bracket: '#19183b',       // Navy for brackets
  text: '#19183b'           // Default text (navy)
};

/**
 * Tokenizes C++ code for syntax highlighting
 */
function tokenizeCpp(code) {
  const tokens = [];
  let remaining = code;

  const patterns = [
    { name: 'comment-multi', pattern: /^\/\*[\s\S]*?\*\// },
    { name: 'comment-single', pattern: /^\/\/[^\n]*/ },
    { name: 'string-double', pattern: /^"(?:[^"\\]|\\.)*"/ },
    { name: 'string-single', pattern: /^'(?:[^'\\]|\\.)*'/ },
    { name: 'preprocessor', pattern: /^#\s*\w+/ },
    { name: 'number', pattern: /^(?:0x[0-9a-fA-F]+|0b[01]+|0[0-7]*|\d+\.?\d*(?:[eE][+-]?\d+)?)[fFuUlL]{0,4}/ },
    { name: 'operator', pattern: /^[+\-*/%=&|<>!~^?:]+/ },
    { name: 'bracket', pattern: /^[{}\[\]()]/ },
    { name: 'punctuation', pattern: /^[;,.:]/ },
    { name: 'whitespace', pattern: /^\s+/ },
    { name: 'word', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/ }
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const { name, pattern } of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        tokens.push({ type: name, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

/**
 * Determines the color for a token
 */
function getTokenColor(token) {
  const { type, value } = token;

  if (type === 'comment-multi' || type === 'comment-single') {
    return SYNTAX_COLORS.comment;
  }
  if (type === 'string-double' || type === 'string-single') {
    return SYNTAX_COLORS.string;
  }
  if (type === 'preprocessor') {
    return SYNTAX_COLORS.preprocessor;
  }
  if (type === 'number') {
    return SYNTAX_COLORS.number;
  }
  if (type === 'bracket') {
    return SYNTAX_COLORS.bracket;
  }
  if (type === 'operator' || type === 'punctuation') {
    return SYNTAX_COLORS.operator;
  }
  if (type === 'whitespace') {
    return SYNTAX_COLORS.text;
  }
  if (type === 'word') {
    if (CPP_TOKENS.keywords.includes(value)) {
      return SYNTAX_COLORS.keyword;
    }
    if (CPP_TOKENS.types.includes(value)) {
      return SYNTAX_COLORS.type;
    }
    if (CPP_TOKENS.constants.includes(value)) {
      return SYNTAX_COLORS.constant;
    }
    return SYNTAX_COLORS.variable;
  }

  return SYNTAX_COLORS.text;
}

/**
 * Highlights C++ code with syntax coloring
 */
function highlightCpp(code) {
  const tokens = tokenizeCpp(code);
  return tokens.map(token => ({
    text: token.value,
    color: getTokenColor(token)
  }));
}

/**
 * CodeEditor Component
 * A syntax-highlighted code editor for C++ with line numbers
 * Uses project design system (beige background, navy text)
 */
export default function CodeEditor({
  value = '',
  onChange,
  readOnly = false,
  className = ''
}) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const workerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const pendingCodeRef = useRef('');

  const defaultValue = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

  const code = value || defaultValue;
  const [highlightedCode, setHighlightedCode] = useState(() => highlightCpp(code));
  
  // React hook to handle worker initialization
  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/syntaxWorker.js');
      workerRef.current.onmessage = (e) => {
        // Only update if this matches the latest code
        if (e.data.code === pendingCodeRef.current) {
          setHighlightedCode(e.data.tokens);
        }
      };
      workerRef.current.onerror = (err) => {
        console.warn('Syntax worker failed, falling back to main thread', err);
      };
    } catch (err) {
      console.warn('Failed to initialize syntax worker', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Update highlighting when code changes (debounced for long code, sync for short)
  useEffect(() => {
    pendingCodeRef.current = code;

    // Synchronous execution for short code or if worker is unavailable
    if (code.length < 500 || !workerRef.current) {
      setHighlightedCode(highlightCpp(code));
      return;
    }

    // Debounce worker for longer code to prevent keystroke lag
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({ code });
      }
    }, 150);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleChange = useCallback((e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '    ' + code.substring(end);

      if (onChange) {
        onChange(newValue);
      }

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  }, [code, onChange]);

  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div
      className={`
        relative w-full h-full rounded-lg overflow-hidden
        bg-white border border-[#f0caa8]
        ${isFocused ? 'ring-2 ring-[#00a9ff]' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Line numbers */}
      <div
        className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 md:w-12
                   bg-[#fcf5ee] border-r border-[#f0caa8]
                   overflow-hidden z-10"
        aria-hidden="true"
      >
        <div className="pt-2 sm:pt-3 md:pt-4 pr-1 sm:pr-2 text-right font-mono text-[10px] sm:text-xs leading-5 sm:leading-6">
          {lineNumbers.map(lineNum => (
            <div key={lineNum} className="text-[#5a5892] select-none">
              {lineNum}
            </div>
          ))}
        </div>
      </div>

      {/* Code highlight layer */}
      <div
        ref={highlightRef}
        className="absolute inset-0 ml-8 sm:ml-10 md:ml-12 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <pre className="p-2 sm:p-3 md:p-4 font-mono text-[11px] sm:text-xs md:text-sm leading-5 sm:leading-6 whitespace-pre-wrap break-words text-[#19183b]">
          {highlightedCode.map((segment, index) => (
            <span key={index} style={{ color: segment.color }}>
              {segment.text}
            </span>
          ))}
        </pre>
      </div>

      {/* Textarea layer */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        spellCheck={false}
        className={`
          absolute inset-0 ml-8 sm:ml-10 md:ml-12 w-[calc(100%-2rem)] sm:w-[calc(100%-2.5rem)] md:w-[calc(100%-3rem)]
          p-2 sm:p-3 md:p-4 font-mono text-[11px] sm:text-xs md:text-sm leading-5 sm:leading-6
          bg-transparent text-transparent caret-[#19183b]
          resize-none outline-none
          selection:bg-[#00a9ff]/30
          ${readOnly ? 'cursor-default' : 'cursor-text'}
        `}
        style={{ caretColor: '#19183b' }}
        aria-label="C++ code editor"
      />
    </div>
  );
}