'use client';

import { useState } from 'react';

/**
 * StdinInput Component
 * Allows users to provide input for their C++ programs (cin >> input)
 * Uses project design system (beige background, navy text)
 */
export default function StdinInput({
  value = '',
  onChange,
  disabled = false,
  hasCinWarning = false,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div
      className={`
        w-full rounded-lg overflow-hidden
        bg-white border
        ${hasCinWarning && !value.trim() ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/30' : 'border-[#f0caa8]'}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Header - Clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#f0caa8] bg-[#fcf5ee] hover:bg-[#f5ddc9] transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00a9ff]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-[10px] sm:text-xs font-semibold text-[#19183b] uppercase tracking-wide">
            Input (stdin)
          </span>
          <span className="text-[10px] sm:text-xs text-[#7775a5] normal-case">
            for cin &gt;&gt;
          </span>
          {hasCinWarning && !value.trim() && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-[#fef3c7] text-[#f59e0b] font-medium">
              Required
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-[#5a5892] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Input Area - Collapsible */}
      {isExpanded && (
        <div className="p-2 sm:p-3 bg-white">
          <textarea
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Enter input values here...&#10;&#10;Example:&#10;42&#10;Hello&#10;3.14&#10;&#10;For multiple cin statements, use separate lines."
            className={`
              w-full h-20 sm:h-24 p-2 sm:p-3
              font-mono text-[11px] sm:text-xs leading-5
              bg-[#fcf5ee] border rounded-lg
              text-[#19183b] placeholder-[#a8a4c7]
              resize-none outline-none
              focus:ring-2 focus:ring-[#00a9ff] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${hasCinWarning && !value.trim() ? 'border-[#f59e0b]' : 'border-[#f0caa8]'}
            `}
            spellCheck={false}
            aria-label="Standard input for program execution"
          />
          <div className="mt-2 space-y-1.5">
            <p className="text-[10px] sm:text-xs text-[#5a5892]">
              <span className="font-medium text-[#19183b]">Tip:</span> Each line = one input value. Values are read in order by <code className="px-1 bg-[#f5ddc9] rounded text-[#267F00]">cin &gt;&gt;</code>
            </p>
            <p className="text-[10px] sm:text-xs text-[#7775a5]">
              <span className="font-medium">For strings with spaces:</span> Use <code className="px-1 bg-[#f5ddc9] rounded text-[#267F00]">getline(cin, s)</code> in your code
            </p>
          </div>
        </div>
      )}
    </div>
  );
}