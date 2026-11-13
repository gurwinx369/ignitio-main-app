/**
 * Compiler API Route
 * Acts as a proxy to JDoodle API to avoid CORS issues
 * Server-side requests don't have CORS restrictions
 */

import { NextResponse } from 'next/server';
import axios from 'axios';
import { verifyFirebaseToken } from '@/lib/auth';
import { spamRateLimiter, enforceRateLimit, getClientIp } from '@/lib/security/rateLimiter';

// JDoodle API configuration
const JDOODLE_CONFIG = {
  baseUrl: 'https://api.jdoodle.com/v1/execute',
  clientId: process.env.JDOODLE_CLIENT_ID || process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID || '',
  clientSecret: process.env.JDOODLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET || '',
};

/**
 * POST /api/compiler
 * Executes code via JDoodle API
 */
export async function POST(request) {
  try {
    // 1. Authenticate user
    const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
    if (authError) {
      return NextResponse.json({ error: authError, message: "Authentication required to execute code." }, { status: authStatus || 401 });
    }

    // 2. Rate limiting by user UID (or IP fallback)
    const rateLimitKey = decodedToken?.uid ? `compiler:${decodedToken.uid}` : `compiler:${getClientIp(request)}`;
    const rateLimitError = await enforceRateLimit(spamRateLimiter, rateLimitKey);
    if (rateLimitError) {
      return rateLimitError;
    }

    // Parse request body
    const body = await request.json();
    const { code, language = 'cpp', stdin = '' } = body;

    // Validate input
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json(
        {
          error: 'Invalid code input',
          message: 'Please provide code to execute.',
          errorType: 'VALIDATION'
        },
        { status: 400 }
      );
    }

    // Validate credentials
    if (!JDOODLE_CONFIG.clientId || !JDOODLE_CONFIG.clientSecret) {
      return NextResponse.json(
        {
          error: 'API credentials not configured',
          message: 'JDoodle API credentials are not configured. Please add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET to your environment variables.',
          errorType: 'CONFIG'
        },
        { status: 500 }
      );
    }

    // Language configuration — supports cpp, python3, and c
    const LANGUAGE_MAP = {
      cpp:     { lang: 'cpp',     versionIndex: '0' }, // C++ 17
      python3: { lang: 'python3', versionIndex: '3' }, // Python 3
      c:       { lang: 'c',       versionIndex: '4' }, // C (GCC)
    };
    const languageConfig = LANGUAGE_MAP[language] || LANGUAGE_MAP.cpp;

    // Make request to JDoodle API
    const response = await axios.post(
      JDOODLE_CONFIG.baseUrl,
      {
        clientId: JDOODLE_CONFIG.clientId,
        clientSecret: JDOODLE_CONFIG.clientSecret,
        script: code,
        language: languageConfig.lang,
        versionIndex: languageConfig.versionIndex,
        stdin: stdin
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Return JDoodle response
    const data = response.data;

    return NextResponse.json({
      success: true,
      output: data.output || '',
      error: data.error || '',
      cpuTime: data.cpuTime || '0',
      memory: data.memory || '0',
      statusCode: data.statusCode || 0
    });

  } catch (error) {
    console.error('Compiler API error:', error.message);

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Network error
      if (!error.response) {
        return NextResponse.json(
          {
            error: 'Network error',
            message: 'Unable to connect to the compiler service. Please check your internet connection.',
            errorType: 'NETWORK'
          },
          { status: 503 }
        );
      }

      // JDoodle API error
      const status = error.response.status;
      const errorData = error.response.data;

      return NextResponse.json(
        {
          error: 'Compiler service error',
          message: errorData?.error || errorData?.message || `HTTP ${status}`,
          errorType: 'API',
          details: errorData
        },
        { status: status >= 400 && status < 500 ? status : 500 }
      );
    }

    // Unknown error
    return NextResponse.json(
      {
        error: 'Unexpected error',
        message: 'An unexpected error occurred. Please try again.',
        errorType: 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}