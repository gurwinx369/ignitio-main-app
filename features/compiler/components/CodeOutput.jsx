'use client';

import { useMemo } from 'react';

/**
 * CodeOutput Component
 * Displays the execution output from the compiler
 * Uses project design system (beige background, navy text)
 */
export default function CodeOutput({
  output = '',
  error = '',
  isLoading = false,
  className = ''
}) {
  const status = useMemo(() => {
    if (error) return 'error';
    if (output) return 'success';
    return 'idle';
  }, [output, error]);

  const displayContent = output || error || 'Output will appear here after execution...';

  return (
    <div
      className={`
        w-full h-full rounded-lg overflow-hidden
        bg-white border border-[#f0caa8]
        flex flex-col
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border-b border-[#f0caa8] bg-[#fcf5ee]">
        <span className="text-[10px] sm:text-xs font-semibold text-[#19183b] uppercase tracking-wide">
          Output
        </span>
        {status === 'error' && (
          <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded bg-[#fee2e2] text-[#ef4444]">
            Error
          </span>
        )}
        {status === 'success' && (
          <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded bg-[#d1fae5] text-[#10b981]">
            Success
          </span>
        )}
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#19183b]">
              <svg
                className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-[#00a9ff]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.211.896 4.2 2.346 5.654l1.654-2.363z"
                />
              </svg>
              <span className="text-xs sm:text-sm text-[#3d3c7f]">Executing...</span>
            </div>
          </div>
        ) : (
          <pre
            className={`
              font-mono text-[11px] sm:text-xs md:text-sm leading-5 sm:leading-6 whitespace-pre-wrap break-words
              ${status === 'error' ? 'text-[#ef4444]' : status === 'success' ? 'text-[#19183b]' : 'text-[#7775a5]'}
            `}
          >
            {displayContent}
          </pre>
        )}
      </div>
    </div>
  );
}
