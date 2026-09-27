// POST /api/v2/kyle/quiz/generate
// Generates a quiz for the level that just ended by calling the Kyle FastAPI service.
// Preserves the existing browser-facing response contract: { data: { question, options, correctAnswer, explanation } }

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { callKyleFastApi, KyleFastApiError } from "@/features/kyle/server/kyle-fastapi.client";

// ---------------------------------------------------------------------------
// Browser → Next.js request schema (unchanged)
// ---------------------------------------------------------------------------

const BodySchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
});


// ---------------------------------------------------------------------------
// FastAPI → Next.js response schema (snake_case from upstream)
// ---------------------------------------------------------------------------

const FastApiResponseSchema = z.object({
  question: z.string().min(1),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
  }),
  correct_answer: z.enum(["A", "B", "C"]),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request) {
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
  let fastApiData;
  try {
    fastApiData = await callKyleFastApi({
      request,
      path: "/api/v1/quiz/generate",
      body: parsed.data,
    });
  } catch (err) {
    if (err instanceof KyleFastApiError) {
      // err.message is already sanitized; err.upstreamStatus is for logging only.
      console.error(
        "[POST /api/v2/kyle/quiz/generate] FastAPI error:",
        err.message,
        err.upstreamStatus != null ? `(upstream status: ${err.upstreamStatus})` : ""
      );
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Unexpected error — do not leak details.
    console.error("[POST /api/v2/kyle/quiz/generate] Unexpected error:", err?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // 5. Validate FastAPI response shape (guards against upstream schema drift).
  const validated = FastApiResponseSchema.safeParse(fastApiData);
  if (!validated.success) {
    console.error(
      "[POST /api/v2/kyle/quiz/generate] Invalid FastAPI response shape:",
      validated.error.issues
    );
    return NextResponse.json({ error: "Kyle AI returned an invalid quiz" }, { status: 502 });
  }

  // 6. Translate snake_case → camelCase and return the existing browser contract.
  // correct_answer → correctAnswer (all other fields are already camelCase-compatible)
  const { question, options, correct_answer, explanation } = validated.data;
  return NextResponse.json(
    {
      data: {
        question,
        options,
        correctAnswer: correct_answer,
        explanation,
      },
    },
    { status: 200 }
  );
}
