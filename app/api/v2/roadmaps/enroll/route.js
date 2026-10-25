import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { FreePathResult } from "@/models/v2/freepathresult.model";
import { RoadmapProgress } from "@/models/v2/roadmap.progress.model";
import { verifyFirebaseToken } from "@/lib/auth";

const ALLOWED_ROADMAP_SLUGS = [
  "dsa",
  "dsa-student",
  "dsa-developer",
  "dsa-other",
  "python-beginner",
  "git-github",
  "c-language-course",
  "cpp",
  "prompt-engineering",
  "system-design-fundamentals",
];

const DEFAULT_TOTAL_LEVELS = {
  "dsa": 69,
  "dsa-student": 69,
  "dsa-developer": 69,
  "dsa-other": 69,
  "python-beginner": 42,
  "git-github": 21,
  "c-language-course": 42,
  "cpp": 42,
  "prompt-engineering": 21,
  "system-design-fundamentals": 21,
};

const EnrollRoadmapSchema = z.object({
  roadmapSlug: z
    .string()
    .trim()
    .refine((slug) => ALLOWED_ROADMAP_SLUGS.includes(slug), {
      message: "Unsupported roadmap slug",
    }),
  roadmapTitle: z.string().trim().max(100).optional(),
});

export async function POST(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ ok: false, message: error }, { status: status || 401 });
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = EnrollRoadmapSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parseResult.error.errors[0]?.message || "Invalid roadmap enrollment payload",
        },
        { status: 400 }
      );
    }

    const { roadmapSlug, roadmapTitle } = parseResult.data;

    // 1. Verify User Profile exists
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ ok: false, message: "User profile not found" }, { status: 404 });
    }

    // 2. Atomically add to FreePathResult.roadmap (never duplicate)
    const updatedFp = await FreePathResult.findOneAndUpdate(
      { firebaseUID: decodedToken.uid },
      {
        $addToSet: { roadmap: roadmapSlug },
        $setOnInsert: {
          year: "1",
          pathTaken: "B",
          completedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // 3. Atomically ensure RoadmapProgress exists with status "not_started"
    const totalLevels = DEFAULT_TOTAL_LEVELS[roadmapSlug] || 20;
    await RoadmapProgress.findOneAndUpdate(
      { firebaseUID: decodedToken.uid, roadmapSlug },
      {
        $setOnInsert: {
          userId: user._id,
          roadmapSlug,
          roadmapTitle: roadmapTitle || roadmapSlug,
          role: user.role || "developer",
          status: "not_started",
          totalLevels,
          completedLevels: [],
          completedDays: [],
          passedAssignments: [],
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        ok: true,
        enrolled: roadmapSlug,
        assignedRoadmaps: updatedFp?.roadmap || [roadmapSlug],
        message: `Successfully unlocked ${roadmapTitle || roadmapSlug}`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/v2/roadmaps/enroll] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
