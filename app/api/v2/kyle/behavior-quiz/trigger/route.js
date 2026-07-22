// app/api/v2/kyle/behavior-quiz/trigger/route.js
//
// Called silently by the client after every level completion.
// The server decides whether to fire a quiz (every 3rd concept completed).
//
// Client sends { levelId, roadmapId, concept, transcriptContext, levelContext }
// — concept comes from the client's in-memory roadmap data (always accurate).
//
// This route:
//   1. Auth → firebaseUID
//   2. Calls BehaviorQuizHistory.recordConceptCompletion (atomic counter)
//   3. If fired: builds conceptContexts for all targetConcepts
//      - Current concept: use client-provided transcript/levelContext (always populated)
//      - Older targetConcepts: look up from RoadmapTemplate (DB) if available, else use concept name
//   4. Calls FastAPI POST /api/v1/behavior/session/create
//   5. Persists session shell → BehaviorQuizHistory
//   6. Returns { fired: true, sessionId, quizItems } OR { fired: false }

import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { BehaviorQuizHistory } from "@/models/v2/behavior.quiz.history.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { RoadmapTemplate } from "@/models/v2/roadmap.templates.model";

const FASTAPI_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FASTAPI_BASE_URL
    : "http://127.0.0.1:8000";

const TriggerBodySchema = z.object({
  levelId: z.string().min(1),
  roadmapId: z.string().min(1),
  // Client sends these directly from the in-memory roadmap data — no DB lookup needed
  concept: z.string().default(""),
  transcriptContext: z.string().default(""),
  levelContext: z.string().default(""),
});

export async function POST(request) {
  await connectToDB();

  const { decodedToken, error: authError, status: authStatus } =
    await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: authStatus });
  }

  const firebaseUID = decodedToken.uid;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const validation = TriggerBodySchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues?.[0];
    return NextResponse.json(
      { error: firstError?.message || "Validation failed", field: firstError?.path?.join(".") || "" },
      { status: 422 }
    );
  }

  const { levelId, roadmapId, concept, transcriptContext, levelContext } = validation.data;

  try {
    // --- Step 1: Atomic counter increment + trigger check ---
    const { fired, targetConcepts } = await BehaviorQuizHistory.recordConceptCompletion(
      firebaseUID,
      concept
    );

    if (!fired) {
      return NextResponse.json({ fired: false }, { status: 200 });
    }

    // --- Step 2: Build conceptContexts for all targetConcepts ---
    //
    // Primary source for the CURRENT concept: client-provided data (always accurate).
    // For OTHER targetConcepts (older concepts picked by recordConceptCompletion):
    // try RoadmapTemplate DB, fall back to concept name only.
    //
    // FastAPI can generate a reasonable question from concept name alone.

    // Build a context map for non-current concepts via DB (best-effort)
    const dbContextMap = {}; // concept → { transcriptContext, levelContext }

    const otherConcepts = targetConcepts.filter(c => c !== concept);
    if (otherConcepts.length > 0) {
      try {
        const progressRecord = await RoadmapProgress.findOne({ firebaseUID, roadmapSlug: roadmapId }).lean();
        const roadmapSlug = progressRecord?.roadmapSlug || roadmapId;
        const template = await RoadmapTemplate.findBySlug(roadmapSlug);

        if (template) {
          for (const day of template.days) {
            for (const lvl of day.levels) {
              if (lvl.concept && otherConcepts.includes(lvl.concept)) {
                dbContextMap[lvl.concept] = {
                  transcriptContext: lvl.transcript || "",
                  levelContext: lvl.title || lvl.name || lvl.concept,
                };
              }
            }
          }
        }
      } catch {
        // DB lookup failure is non-fatal — we still generate with concept name fallback
      }
    }

    // --- Step 3: Fetch user's mastery + EI stats for difficulty selection ---
    const history = await BehaviorQuizHistory.findOne({ firebaseUID }).lean();

    const targetConceptPayload = targetConcepts.map((c) => {
      // Current concept → client data (populated). Others → DB or fallback.
      const ctx =
        c === concept
          ? { transcriptContext, levelContext: levelContext || concept }
          : dbContextMap[c] || { transcriptContext: "", levelContext: c };

      const mastery = history?.conceptMastery instanceof Map
        ? history.conceptMastery.get(c)
        : history?.conceptMastery?.[c];

      const eiStats = {};
      for (const tier of ["easy", "medium", "hard"]) {
        const key = `${c}::${tier}`;
        const eiCurrent = history?.expectedTimeAnchors instanceof Map
          ? history.expectedTimeAnchors.get(key)
          : history?.expectedTimeAnchors?.[key];
        const n = history?.expectedTimeSampleCounts instanceof Map
          ? history.expectedTimeSampleCounts.get(key)
          : history?.expectedTimeSampleCounts?.[key];

        if (eiCurrent !== undefined) {
          eiStats[tier] = { eiCurrent, sampleCount: n || 0 };
        }
      }

      return {
        concept: c,
        transcriptContext: ctx.transcriptContext,
        levelContext: ctx.levelContext,
        priorAccuracyRate: mastery?.posterior ?? null,
        eiStats,
      };
    });

    // --- Step 4: Call FastAPI to generate questions ---
    const fastApiRes = await fetch(`${FASTAPI_URL}/api/v1/behavior/session/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: firebaseUID,
        targetConcepts: targetConceptPayload,
        modelVersion: "v1",
      }),
    });

    if (!fastApiRes.ok) {
      const errorText = await fastApiRes.text();
      console.error("[BehaviorQuiz/trigger] FastAPI error:", fastApiRes.status, errorText);
      return NextResponse.json(
        { error: "Quiz generation failed at inference server" },
        { status: 502 }
      );
    }

    const { sessionId, quizItems } = await fastApiRes.json();

    // --- Step 5: Persist session shell ---
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
      { upsert: true }
    );

    return NextResponse.json({ fired: true, sessionId, quizItems }, { status: 200 });
  } catch (error) {
    console.error("[BehaviorQuiz/trigger] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
