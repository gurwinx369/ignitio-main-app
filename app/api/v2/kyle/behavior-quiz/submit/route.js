// app/api/behavior-quiz/submit/route.js
//
// Called silently by the client in the background after it has already
// shown the user instant right/wrong feedback (client already has the
// answer keys from the /trigger response, so this call is NOT on the
// critical path for feedback — it's purely to persist + classify).
//
// This route does NO grading math. It only:
//   1. reads the stored session shell to enrich the FastAPI payload
//      (eiSnapshot, modelVersion, question, correctOption, nOptions all
//      come from the session — not from the client)
//   2. pools prior graded attempts per concept for classify_concept
//   3. calls FastAPI POST /api/v1/behavior/session/grade
//   4. merges selectedOption (from client) into gradedAttempts before
//      pushing to MongoDB — FastAPI echoes question back via GradedAttemptOut
//   5. writes the response atomically: attempts, E_i anchors, mastery + posterior

import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { BehaviorQuizHistory } from "@/models/v2/behavior.quiz.history.model";

const FASTAPI_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FASTAPI_BASE_URL
    : "http://127.0.0.1:8000";

// Client only sends what it observed — everything else comes from the session shell
const SubmitBodySchema = z.object({
  sessionId: z.string().min(1),
  submittedAttempts: z
    .array(
      z.object({
        concept: z.string().min(1),
        selectedOption: z.string().min(1),
        responseTimeMs: z.number().nonnegative(),
      }),
    )
    .min(1),
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
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const validation = SubmitBodySchema.safeParse(body);
  if (!validation.success) {
    const issues = validation.error.issues || [];
    const firstError = issues[0];
    return NextResponse.json(
      {
        error: firstError?.message || "Validation failed",
        field: firstError?.path ? firstError.path.join(".") : "",
      },
      { status: 422 },
    );
  }

  const { sessionId, submittedAttempts } = validation.data;

  try {
    const history = await BehaviorQuizHistory.findOne({ firebaseUID });
    if (!history) {
      return NextResponse.json(
        { error: "no behavior quiz history for user" },
        { status: 404 },
      );
    }

    // Find the session shell written by /trigger to get generatedItems
    const session = history.behaviorQuizSessions.find(
      (s) => s.sessionId === sessionId,
    );
    if (!session || session.generatedItems.length === 0) {
      return NextResponse.json(
        { error: "session not found or has no generated items" },
        { status: 404 },
      );
    }

    // Index generatedItems by concept for O(1) lookup
    const generatedByConceptMap = Object.fromEntries(
      session.generatedItems.map((item) => [item.concept, item]),
    );

    // Build the enriched payload for FastAPI — eiSnapshot, modelVersion,
    // question, correctOption, nOptions all come from the server-stored snapshot
    const enrichedAttempts = submittedAttempts.map((attempt) => {
      const generated = generatedByConceptMap[attempt.concept];
      if (!generated) {
        throw new Error(
          `No generated item found in session for concept: ${attempt.concept}`,
        );
      }
      return {
        concept: attempt.concept,
        difficultyTier: generated.difficultyTier,
        question: generated.question,
        selectedOption: attempt.selectedOption,
        correctOption: generated.correctOption,
        responseTimeMs: attempt.responseTimeMs,
        nOptions: generated.nOptions,
        eiSnapshot: generated.eiSnapshot,
        modelVersion: generated.modelVersion,
      };
    });

    // Pool prior graded attempts per concept so classify_concept sees the full
    // history — FastAPI is stateless, Next.js supplies this on every call
    const concernedConcepts = [
      ...new Set(submittedAttempts.map((a) => a.concept)),
    ];
    const priorAttemptsByConcept = {};
    for (const concept of concernedConcepts) {
      priorAttemptsByConcept[concept] = history.behaviorQuizSessions
        .flatMap((s) => s.attempts)
        .filter((a) => a.concept === concept && a.speedBucket !== "UNATTEMPTED")
        .map((a) => ({
          wasCorrect: a.wasCorrect,
          speedBucket: a.speedBucket,
          rgbFlag: a.rgbFlag,
          llrContribution: a.llrContribution,
          nOptions: a.nOptions,
        }));
    }

    // Current E_i stats for each (concept, tier) in this submission
    const eiStatsByConceptTier = {};
    for (const attempt of enrichedAttempts) {
      const key = `${attempt.concept}::${attempt.difficultyTier}`;
      const current = history.expectedTimeAnchors?.get(key);
      const n = history.expectedTimeSampleCounts?.get(key);
      if (current !== undefined) {
        eiStatsByConceptTier[key] = { eiCurrent: current, sampleCount: n || 0 };
      }
    }

    const fastApiRes = await fetch(
      `${FASTAPI_URL}/api/v1/behavior/session/grade`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: firebaseUID,
          sessionId,
          submittedAttempts: enrichedAttempts,
          priorAttemptsByConcept,
          eiStatsByConceptTier,
        }),
      },
    );

    if (!fastApiRes.ok) {
      const errorText = await fastApiRes.text();
      console.error(
        "[POST /api/v1/behavior/session/grade] FastAPI error:",
        fastApiRes.status,
        errorText,
      );
      return NextResponse.json({ error: "grading failed" }, { status: 502 });
    }

    const { gradedAttempts, updatedEiStats, conceptVerdicts } =
      await fastApiRes.json();

    // FastAPI echoes question back via GradedAttemptOut. Merge selectedOption
    // (only the client knows which option the user picked) before MongoDB push.
    const selectedByConceptMap = Object.fromEntries(
      submittedAttempts.map((a) => [a.concept, a.selectedOption]),
    );
    const attemptsToSave = gradedAttempts.map((graded) => ({
      ...graded,
      selectedOption: selectedByConceptMap[graded.concept],
      submittedAt: new Date(),
    }));

    // Build atomic $set operations — E_i anchors + mastery verdicts together
    const setOps = {
      "behaviorQuizSessions.$[sess].status": "completed",
    };

    for (const [key, stats] of Object.entries(updatedEiStats || {})) {
      setOps[`expectedTimeAnchors.${key}`] = stats.eiCurrent;
      setOps[`expectedTimeSampleCounts.${key}`] = stats.sampleCount;
    }

    for (const [concept, verdict] of Object.entries(conceptVerdicts || {})) {
      setOps[`conceptMastery.${concept}`] = {
        llr_total: verdict.llr_total ?? 0,
        nAttempts: verdict.nAttempts,
        verdict: verdict.verdict,
        // posterior stored here so the next /trigger call uses it as priorAccuracyRate
        posterior: verdict.posterior ?? null,
        modelVersion: enrichedAttempts[0]?.modelVersion ?? "v1",
        lastUpdatedAt: new Date(),
      };
    }

    await BehaviorQuizHistory.findOneAndUpdate(
      { firebaseUID },
      {
        $set: setOps,
        $push: {
          "behaviorQuizSessions.$[sess].attempts": { $each: attemptsToSave },
        },
        $currentDate: { "behaviorQuizSessions.$[sess].completedAt": true },
      },
      { arrayFilters: [{ "sess.sessionId": sessionId }] },
    );

    return NextResponse.json({ conceptVerdicts }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/v1/kyle/behavior-quiz/submit] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
