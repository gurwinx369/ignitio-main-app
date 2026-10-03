// POST /api/v2/kyle/doubt
// Accepts the current level context and the user's question.
// Returns Kyle's answer scoped strictly to that level's content.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { callKyleFastApi } from "@/features/kyle/server/kyle-fastapi.client";

const BodySchema = z.object({
  mode: z.enum(["contextual", "general"]).optional(),
  concept: z.string().optional(),
  transcript: z.string().optional(),
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
  question: z.string().min(1).max(500),
  pageContext: z.string().optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      text: z.string(),
    })
  ).optional(),
}).superRefine((data, ctx) => {
  const hasContext = Boolean(data.concept?.trim()) && Boolean(data.transcript?.trim());
  if (data.mode === "general") return;
  if (!hasContext) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "concept and transcript are required for contextual requests",
      path: ["concept"],
    });
  }
});

export async function POST(request) {
  const { error, status } = await verifyFirebaseToken(request);
  if (error) return NextResponse.json({ error }, { status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues || parsed.error.errors || [];
    const first = issues[0];
    return NextResponse.json(
      {
        error: first?.message || "Validation failed",
        field: first?.path ? first.path.join(".") : "",
      },
      { status: 422 },
    );
  }

  try {
    const responseData = await callKyleFastApi({
      request,
      path: "/api/v1/doubt",
      body: {
        mode: parsed.data.mode,
        concept: parsed.data.concept,
        transcript: parsed.data.transcript,
        role: parsed.data.role,
        question: parsed.data.question,
        pageContext: parsed.data.pageContext,
        history: parsed.data.history
      },
      timeoutMs: 35000 // Let frontend 25s timeout hit first naturally
    });

    return NextResponse.json({ data: { answer: responseData.answer } }, { status: 200 });
  } catch (err) {
    if (err.name === "KyleFastApiError") {
      const isTransient = [502, 503, 504].includes(err.status);
      if (isTransient) {
        return NextResponse.json(
          {
            error: "Kyle is busy right now. Please try again in a few seconds.",
            retryable: true,
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: err.message },
        { status: err.status },
      );
    }

    console.error("[POST /api/v2/kyle/doubt]", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
