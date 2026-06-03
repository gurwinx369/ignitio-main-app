// POST /api/v2/kyle/doubt
// Accepts the current level context and the user's question.
// Returns Kyle's answer scoped strictly to that level's content.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { answerDoubt } from "@/features/kyle/lib/kyle.service";

const BodySchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
  question: z.string().min(1).max(500),
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
    const answer = await answerDoubt(parsed.data);
    return NextResponse.json({ data: { answer } }, { status: 200 });
  } catch (err) {
    const errMsg = err.message || "";
    const isTransient = /503|Service Unavailable|high demand|try again later/i.test(errMsg);

    if (isTransient) {
      const delay = Math.floor(Math.random() * (1200 - 700 + 1)) + 700;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const retryAnswer = await answerDoubt(parsed.data);
        return NextResponse.json({ data: { answer: retryAnswer } }, { status: 200 });
      } catch (retryErr) {
        const retryErrMsg = retryErr.message || "";
        if (/503|Service Unavailable|high demand|try again later/i.test(retryErrMsg)) {
          return NextResponse.json(
            { error: "Kyle is busy right now. Please try again in a few seconds." },
            { status: 503 }
          );
        }
        console.error("[POST /api/v2/kyle/doubt] Retry error:", retryErr.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    console.error("[POST /api/v2/kyle/doubt]", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
