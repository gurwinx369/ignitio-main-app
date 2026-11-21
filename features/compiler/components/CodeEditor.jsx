'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { highlightCode } from '../lib/syntaxHighlighter';

/**
 * CodeEditor Component
 * Syntax-highlighted code editor for C++, Python, C, and future languages
 * Powered by universal grammar rules and global theme system
 */
export default function CodeEditor({
  value = '',
  onChange,
  readOnly = false,
  className = '',
  language = 'cpp',
  dark = false,
}) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const workerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const pendingCodeRef = useRef('');

  const defaultValue = language === 'python3' || language === 'python'
    ? '# Python 3\nprint("Hello, World!")'
    : language === 'c'
      ? '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
      : '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}';

  const code = value !== undefined && value !== null ? value : defaultValue;
  const [highlightedCode, setHighlightedCode] = useState(() => highlightCode(code, language, dark));

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

  // Update highlighting when code, language, or theme changes
  useEffect(() => {
    pendingCodeRef.current = code;

    // Synchronous execution for short code or if worker is unavailable
    if (code.length < 500 || !workerRef.current) {
      setHighlightedCode(highlightCode(code, language, dark));
      return;
    }

    // Debounce worker for longer code to prevent keystroke lag
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({ code, language, dark });
      }
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, language, dark]);

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
        relative w-full h-full min-h-[360px] rounded-lg overflow-hidden
        ${dark ? 'bg-[#1e293b] border border-slate-700' : 'bg-white border border-[#f0caa8]'}
        ${isFocused ? 'ring-2 ring-[#00a9ff]' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Line numbers */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 sm:w-10 md:w-12
                   ${dark ? 'bg-[#0f172a] border-r border-slate-700' : 'bg-[#fcf5ee] border-r border-[#f0caa8]'}
                   overflow-hidden z-10`}
        aria-hidden="true"
      >
        <div className="pt-2 sm:pt-3 md:pt-4 pr-1 sm:pr-2 text-right font-mono text-[10px] sm:text-xs leading-5 sm:leading-6">
          {lineNumbers.map(lineNum => (
            <div key={lineNum} className={`select-none ${dark ? 'text-slate-500' : 'text-[#5a5892]'}`}>
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
        <pre className={`p-2 sm:p-3 md:p-4 font-mono text-[11px] sm:text-xs md:text-sm leading-5 sm:leading-6 whitespace-pre-wrap break-words ${dark ? 'text-slate-300' : 'text-[#19183b]'}`}>
          {highlightedCode.map((segment, index) => (
            <span
              key={index}
              style={{
                color: segment.color,
                fontStyle: segment.italic ? 'italic' : undefined,
                fontWeight: segment.bold ? '600' : undefined
              }}
            >
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
        style={{ caretColor: dark ? '#00A9FF' : '#19183b' }}
        aria-label={`${language} code editor`}
      />
    </div>
  );
}