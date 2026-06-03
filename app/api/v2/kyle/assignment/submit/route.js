// POST /api/v2/kyle/assignment/submit
// Scores the user's written response and persists the result.
//
// Attempt rules:
//   - Pass on any attempt → locked immediately, no further submissions.
//   - Fail up to 3 times → locked for 6 hours, then 3 fresh attempts open again.
//   - After a 6-hour cooldown, attemptCount resets to 0; full attempt history is preserved.

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { KyleHistory } from "@/models/v2/kyle.history.model";
import { UserProfile } from "@/models/v2/user.profile.model";
import { scoreAssignment } from "@/features/kyle/lib/kyle.service";

const LevelSchema = z.object({
  concept: z.string().min(1),
  transcript: z.string().min(1),
});

const BodySchema = z.object({
  role: z.enum(["student", "developer", "writer", "designer", "other"]),
  dayNumber: z.number().int().positive(),
  levels: z.array(LevelSchema).min(1),
  assignmentPrompt: z.string().min(1),
  userResponse: z.string().min(1),
});

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

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

  const { role, dayNumber, levels, assignmentPrompt, userResponse } = parsed.data;
  const { uid } = decodedToken;

  await connectToDB();

  try {
    const kyleHistory = await KyleHistory.findOne({ firebaseUID: uid }).lean();
    const existing = kyleHistory?.assignmentHistory?.find(
      (a) => a.dayNumber === dayNumber
    );

    // Gate: already passed — no further submissions allowed.
    if (existing?.passed) {
      return NextResponse.json(
        { error: "You already passed this day's assignment" },
        { status: 423 }
      );
    }

    // Gate: locked — check whether the 6-hour cooldown has expired.
    if (existing?.locked) {
      const cooldownExpired = Date.now() >= new Date(existing.lockedUntil).getTime();

      if (!cooldownExpired) {
        return NextResponse.json(
          {
            error: "Assignment locked — please wait before retrying",
            lockedUntil: existing.lockedUntil,
          },
          { status: 423 }
        );
      }

      // Cooldown expired — reset attempt counter for a fresh session.
      await KyleHistory.updateOne(
        { firebaseUID: uid, "assignmentHistory.dayNumber": dayNumber },
        {
          $set: {
            "assignmentHistory.$.locked": false,
            "assignmentHistory.$.lockedUntil": null,
            "assignmentHistory.$.attemptCount": 0,
          },
        }
      );
      // Reflect the reset locally so the logic below uses the correct state.
      existing.locked = false;
      existing.attemptCount = 0;
    }

    // Score the submission via Kyle — pass dayNumber for difficulty-aware rubric.
    const { score, feedback, passed, breakdown, weaknesses } = await scoreAssignment({
      assignmentPrompt,
      userResponse,
      levels,
      role,
      dayNumber,
    });

    const newAttemptCount = (existing?.attemptCount ?? 0) + 1;
    const isNowLocked = passed || newAttemptCount >= 3;
    // Only set a future lockedUntil on failure after exhausting all 3 attempts.
    const lockedUntil =
      !passed && newAttemptCount >= 3 ? new Date(Date.now() + SIX_HOURS_MS) : null;
    const attemptsRemaining = passed ? 0 : Math.max(0, 3 - newAttemptCount);

    const submission = { userResponse, score, feedback, passed, submittedAt: new Date() };

    if (!existing) {
      // First ever submission for this day — create the assignment record.
      const history = await KyleHistory.findOneAndUpdate(
        { firebaseUID: uid },
        {
          $push: {
            assignmentHistory: {
              dayNumber,
              role,
              assignmentPrompt,
              attempts: [submission],
              attemptCount: 1,
              passed,
              locked: isNowLocked,
              lockedUntil,
            },
          },
          ...(passed ? { $inc: { assignmentsPassed: 1 } } : {}),
        },
        { upsert: true, new: true }
      );

      // Link KyleHistory to UserProfile on first ever record.
      await UserProfile.updateOne(
        { firebaseUID: uid, kyleHistory: null },
        { $set: { kyleHistory: history._id } }
      );
    } else {
      // Subsequent submission — append to the existing day's record.
      await KyleHistory.updateOne(
        { firebaseUID: uid, "assignmentHistory.dayNumber": dayNumber },
        {
          $push: { "assignmentHistory.$.attempts": submission },
          $set: {
            "assignmentHistory.$.passed": passed,
            "assignmentHistory.$.locked": isNowLocked,
            "assignmentHistory.$.lockedUntil": lockedUntil,
            "assignmentHistory.$.attemptCount": newAttemptCount,
          },
          ...(passed ? { $inc: { assignmentsPassed: 1 } } : {}),
        }
      );
    }

    return NextResponse.json(
      { data: { score, feedback, passed, attemptsRemaining, lockedUntil, breakdown, weaknesses } },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/v2/kyle/assignment/submit]", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
