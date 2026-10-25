// Onboarding service — orchestrates all DB writes after diagnostics are run.
// No HTTP logic here. Called by the route handler after validation.
//
// Write order matters:
//   1. Resolve user (must exist — created at auth time)
//   2. Idempotency check — reject if already onboarded
//   3. Fetch RoadmapTemplate from DB
//   4. Run diagnostics (pure, no DB)
//   5. Compile roadmap (pure, no DB)
//   6. Write OnboardingResponse
//   7. Write RoadmapPersonalization
//   8. Write RoadmapProgress
//   9. Update UserProfile (last step — marks onboarding complete)
//
// If step 9 fails after steps 6–8 succeeded, we have orphaned documents.
// This is acceptable: onboardingComplete remains false, the user retries,
// and we return 409 on subsequent attempts. The orphaned docs are harmless.
// A proper distributed transaction would be over-engineered at this scale.

import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { RoadmapTemplate } from "@/models/v2/roadmap.templates.model";
import { OnboardingResponseModel } from "@/models/v2/onboarding.model";
import { RoadmapPersonalization } from "@/models/v2/roadmap.personalized.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import {
  gradeQ2,
  gradeQ2b,
  gradeQ3,
  gradeQ3b,
  gradeQ4,
  gradeQ5,
  gradeQ6,
  gradeQ7,
  gradeQ7b,
  gradeQ8,
} from "@/lib/onboarding/grader";
import { buildRouting, compileRoadmap } from "@/lib/onboarding/roadmapCompiler";

const SKIP_MARKER = "__skipped__";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert "HH:MM" → minutes since midnight (for the ScheduleSchema) */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/** Map q10 answer → MOTIVATION enum value */
function mapGoalToMotivation(q10) {
  const map = {
    internship_1_3_months: "land_internship",
    build_product: "build_product",
    curiosity_general: "curiosity",
  };
  return map[q10] ?? "curiosity";
}

/** Map q10 → UserProfile.goal enum */
function mapGoalToProfileGoal(q10) {
  const map = {
    internship_1_3_months: "internship_1_3_months",
    build_product: "build_product",
    curiosity_general: "curiosity_general",
  };
  return map[q10] ?? "curiosity_general";
}

// ─── Step 1: Run all diagnostics ────────────────────────────────────────────

/**
 * Run graders on the validated body. Returns a normalized diagnostics object.
 * Each field: { passed, partial?, skipped, rawAnswer, gradingMethod, gradingMeta }
 */
function runDiagnostics(body) {
  const { q1, q2, q2b, q3, q3b, q4, q5, q6, q7, q7b, q8 } = body;
  const fastTrack = q1 === "shipped_rag_or_agent";

  function makeResult({ qId, answer, skipped, gradeResult, method }) {
    if (skipped) {
      return {
        value: SKIP_MARKER,
        passed: null,
        partial: false,
        skipped: true,
        rawAnswer: SKIP_MARKER,
        gradingMethod: "self_report",
        gradingMeta: {},
      };
    }
    return {
      value: answer,
      passed: gradeResult.passed,
      partial: gradeResult.partial ?? false,
      skipped: false,
      rawAnswer: typeof answer === "string" ? answer.slice(0, 500) : JSON.stringify(answer).slice(0, 500),
      gradingMethod: method,
      gradingMeta: {
        matchedKeywords: gradeResult.matchedKeywords ?? [],
        matchedGroups: gradeResult.matchedGroups ?? [],
        reason: gradeResult.reason ?? null,
      },
    };
  }

  const q1Result = {
    value: q1,
    passed: true, // Q1 is always a self-report gate, no pass/fail
    partial: false,
    skipped: false,
    rawAnswer: q1,
    gradingMethod: "self_report",
    gradingMeta: {},
  };

  const q2Result = makeResult({
    qId: "Q2",
    answer: q2,
    skipped: fastTrack || !q2 || q2 === SKIP_MARKER,
    gradeResult: (q2 && q2 !== SKIP_MARKER) ? gradeQ2(q2) : {},
    method: "keyword_match",
  });

  const q2bResult = makeResult({
    qId: "Q2b",
    answer: q2b,
    skipped: fastTrack || !q2b || q2b === SKIP_MARKER || !q2Result.passed,
    gradeResult: (q2b && q2b !== SKIP_MARKER && q2Result.passed) ? gradeQ2b(q2b) : {},
    method: "keyword_match",
  });

  const q3Result = makeResult({
    qId: "Q3",
    answer: q3,
    skipped: fastTrack || !q3 || q3 === SKIP_MARKER,
    gradeResult: (q3 && q3 !== SKIP_MARKER) ? gradeQ3(q3) : {},
    method: "exact_match",
  });

  const q3bResult = makeResult({
    qId: "Q3b",
    answer: q3b,
    skipped: fastTrack || !q3b || q3b === SKIP_MARKER,
    gradeResult: (q3b && q3b !== SKIP_MARKER) ? gradeQ3b(q3b) : {},
    method: "multiple_choice",
  });

  const q4Result = makeResult({
    qId: "Q4",
    answer: q4,
    skipped: fastTrack || !q4 || q4 === SKIP_MARKER,
    gradeResult: (q4 && q4 !== SKIP_MARKER) ? gradeQ4(q4) : {},
    method: "keyword_match",
  });

  const q5Result = makeResult({
    qId: "Q5",
    answer: q5,
    skipped: fastTrack || !q5 || q5 === SKIP_MARKER,
    gradeResult: (q5 && q5 !== SKIP_MARKER) ? gradeQ5(q5) : {},
    method: "multiple_choice",
  });

  const q6Result = makeResult({
    qId: "Q6",
    answer: q6,
    skipped: fastTrack || !q6 || q6 === SKIP_MARKER,
    gradeResult: (q6 && q6 !== SKIP_MARKER) ? gradeQ6(q6) : {},
    method: "exact_match",
  });

  const q7Result = makeResult({
    qId: "Q7",
    answer: q7,
    skipped: !q7 || q7 === SKIP_MARKER,
    gradeResult: (q7 && q7 !== SKIP_MARKER) ? gradeQ7(q7) : {},
    method: "keyword_match",
  });

  const q7bResult = makeResult({
    qId: "Q7b",
    answer: q7b,
    skipped: !q7b || q7b === SKIP_MARKER,
    gradeResult: (q7b && q7b !== SKIP_MARKER) ? gradeQ7b(q7b) : {},
    method: "keyword_match",
  });

  const q8Result = makeResult({
    qId: "Q8",
    answer: q8,
    skipped: !q8 || q8 === SKIP_MARKER,
    gradeResult: (q8 && q8 !== SKIP_MARKER) ? gradeQ8(q8) : {},
    method: "keyword_match",
  });

  return {
    q1: q1Result,
    q2: q2Result,
    q2b: q2bResult,
    q3: q3Result,
    q3b: q3bResult,
    q4: q4Result,
    q5: q5Result,
    q6: q6Result,
    q7: q7Result,
    q7b: q7bResult,
    q8: q8Result,
  };
}

// ─── Step 2: Build OnboardingResponse.responses array ───────────────────────

function buildResponsesArray(diagnostics, body) {
  const { q10, schedule } = body;

  const questionMap = [
    { questionId: "Q1",  questionText: "Where are you starting from?",                                   questionType: "SELF_REPORT",    moduleRef: null,       d: diagnostics.q1 },
    { questionId: "Q2",  questionText: "Why does prompt B behave more reliably in production?",           questionType: "SHORT_ANSWER",   moduleRef: "1-7",      d: diagnostics.q2 },
    { questionId: "Q2b", questionText: "Your most important instruction is in paragraph 5 of 10. Fix?",  questionType: "SHORT_ANSWER",   moduleRef: "8-14",     d: diagnostics.q2b },
    { questionId: "Q3",  questionText: "What does process(data) print?",                                 questionType: "CODE_EXERCISE",  moduleRef: "15-21",    d: diagnostics.q3 },
    { questionId: "Q3b", questionText: "Where should you NEVER put an API key?",                         questionType: "MCQ",            moduleRef: "22-28",    d: diagnostics.q3b },
    { questionId: "Q4",  questionText: "chain = prompt | model | ______  — fill in the blank.",          questionType: "SHORT_ANSWER",   moduleRef: "29-35",    d: diagnostics.q4 },
    { questionId: "Q5",  questionText: "Which pair has embeddings closer together in vector space?",     questionType: "MCQ",            moduleRef: "36-42",    d: diagnostics.q5 },
    { questionId: "Q6",  questionText: "Put the RAG pipeline steps in the correct order.",              questionType: "MCQ",            moduleRef: "43-49",    d: diagnostics.q6 },
    { questionId: "Q7",  questionText: "What is missing that makes this endpoint fail under load?",      questionType: "SHORT_ANSWER",   moduleRef: "50-56",    d: diagnostics.q7 },
    { questionId: "Q7b", questionText: "One-line reason to return a Pydantic model vs a raw dict.",      questionType: "SHORT_ANSWER",   moduleRef: "57-63",    d: diagnostics.q7b },
    { questionId: "Q8",  questionText: "In one sentence: what is the difference between a chain and an agent?", questionType: "SHORT_ANSWER", moduleRef: "64-70", d: diagnostics.q8 },
    { questionId: "Q10", questionText: "What is pulling you toward this right now?",                     questionType: "SELF_REPORT",    moduleRef: null,       d: { passed: true, skipped: false, rawAnswer: q10, gradingMethod: "self_report", gradingMeta: {} } },
  ];

  return questionMap.map(({ questionId, questionText, questionType, moduleRef, d }) => ({
    questionId,
    questionText,
    questionType,
    moduleRef,
    answerGiven: d.rawAnswer,
    passed: d.passed ?? false,
    score: d.passed === true ? 1 : d.passed === false ? 0 : null,
    gradingMethod: d.gradingMethod,
    gradingMeta: d.gradingMeta ?? {},
    attemptNumber: 1,
    timeTakenSeconds: null,
  }));
}

// ─── Step 3: Build roadmapExclusions array ───────────────────────────────────

function buildExclusions(skippedDayIds, skipReasonMap) {
  return skippedDayIds.map((dayId, idx) => {
    const info = skipReasonMap[dayId] ?? {};
    return {
      weekNumber: idx + 1,
      moduleTitle: dayId,
      triggeredByQuestionId: info.triggeredBy ?? null,
      skipReasonShownToUser: info.reason ?? "",
      daysSaved: info.levelsSaved ?? 0,
    };
  });
}

// ─── Step 4: Build optionalFlags array ──────────────────────────────────────

function buildOptionalFlags(optionalDayIds, skipReasonMap) {
  return optionalDayIds.map((dayId) => {
    const info = skipReasonMap[dayId] ?? {};
    return {
      weekNumber: null, // not week-indexed in optional path
      reason: info.reason ?? "",
      userChoice: "not_yet_reached",
      choiceMadeAt: null,
    };
  });
}

// ─── Main service function ───────────────────────────────────────────────────

/**
 * Run the full onboarding flow for a verified user.
 *
 * @param {object} params
 * @param {string} params.firebaseUID
 * @param {object} params.body  — validated body from Zod
 * @returns {object} result or throws on DB error
 */
export async function runOnboarding({ firebaseUID, body }) {
  await connectToDB();

  // ── Resolve user ───────────────────────────────────────────────────────────
  const user = await UserProfile.findOne({ firebaseUID });
  if (!user) {
    return { error: "User profile not found", status: 404 };
  }

  // ── Idempotency: block if already onboarded ────────────────────────────────
  if (user.onboardingComplete) {
    const existing = await RoadmapPersonalization.findOne({
      firebaseUID,
      isActive: true,
    }).lean();
    return {
      error: "already_onboarded",
      status: 409,
      personalizationId: existing?._id ?? null,
    };
  }

  // ── Fetch roadmap template ─────────────────────────────────────────────────
  const template = await RoadmapTemplate.findBySlug(body.roadmapSlug);
  if (!template) {
    return { error: `Roadmap template '${body.roadmapSlug}' not found`, status: 404 };
  }

  // ── Run diagnostics (pure) ─────────────────────────────────────────────────
  const diagnostics = runDiagnostics(body);

  // ── Compile roadmap (pure) ─────────────────────────────────────────────────
  const routing = buildRouting(diagnostics);
  const compiled = compileRoadmap(template, routing);

  const {
    includedDayIds,
    optionalDayIds,
    skippedDayIds,
    totalLevels,
    skipReasonMap,
  } = compiled;

  const now = new Date();
  const { schedule, q10 } = body;

  // ── Write: OnboardingResponse ──────────────────────────────────────────────
  const responses = buildResponsesArray(diagnostics, body);
  const exclusions = buildExclusions(skippedDayIds, skipReasonMap);
  const optionalFlags = buildOptionalFlags(optionalDayIds, skipReasonMap);

  const startMinute = timeToMinutes(schedule.startTime);
  const endMinute = timeToMinutes(schedule.endTime);

  const diagnosticsArray = Object.entries(diagnostics).map(([qId, d]) => ({
    questionId: qId.toUpperCase(),
    passed: d.passed,
    rawAnswer: d.rawAnswer,
    routedAction: d.skipped
      ? "skip_week"
      : d.passed
      ? "skip_week"
      : d.partial
      ? "optional"
      : "keep",
    answeredAt: now,
  }));

  // Track created documents for manual rollback if a later step fails
  let onboardingDocId = null;
  let personalizationDocId = null;
  let progressDocId = null;
  
  let personalizationDoc;

  try {
    const onboardingDoc = await OnboardingResponseModel.create({
      firebaseUID,
      onboardingVersion: "v2",
      entryPoint: body.q1,
      responses,
      primaryGoalSnapshot: q10,
      roadmapExclusions: exclusions,
      optionalFlags,
      timeWindowSchema: {
        period: schedule.period,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      status: "completed",
      completedAt: now,
    });
    onboardingDocId = onboardingDoc._id;

    // ── Write: RoadmapPersonalization ──────────────────────────────────────────
    personalizationDoc = await RoadmapPersonalization.create({
      userId: user._id,
      firebaseUID,
      roadmapSlug: body.roadmapSlug,
      includedDayIds,
      optionalDayIds,
      skippedDayIds,
      totalLevels,
      schedule: {
        timezone: schedule.timezone,
        freeWindows: [
          {
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // daily — no day-of-week granularity in onboarding
            startMinute,
            endMinute,
          },
        ],
        isDefault: false,
      },
      motivation: mapGoalToMotivation(q10),
      diagnostics: diagnosticsArray,
      templateSnapshotAt: template.updatedAt ?? now,
      isActive: true,
      version: 1,
    });
    personalizationDocId = personalizationDoc._id;

    // ── Write: RoadmapProgress (seed, not_started) ─────────────────────────────
    const progressDoc = await RoadmapProgress.create({
      userId: user._id,
      firebaseUID,
      roadmapSlug: body.roadmapSlug,
      roadmapTitle: template.title,
      role: user.role ?? "developer",
      status: "not_started",
      completedLevels: [],
      totalLevels,
      completedDays: [],
      passedAssignments: [],
      startedAt: null,
      completedAt: null,
      lastLearningActiveAt: null,
    });
    progressDocId = progressDoc._id;

    // ── Update: UserProfile ────────────────────────────────────────────────────
    await UserProfile.updateOne(
      { _id: user._id },
      {
        $set: {
          goal: mapGoalToProfileGoal(q10),
          onboardingVersion: "v2",

          schedulePreference: {
            windows: [
              {
                period: schedule.period,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              },
            ],
            timezone: schedule.timezone,
            isDefault: false,
          },

          roadmapPersonalizationRef: personalizationDoc._id,
          roadmap_name: template.title,

          onboardingComplete: true,
          completedAt: now,
          last_active_on: now,

          "streak.timezone": schedule.timezone,
          "streak.onboardingStartDate": new Intl.DateTimeFormat("en-CA", {
            timeZone: schedule.timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(now),
        },
      },
      { timestamps: false }
    );
  } catch (err) {
    // Clean up partial writes to prevent orphaned documents
    console.error("[runOnboarding] Database write failed. Rolling back...", err.message);
    if (onboardingDocId) {
      await OnboardingResponseModel.deleteOne({ _id: onboardingDocId }).catch(e => console.error("Rollback failed for onboardingDoc:", e.message));
    }
    if (personalizationDocId) {
      await RoadmapPersonalization.deleteOne({ _id: personalizationDocId }).catch(e => console.error("Rollback failed for personalizationDoc:", e.message));
    }
    if (progressDocId) {
      await RoadmapProgress.deleteOne({ _id: progressDocId }).catch(e => console.error("Rollback failed for progressDoc:", e.message));
    }
    throw err;
  }

  // ── Build skip reason summary for the response ─────────────────────────────
  const skipReasons = skippedDayIds.map((dayId) => {
    const info = skipReasonMap[dayId];
    return {
      dayId,
      triggeredBy: info?.triggeredBy ?? null,
      reason: info?.reason ?? "",
      levelsSaved: info?.levelsSaved ?? 0,
    };
  });

  const totalLevelsSaved = skipReasons.reduce((sum, r) => sum + r.levelsSaved, 0);

  return {
    ok: true,
    personalizationId: personalizationDoc._id,
    roadmapSlug: body.roadmapSlug,
    totalLevels,
    skippedDays: skippedDayIds,
    optionalDays: optionalDayIds,
    includedDays: includedDayIds,
    totalLevelsSaved,
    skipReasons,
  };
}
