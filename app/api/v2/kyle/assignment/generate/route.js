// POST /api/v2/kyle/assignment/generate
// Accepts all levels for a completed day and returns a practical written assignment
// by calling the Kyle FastAPI service.
// No DB write — generation only. The frontend holds the prompt until the user submits.
// Browser-facing request and response contracts are unchanged.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { callKyleFastApi, KyleFastApiError } from "@/features/kyle/server/kyle-fastapi.client";
import { aiRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";

// ---------------------------------------------------------------------------
// Browser → Next.js request schema (unchanged)
// ---------------------------------------------------------------------------

const LevelSchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
});

const BodySchema = z.object({
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
  dayNumber: z.number().int().positive(),
  levels: z.array(LevelSchema).min(1),
});

// ---------------------------------------------------------------------------
// FastAPI → Next.js response schema (snake_case from upstream)
// ---------------------------------------------------------------------------

const FastApiResponseSchema = z.object({
  assignment_prompt: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request) {
  // 0. Rate Limit
  const rateLimitError = await enforceRateLimit(aiRateLimiter, getClientIp(request));
  if (rateLimitError) return rateLimitError;

  // 1. Verify Firebase ID token — preserves existing 401 behavior.
  const { error, status } = await verifyFirebaseToken(request);
  if (error) return NextResponse.json({ error }, { status });

  // 2. Parse request body — preserves existing 400 behavior.
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Validate browser payload — preserves existing 422 behavior.
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues || parsed.error.errors || [];
    const first = issues[0];
    return NextResponse.json(
      {
        error: first?.message || "Validation failed",
        field: first?.path ? first.path.join(".") : "",
      },
      { status: 422 }
    );
  }

  // 4. Call Kyle FastAPI service.
  // Translate camelCase browser field to snake_case FastAPI field: dayNumber → day_number
  let fastApiData;
  try {
    fastApiData = await callKyleFastApi({
      request,
      path: "/api/v1/assignment/generate",
      body: {
        role: parsed.data.role,
        day_number: parsed.data.dayNumber,
        levels: parsed.data.levels,
      },
    });
  } catch (err) {
    if (err instanceof KyleFastApiError) {
      // err.message is already sanitized; err.upstreamStatus is for logging only.
      console.error(
        "[POST /api/v2/kyle/assignment/generate] FastAPI error:",
        err.message,
        err.upstreamStatus != null ? `(upstream status: ${err.upstreamStatus})` : ""
      );
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Unexpected error — do not leak details.
    console.error("[POST /api/v2/kyle/assignment/generate] Unexpected error:", err?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // 5. Validate FastAPI response shape (guards against upstream schema drift).
  const validated = FastApiResponseSchema.safeParse(fastApiData);
  if (!validated.success) {
    console.error(
      "[POST /api/v2/kyle/assignment/generate] Invalid FastAPI response shape:",
      validated.error.issues
    );
    return NextResponse.json({ error: "Kyle AI returned an invalid assignment" }, { status: 502 });
  }

  // 6. Translate snake_case → camelCase and return the existing browser contract.
  // assignment_prompt → assignmentPrompt
  return NextResponse.json(
    { data: { assignmentPrompt: validated.data.assignment_prompt } },
    { status: 200 }
  );
}
