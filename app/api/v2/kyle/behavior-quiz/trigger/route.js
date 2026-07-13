// app/api/behavior-quiz/trigger/route.js
//
// Fires after BehaviorQuizHistory.recordConceptCompletion() returns fired=true
// (called from wherever "concept completed" already fires in your existing
// roadmap pipeline — see BehaviorQuizHistory.js).
//
// This route does NO grading math. It only:
//   1. builds the request payload (pulling E_i stats + prior accuracy from Mongo)
//   2. calls FastAPI POST /behavior/session/create
//   3. persists the returned session shell into BehaviorQuizHistory
//   4. returns quiz items (WITH answer keys) to the client, per your flow
// one line - it triggers the FAST API for kyle Ai then creates a session shell in the mongoDB, then responding with sessionID and quiz items
import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { BehaviorQuizHistory } from "@/models/v2/behavior.quiz.history.model";

const FASTAPI_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FASTAPI_BASE_URL
    : "http://127.0.0.1:8000";

const TriggerBodySchema = z.object({
  targetConcepts: z.array(z.string()).min(1).max(3),
  conceptContexts: z.record(
    z.string(),
    z.object({
      transcriptContext: z.string().min(1),
      levelContext: z.string().min(1),
    }),
  ),
});

export async function POST(request) {
  await connectToDB();

  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: authStatus });
  }

  const firebaseUID = decodedToken.uid;

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const validation = TriggerBodySchema.safeParse(body);
  if (!validation.success) {
    const issues = validation.error.issues || validation.error.errors || [];
    const firstError = issues[0];
    return NextResponse.json(
      {
        error: firstError?.message || "Validation failed",
        field: firstError?.path ? firstError.path.join(".") : "",
      },
      { status: 422 },
    );
  }

  const { targetConcepts, conceptContexts } = validation.data;

  try {
    const history = await BehaviorQuizHistory.findOne({ firebaseUID });

    const targetConceptPayload = targetConcepts.map((concept) => {
      const ctx = conceptContexts[concept] || {};
      const mastery = history?.conceptMastery?.get(concept);

      // pull current E_i stats for every tier we've seen this concept at
      const eiStats = {};
      for (const tier of ["easy", "medium", "hard"]) {
        const key = `${concept}::${tier}`;
        const current = history?.expectedTimeAnchors?.get(key);
        const n = history?.expectedTimeSampleCounts?.get(key);
        if (current !== undefined) {
          eiStats[tier] = { eiCurrent: current, sampleCount: n || 0 };
        }
      }

      return {
        concept,
        transcriptContext: ctx.transcriptContext,
        levelContext: ctx.levelContext,
        priorAccuracyRate: mastery ? (mastery.posterior ?? null) : null,
        eiStats,
      };
    });

    const fastApiRes = await fetch(
      `${FASTAPI_URL}/api/v1/behavior/session/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUID,
          targetConcepts: targetConceptPayload,
          modelVersion: "v1",
        }),
      },
    );

    if (!fastApiRes.ok) {
      const errorText = await fastApiRes.text();
      console.error(
        "[POST /api/v1/behavior/session/create] FastAPI error:",
        fastApiRes.status,
        errorText,
      );
      return NextResponse.json(
        { error: "Quiz generation failed at inference server" },
        { status: 502 },
      );
    }

    const { sessionId, quizItems } = await fastApiRes.json();

    // persist the session shell — generatedItems stored now so submit can enrich
    // the FastAPI grading payload without trusting client-sent data
    await BehaviorQuizHistory.findOneAndUpdate(
      { firebaseUID },
      {
        $push: {
          behaviorQuizSessions: {
            sessionId,
            triggeredAfterConceptCount: history?.conceptsCompletedCounter ?? 0,
            targetConcepts,
            status: "in_progress",
            generatedItems: quizItems,
            attempts: [],
            createdAt: new Date(),
          },
        },
      },
      { upsert: true },
    );

    // send questions AND answer keys to the client, per the flow you specified
    return NextResponse.json({ sessionId, quizItems }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/v1/kyle/behavior-quiz/trigger] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
