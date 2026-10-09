import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { FreePathResult } from "@/models/v2/freepathresult.model";
import { verifyFirebaseToken } from "@/lib/auth";

const DiagnosticResultValidator = z.object({
  skillId: z.string(),
  verdict: z.enum(["pass", "fail", "skip", "unknown"]),
  include: z.boolean(),
});

const FreePathResultValidator = z.object({
  year: z.string(),
  pathTaken: z.enum(["A", "B", "C"]),
  roadmap: z.array(z.string()),
  diagnosticResults: z.array(DiagnosticResultValidator).optional().default([]),
  notificationAllowed: z.boolean().optional().default(false),
  completedAt: z.string().datetime().optional(),
});

export async function POST(request) {
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

  const validation = FreePathResultValidator.safeParse(body);

  if (!validation.success) {
    const issues = validation.error.issues || validation.error.errors || [];
    const firstError = issues[0];
    return NextResponse.json(
      {
        message: "Validation failed",
        field: firstError?.path ? firstError.path.join(".") : "",
        detail: firstError?.message || "Validation failed",
      },
      { status: 422 },
    );
  }

  const {
    year,
    pathTaken,
    roadmap,
    diagnosticResults,
    notificationAllowed,
    completedAt
  } = validation.data;

  try {
    const result = await FreePathResult.findOneAndUpdate(
      { firebaseUID: decodedToken.uid },
      {
        $set: {
          year,
          pathTaken,
          roadmap,
          diagnosticResults,
          notificationAllowed,
          completedAt: completedAt ? new Date(completedAt) : new Date(),
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    ).lean();

    return NextResponse.json(
      { message: "Free-path result saved successfully", result },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/v2/onboarding/free-path] DB error:", err.name);
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
