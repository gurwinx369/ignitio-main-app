import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { verifyFirebaseToken } from "@/lib/auth";
import { RoadmapTemplate } from "@/models/v2/roadmap.templates.model";
import {
  checkPremiumGenAiAccess,
  getPremiumGenAiAccessHttpStatus,
} from "@/lib/premium/genai/premium-genai-access.service";

export async function GET(request) {
  await connectToDB();

  const { decodedToken, error, status } =
    await verifyFirebaseToken(request);

  if (error) {
    return NextResponse.json(
      { message: error },
      { status },
    );
  }

  const firebaseUID = decodedToken.uid;

  try {
    const access =
      await checkPremiumGenAiAccess(firebaseUID);

    if (access.status !== "ready") {
      return NextResponse.json(
        {
          error: `Premium GenAI access denied: ${access.status}`,
        },
        {
          status:
            getPremiumGenAiAccessHttpStatus(
              access.status,
            ),
        },
      );
    }

    const { personalization } = access;

    const template =
      await RoadmapTemplate.findBySlug(
        "gen-ai-internship",
      );

    if (!template) {
      return NextResponse.json(
        {
          error:
            "Canonical template not found",
        },
        { status: 500 },
      );
    }

    const canonicalDayIds = new Set(
      (template.days || []).map(
        (day) => day.id,
      ),
    );

    const includedDayIds =
      personalization.includedDayIds || [];

    const hasInvalidIncludedDay =
      includedDayIds.some(
        (dayId) =>
          !canonicalDayIds.has(dayId),
      );

    if (hasInvalidIncludedDay) {
      return NextResponse.json(
        {
          error:
            "Premium GenAI personalization is inconsistent with the canonical template",
        },
        { status: 409 },
      );
    }

    const runtimeDays = [];

    const includedSet = new Set(
      personalization.includedDayIds || [],
    );

    const optionalSet = new Set(
      personalization.optionalDayIds || [],
    );

    // Filter and annotate canonical days
    for (const day of template.days) {
      if (includedSet.has(day.id)) {
        const runtimeDay = {
          ...day,
          isOptional:
            optionalSet.has(day.id),
        };

        runtimeDays.push(runtimeDay);
      }
    }

    const derivedTotalLevels =
      runtimeDays.reduce(
        (sum, day) =>
          sum +
          (Array.isArray(day.levels)
            ? day.levels.length
            : 0),
        0,
      );

    if (
      Number(personalization.totalLevels) !==
      derivedTotalLevels
    ) {
      return NextResponse.json(
        {
          error:
            "Premium GenAI personalization level count is inconsistent",
        },
        { status: 409 },
      );
    }

    const runtimeData = {
      ...template,
      id: template.slug,
      days: runtimeDays,
    };

    return NextResponse.json(
      runtimeData,
      { status: 200 },
    );
  } catch (err) {
    console.error(
      "[Runtime Loader] Error",
      err,
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      { status: 500 },
    );
  }
}