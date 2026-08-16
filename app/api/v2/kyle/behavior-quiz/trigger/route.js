import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { BehaviorQuizHistory } from "@/models/v2/behavior.quiz.history.model";
import { RoadmapTemplate } from "@/models/v2/roadmap.templates.model";
import {
  checkPremiumGenAiAccess,
  getPremiumGenAiAccessHttpStatus,
} from "@/lib/premium/genai/premium-genai-access.service";

const FASTAPI_URL = (
  process.env.FASTAPI_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const TriggerBodySchema = z.object({
  levelId: z.string().min(1),
  roadmapId: z.string().optional(),
});

export async function POST(request) {
  await connectToDB();

  const { decodedToken, error: authError, status: authStatus } =
    await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ error: authError }, { status: authStatus });
  }

  const firebaseUID = decodedToken.uid;

  // --- Step 1: Premium GenAI guard ---
  const access = await checkPremiumGenAiAccess(firebaseUID);
  if (access.status !== "ready") {
    return NextResponse.json(
      {
        error: `Premium GenAI access denied: ${access.status}`,
      },
      {
        status: getPremiumGenAiAccessHttpStatus(
          access.status,
        ),
      },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const validation = TriggerBodySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 422 }
    );
  }

  const { levelId, roadmapId } = validation.data;

  if (roadmapId && roadmapId !== "gen-ai-internship") {
    return NextResponse.json(
      { error: "Behavioral quiz is only enabled for Premium GenAI roadmap" },
      { status: 400 }
    );
  }

  try {
    // --- Step 2: Pending session resume (resume without new counter) ---
    const existingHistory = await BehaviorQuizHistory.findOne(
      {
        firebaseUID,
        behaviorQuizSessions: {
          $elemMatch: { status: "in_progress" }
        }
      },
      { "behaviorQuizSessions.$": 1 }
    ).lean();

    if (existingHistory && existingHistory.behaviorQuizSessions && existingHistory.behaviorQuizSessions.length > 0) {
      const activeSession = existingHistory.behaviorQuizSessions[0];
      if (activeSession.sessionId && Array.isArray(activeSession.generatedItems) && activeSession.generatedItems.length > 0) {
        return NextResponse.json({
          fired: true,
          sessionId: activeSession.sessionId,
          quizItems: activeSession.generatedItems,
          resumed: true
        }, { status: 200 });
      }
    }

    // --- Step 3: Canonical Validation Chain ---
    const template = await RoadmapTemplate.findBySlug("gen-ai-internship");
    if (!template) {
      return NextResponse.json({ error: "Canonical template not found" }, { status: 500 });
    }

    // Find canonical level and parent day
    let canonicalLevel = null;
    let canonicalDay = null;
    for (const day of template.days) {
      for (const lvl of day.levels) {
        if (lvl.id === levelId) {
          canonicalLevel = lvl;
          canonicalDay = day;
          break;
        }
      }
      if (canonicalLevel) break;
    }

    if (!canonicalLevel || !canonicalDay) {
      return NextResponse.json(
        { error: "Invalid levelId: not found in canonical template" },
        { status: 400 }
      );
    }

    // Active personalization validation (parent day check)
    if (!access.personalization.includedDayIds.includes(canonicalDay.id)) {
      return NextResponse.json(
        { error: "Invalid levelId: parent day is skipped or not active" },
        { status: 403 }
      );
    }

    // Progress proof
    if (!access.progress.completedLevels.includes(levelId)) {
      return NextResponse.json(
        { error: "Invalid levelId: not completed in trusted progress" },
        { status: 403 }
      );
    }

    const canonicalConcept = canonicalLevel.concept;
    if (!canonicalConcept) {
      // If there's no concept, it can't contribute to behavioral mastery
      return NextResponse.json({ fired: false }, { status: 200 });
    }

    // --- Step 4: Exact-Once Claim ---
    const claim = await BehaviorQuizHistory.recordConceptCompletion(
      firebaseUID,
      canonicalConcept,
      "gen-ai-internship",
      levelId
    );

    if (claim.duplicate) {
      return NextResponse.json({ fired: false, duplicate: true }, { status: 200 });
    }

    if (!claim.fired) {
      return NextResponse.json({ fired: false }, { status: 200 });
    }

    const { targetConcepts } = claim;

    // --- Step 5: Build canonical context for targetConcepts ---
    const dbContextMap = {};
    for (const day of template.days) {
      for (const lvl of day.levels) {
        if (lvl.concept && targetConcepts.includes(lvl.concept)) {
          dbContextMap[lvl.concept] = {
            transcriptContext: lvl.transcript || "",
            levelContext: lvl.title || lvl.name || lvl.concept,
          };
        }
      }
    }

    const history = await BehaviorQuizHistory.findOne({ firebaseUID }).lean();
    const targetConceptPayload = targetConcepts.map((c) => {
      const ctx = dbContextMap[c] || { transcriptContext: "", levelContext: c };

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

    // --- Step 6: Call FastAPI ---
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

    if (
      typeof sessionId !== "string" ||
      sessionId.length === 0 ||
      !Array.isArray(quizItems) ||
      quizItems.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Quiz generation returned an invalid response",
        },
        {
          status: 502,
        },
      );
    }

    // --- Step 7: Second access check before persistence ---
    const reAccess = await checkPremiumGenAiAccess(firebaseUID);
    if (reAccess.status !== "ready") {
      return NextResponse.json(
        {
          error: `Premium GenAI access lost: ${reAccess.status}`,
        },
        {
          status: getPremiumGenAiAccessHttpStatus(
            reAccess.status,
          ),
        },
      );
    }

    // --- Step 8: Persist session shell ---
    const updatedHistory = await BehaviorQuizHistory.findOneAndUpdate(
      {
        firebaseUID,
        behaviorQuizSessions: {
          $not: {
            $elemMatch: { status: "in_progress" }
          }
        }
      },
      {
        $push: {
          behaviorQuizSessions: {
            sessionId,
            triggeredAfterConceptCount: claim.conceptCount ?? 0,
            targetConcepts,
            status: "in_progress",
            generatedItems: quizItems,
            attempts: [],
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedHistory) {
      const concurrentHistory = await BehaviorQuizHistory.findOne(
        {
          firebaseUID,
          behaviorQuizSessions: {
            $elemMatch: { status: "in_progress" }
          }
        },
        { "behaviorQuizSessions.$": 1 }
      ).lean();

      if (concurrentHistory && concurrentHistory.behaviorQuizSessions && concurrentHistory.behaviorQuizSessions.length > 0) {
        const activeSession = concurrentHistory.behaviorQuizSessions[0];
        if (activeSession.sessionId && Array.isArray(activeSession.generatedItems) && activeSession.generatedItems.length > 0) {
          return NextResponse.json({
            fired: true,
            sessionId: activeSession.sessionId,
            quizItems: activeSession.generatedItems,
            resumed: true
          }, { status: 200 });
        }
      }

      return NextResponse.json({ error: "Failed to create behavior quiz session" }, { status: 409 });
    }

    return NextResponse.json({ fired: true, sessionId, quizItems }, { status: 200 });
  } catch (error) {
    console.error("[BehaviorQuiz/trigger] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
