// POST /api/v2/kyle/assignment/generate
// Accepts all levels for a completed day and returns a practical written assignment.
// No DB write — generation only. The frontend holds the prompt until the user submits.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import { generateAssignment } from "@/features/kyle/lib/kyle.service";

const LevelSchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
});

const BodySchema = z.object({
  role: z.enum(["student", "developer", "writer", "designer"]),
  dayNumber: z.number().int().positive(),
  levels: z.array(LevelSchema).min(1),
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
    const assignmentPrompt = await generateAssignment(parsed.data);
    return NextResponse.json({ data: { assignmentPrompt } }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/v2/kyle/assignment/generate]", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
