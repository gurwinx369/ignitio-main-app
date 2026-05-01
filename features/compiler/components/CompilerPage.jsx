'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor';
import CodeOutput from './CodeOutput';
import ExecutionMetrics from './ExecutionMetrics';
import { executeCode, getRateLimitRemaining, ERROR_TYPES } from '@/features/compiler';

/**
 * Default C++ 17 template code
 */
const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

/**
 * Rate limit duration in seconds
 */
const RATE_LIMIT_SECONDS = 10;

/**
 * CompilerPage Component
 * Main compiler page that combines editor, output, and metrics
 * Uses project design system (beige background, navy text, blue accent)
 */
export default function CompilerPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [status, setStatus] = useState('idle');

  // Rate limiting state
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const countdownIntervalRef = useRef(null);

  /**
   * Start the rate limit countdown
   */
  const startRateLimitCountdown = useCallback(() => {
    setRateLimitCountdown(RATE_LIMIT_SECONDS);
    setIsRateLimited(true);

    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Cleanup interval on unmount
   */
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Handle code changes from the editor
   */
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (status !== 'idle') {
      setStatus('idle');
      setOutput('');
      setError('');
    }
  }, [status]);

  /**
   * Get user-friendly error message based on error type
   */
  const getErrorMessage = useCallback((result) => {
    switch (result.errorType) {
      case ERROR_TYPES.RATE_LIMIT:
        return `⏱️ Rate limit reached. Please wait ${result.rateLimitRemaining} second${result.rateLimitRemaining !== 1 ? 's' : ''} before running code again.`;
      case ERROR_TYPES.NETWORK:
        return '🌐 Unable to connect to the compiler service. Please check your internet connection.';
      case ERROR_TYPES.TIMEOUT:
        return '⏰ Code execution timed out. Your code may have an infinite loop or takes too long.';
      case ERROR_TYPES.COMPILATION:
        return `❌ Compilation Error:\n${result.error}`;
      case ERROR_TYPES.VALIDATION:
        return `⚠️ ${result.error}`;
      case ERROR_TYPES.API:
        return '🔧 The compiler service encountered an error. Please try again later.';
      default:
        return result.error || 'An unexpected error occurred. Please try again.';
    }
  }, []);

  /**
   * Execute the current code
   */
  const handleExecute = useCallback(async () => {
    // Check if already rate limited
    if (isRateLimited) {
      setError(`⏱️ Please wait ${rateLimitCountdown} second${rateLimitCountdown !== 1 ? 's' : ''} before running code again.`);
      return;
    }

    // Validate code is not empty
    if (!code.trim()) {
      setError('⚠️ Please write some code before running.');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('running');
    setError('');
    setOutput('');

    try {
      const result = await executeCode(code, 'cpp');

      if (result.success) {
        setOutput(result.output);
        setExecutionTime(result.executionTime);
        setMemoryUsage(result.memoryUsage);
        setStatus('success');
        // Start rate limit countdown after successful execution
        startRateLimitCountdown();
      } else {
        // Handle specific error types
        const errorMessage = getErrorMessage(result);
        setError(errorMessage);
        setStatus('error');
        setExecutionTime(0);
        setMemoryUsage(0);

        // Start rate limit countdown if rate limited
        if (result.errorType === ERROR_TYPES.RATE_LIMIT) {
          startRateLimitCountdown();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatus('error');
      setExecutionTime(0);
      setMemoryUsage(0);
    } finally {
      setIsLoading(false);
    }
  }, [code, isRateLimited, rateLimitCountdown, getErrorMessage, startRateLimitCountdown]);

  /**
   * Reset the editor to default code
   */
  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
    setOutput('');
    setError('');
    setExecutionTime(0);
    setMemoryUsage(0);
    setStatus('idle');
  }, []);

  // Determine if run button should be disabled
  const isRunDisabled = isLoading || isRateLimited;

  return (
      // FIX 1: was `h-screen overflow-hidden` — that hard-clips everything on mobile.
      // Now: mobile scrolls naturally (min-h-screen, no overflow clip),
      // desktop locks to viewport and lets children scroll (lg:h-screen lg:overflow-hidden).
      <div className="min-h-screen lg:h-screen bg-[#fefcf9] flex flex-col md:overflow-y-scroll lg:overflow-hidden">

        {/* Main Container */}
        <div className="flex-1 flex flex-col min-h-0 w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">

          {/* Header */}
          <div className="shrink-0 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#19183b]">
              C++ Compiler
            </h1>
            <p className="text-[#3d3c7f] text-xs sm:text-sm md:text-base mt-1">
              Write, compile, and run your C++ code in the browser
            </p>
          </div>

          {/* Rate Limit Banner */}
          {isRateLimited && (
              <div className="shrink-0 mb-3 p-2 sm:p-3 rounded-lg bg-[#fef3c7] border border-[#f59e0b] flex items-center gap-2">
                <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-[#f59e0b] shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs sm:text-sm text-[#92400e]">
              Rate limit active. Please wait <strong>{rateLimitCountdown}s</strong> before running again.
            </span>
              </div>
          )}

          {/* Toolbar */}
          <div className="shrink-0 flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <button
                onClick={handleExecute}
                disabled={isRunDisabled}
                className={`
              px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm
              flex items-center gap-1.5 sm:gap-2 transition-all duration-200
              ${isRunDisabled
                    ? 'bg-[#00a9ff]/50 cursor-not-allowed'
                    : 'bg-[#00a9ff] hover:bg-[#0095e6] active:scale-95'
                }
              text-white shadow-md
            `}
                aria-label="Run code"
                title={isRateLimited ? `Wait ${rateLimitCountdown}s before running again` : 'Run code'}
            >
              {isLoading ? (
                  <>
                    <svg
                        className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
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
                    <span>Running...</span>
                  </>
              ) : isRateLimited ? (
                  <>
                    <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Wait {rateLimitCountdown}s</span>
                  </>
              ) : (
                  <>
                    <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Run</span>
                  </>
              )}
            </button>

            <button
                onClick={handleReset}
                disabled={isLoading}
                className={`
              px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm
              flex items-center gap-1.5 sm:gap-2 transition-all duration-200
              bg-[#fcf5ee] hover:bg-[#f5ddc9] active:scale-95
              text-[#19183b] border border-[#f0caa8]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                aria-label="Reset code"
            >
              <svg
                  className="h-3 w-3 sm:h-4 sm:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset</span>
            </button>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-[#5a5892]">
              Language:
            </span>
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs bg-[#fcf5ee] text-[#267F00] font-mono border border-[#f0caa8]">
              C++ 17
            </span>
            </div>
          </div>

          {/* Main Layout - Responsive Grid */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-3 sm:gap-4">

            {/* Editor and Output Column */}
            <div className="min-h-0 flex flex-col gap-3 sm:gap-4">

              {/* Code Editor
                FIX 2: Added min-h-[300px] so on mobile (where flex-1 has no bounded
                parent height) the editor doesn't collapse to 0.
                lg:min-h-0 resets that floor on desktop so flex-1 takes over cleanly.
                overflow-hidden is correct — CodeEditor manages its own internal scroll. */}
              <div className="flex-1 min-h-75 lg:min-h-0 rounded-lg overflow-hidden shadow-md">
                <CodeEditor
                    value={code}
                    onChange={handleCodeChange}
                />
              </div>

              {/* Output
                FIX 3: Added overflow-hidden to the wrapper so the fixed heights
                (h-[30vh] / h-[25vh]) form a hard boundary.
                CodeOutput already has overflow-auto on its inner content div,
                so long output scrolls inside that boundary correctly. */}
              <div className="shrink-0 h-[30vh] sm:h-[25vh] lg:flex-1 lg:min-h-0 overflow-hidden shadow-md">
                <CodeOutput
                    output={output}
                    error={error}
                    isLoading={isLoading}
                />
              </div>
            </div>

            {/* Execution Metrics Sidebar
              FIX 4: Added overflow-y-auto to the column wrapper on desktop so that
              if the metrics content ever grows (many metrics, long labels), it scrolls
              rather than overflowing into sibling elements. */}
            <div className="shrink-0 lg:min-h-0 lg:overflow-y-auto">

              {/* Mobile: horizontal metrics layout
                FIX 5: Added overflow-auto so horizontal metric rows scroll on very
                small screens rather than being clipped. */}
              <div className="lg:hidden h-full overflow-auto shadow-md">
                <ExecutionMetrics
                    executionTime={executionTime}
                    memoryUsage={memoryUsage}
                    status={status}
                    layout="horizontal"
                />
              </div>

              {/* Desktop: vertical metrics layout
                overflow-auto here handles the case where ExecutionMetrics renders
                more content than the sidebar column height allows. */}
              <div className="hidden lg:flex lg:flex-col h-full overflow-auto shadow-md">
                <ExecutionMetrics
                    executionTime={executionTime}
                    memoryUsage={memoryUsage}
                    status={status}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
