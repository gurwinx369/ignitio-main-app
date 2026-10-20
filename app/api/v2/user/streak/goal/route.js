import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { verifyFirebaseToken } from "@/lib/auth";

const StreakGoalSchema = z.object({
  targetGoal: z.union([
    z.literal(7),
    z.literal(14),
    z.literal(21),
    z.literal(24),
    z.literal(30),
  ]),
});

export async function PATCH(request) {
  await connectToDB();

  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const validation = StreakGoalSchema.safeParse(body);

  if (!validation.success) {
    const issues = validation.error.issues || validation.error.errors || [];
    const firstError = issues[0];
    return NextResponse.json(
      {
        message: "Validation failed",
        field: firstError?.path ? firstError.path.join(".") : "targetGoal",
        detail: firstError?.message || "Expected 7, 14, 21, 24, or 30",
      },
      { status: 422 },
    );
  }

  const { targetGoal } = validation.data;

  try {
    const updatedUser = await UserProfile.findOneAndUpdate(
      { firebaseUID: decodedToken.uid },
      {
        $set: {
          "streak.targetGoal": targetGoal,
          "streak.targetGoalSetAt": new Date(),
          "streak.day2PromptSeen": true,
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Streak goal set successfully",
        streak: {
          targetGoal: updatedUser.streak?.targetGoal,
          targetGoalSetAt: updatedUser.streak?.targetGoalSetAt,
          day2PromptSeen: updatedUser.streak?.day2PromptSeen,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[PATCH /api/v2/user/streak/goal] DB error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
