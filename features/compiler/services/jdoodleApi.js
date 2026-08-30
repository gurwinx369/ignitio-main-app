/**
 * Compiler API Service
 * Handles communication with our internal compiler API
 * The internal API proxies requests to JDoodle to avoid CORS issues
 */

import axios from 'axios';

// Internal API endpoint (no CORS issues since it's same origin)
const API_ENDPOINT = '/api/compiler';

/**
 * Supported language configurations
 * C++ 17 uses versionIndex '0'
 */
export const SUPPORTED_LANGUAGES = {
  cpp: {
    lang: 'cpp',
    versionIndex: '0',
    name: 'C++ 17'
  },
  python3: {
    lang: 'python3',
    versionIndex: '3',
    name: 'Python 3'
  },
  c: {
    lang: 'c',
    versionIndex: '4',
    name: 'C (GCC)'
  }
};

/**
 * Rate limiter state (client-side for UI purposes)
 * Server handles actual rate limiting
 */
const RATE_LIMIT = {
  cooldownMs: 3000, // 3 seconds
  lastExecutionTime: 0,
};

/**
 * Error types for better error handling
 */
export const ERROR_TYPES = {
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK: 'NETWORK',
  API: 'API',
  VALIDATION: 'VALIDATION',
  COMPILATION: 'COMPILATION',
  TIMEOUT: 'TIMEOUT',
  CONFIG: 'CONFIG',
  UNKNOWN: 'UNKNOWN'
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_TYPES.RATE_LIMIT]: 'Please wait before running code again.',
  [ERROR_TYPES.NETWORK]: 'Unable to connect to the compiler service. Please check your internet connection.',
  [ERROR_TYPES.API]: 'The compiler service encountered an error. Please try again later.',
  [ERROR_TYPES.VALIDATION]: 'Invalid code input. Please check your code and try again.',
  [ERROR_TYPES.COMPILATION]: 'Your code has compilation errors.',
  [ERROR_TYPES.TIMEOUT]: 'Code execution timed out. Your code may have an infinite loop.',
  [ERROR_TYPES.CONFIG]: 'Compiler API is not configured. Please contact support.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Get remaining rate limit time (for UI display)
 * @returns {number} Seconds remaining
 */
export function getRateLimitRemaining() {
  const now = Date.now();
  const elapsed = now - RATE_LIMIT.lastExecutionTime;
  const remaining = RATE_LIMIT.cooldownMs - elapsed;

  if (remaining <= 0) {
    return 0;
  }

  return Math.ceil(remaining / 1000);
}

/**
 * Update rate limit timestamp
 */
function updateRateLimitTimestamp() {
  RATE_LIMIT.lastExecutionTime = Date.now();
}

/**
 * Creates a standardized error result
 */
function createErrorResult(type, message = null, statusCode = 0, remainingSeconds = 0) {
  return {
    success: false,
    output: '',
    error: message || ERROR_MESSAGES[type],
    executionTime: 0,
    memoryUsage: 0,
    statusCode,
    errorType: type,
    rateLimitRemaining: remainingSeconds
  };
}

/**
 * Creates a success result from API response
 */
function createSuccessResult(data) {
  return {
    success: true,
    output: data.output || '',
    error: data.error || '',
    executionTime: parseFloat(data.cpuTime) || 0,
    memoryUsage: (parseInt(data.memory, 10) || 0) / 1024, // Convert KB to MB
    statusCode: 200,
    errorType: null,
    rateLimitRemaining: 0
  };
}

/**
 * Executes code via our internal API endpoint
 * The API route proxies to JDoodle to avoid CORS issues
 *
 * @param {string} code - The source code to execute
 * @param {string} language - The programming language (default: 'cpp')
 * @param {string} stdin - Optional standard input for the program
 * @returns {Promise<Object>} The execution result
 */
export async function executeCode(code, language = 'cpp', stdin = '') {
  // Validate input
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return createErrorResult(ERROR_TYPES.VALIDATION, 'Please write some code before executing.');
  }

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        code,
        language,
        stdin
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 35000 // 35 second timeout (slightly longer than server)
      }
    );

    const data = response.data;

    // Update rate limit timestamp on success
    updateRateLimitTimestamp();

    // Check for compilation errors in output
    if (data.output && data.output.toLowerCase().includes('error:')) {
      return {
        success: false,
        output: '',
        error: data.output,
        executionTime: parseFloat(data.cpuTime) || 0,
        memoryUsage: (parseInt(data.memory, 10) || 0) / 1024,
        statusCode: 200,
        errorType: ERROR_TYPES.COMPILATION,
        rateLimitRemaining: 0
      };
    }

    return createSuccessResult(data);

  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Network error (no response)
      if (!error.response) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          return createErrorResult(ERROR_TYPES.TIMEOUT);
        }
        return createErrorResult(ERROR_TYPES.NETWORK);
      }

      // Server responded with error
      const status = error.response.status;
      const errorData = error.response.data;

      // Rate limit error from server
      if (status === 429) {
        const remaining = errorData.remainingSeconds || getRateLimitRemaining();
        return createErrorResult(
          ERROR_TYPES.RATE_LIMIT,
          errorData.message || `Please wait ${remaining} seconds before running code again.`,
          status,
          remaining
        );
      }

      // Configuration error
      if (errorData.errorType === 'CONFIG') {
        return createErrorResult(ERROR_TYPES.CONFIG, errorData.message);
      }

      // Validation error
      if (status === 400) {
        return createErrorResult(ERROR_TYPES.VALIDATION, errorData.message);
      }

      // Server errors
      if (status >= 500) {
        return createErrorResult(ERROR_TYPES.API, errorData.message);
      }

      // Other errors
      return createErrorResult(ERROR_TYPES.UNKNOWN, errorData.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN], status);
    }

    // Unknown error
    return createErrorResult(
      ERROR_TYPES.UNKNOWN,
      error instanceof Error ? error.message : ERROR_MESSAGES[ERROR_TYPES.UNKNOWN]
    );
  }
}

export default {
  executeCode,
  getRateLimitRemaining,
  SUPPORTED_LANGUAGES,
  ERROR_TYPES
};