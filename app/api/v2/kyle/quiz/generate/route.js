// POST /api/v2/kyle/quiz/generate
// Generates a quiz for the level that just ended.
// Returns the full quiz including correctAnswer — frontend handles comparison and UX.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { generateQuiz } from "@/features/kyle/lib/kyle.service";

const BodySchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
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
      { status: 422 }
    );
  }

  try {
    const quiz = await generateQuiz(parsed.data);
    // Returns: { question, options: { A, B, C }, correctAnswer, explanation }
    return NextResponse.json({ data: quiz }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/v2/kyle/quiz/generate]", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
