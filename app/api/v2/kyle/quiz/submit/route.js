// POST /api/v2/kyle/quiz/submit
// Records the result of a quiz attempt — no LLM call, no answer comparison.
// Frontend already knows wasCorrect. This endpoint only writes to MongoDB.
// Enforces one attempt per levelId — returns 429 if already attempted.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { KyleHistory } from "@/models/v2/kyle.history.model";
import { UserProfile } from "@/models/v2/user.profile.model";

const BodySchema = z.object({
  levelId: z.string().min(1),
  dayNumber: z.number().int().positive(),
  concept: z.string().min(1),
  question: z.string().min(1),
  selectedOption: z.string().min(1),
  wasCorrect: z.boolean(),
});

export async function POST(request) {
  const { decodedToken, error, status } = await verifyFirebaseToken(request);
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

  const { levelId, dayNumber, concept, question, selectedOption, wasCorrect } =
    parsed.data;
  const { uid } = decodedToken;

  await connectToDB();

  try {
    // One attempt per level — check before writing.
    const alreadyAttempted = await KyleHistory.exists({
      firebaseUID: uid,
      "quizHistory.levelId": levelId,
    });

    if (alreadyAttempted) {
      return NextResponse.json(
        { error: "This quiz has already been answered" },
        { status: 429 }
      );
    }

    // Atomic upsert: push attempt + increment correct/wrong counter in one operation.
    const history = await KyleHistory.findOneAndUpdate(
      { firebaseUID: uid },
      {
        $push: {
          quizHistory: { levelId, dayNumber, concept, question, selectedOption, wasCorrect },
        },
        $inc: wasCorrect ? { totalQuizzesCorrect: 1 } : { totalQuizzesWrong: 1 },
      },
      { upsert: true, new: true }
    );

    // Link the KyleHistory doc to UserProfile on first ever submission.
    await UserProfile.updateOne(
      { firebaseUID: uid, kyleHistory: null },
      { $set: { kyleHistory: history._id } }
    );

    return NextResponse.json({ data: { recorded: true } }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/v2/kyle/quiz/submit]", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
