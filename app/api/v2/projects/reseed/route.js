import { NextResponse } from "next/server";
import { projectRepository } from "@/features/projects/repositories/ProjectRepository";

/**
 * POST /api/v2/projects/reseed
 * Dev-only: force re-seeds all project documents, overwriting stale/incomplete records.
 * Blocked in production.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    await projectRepository.forceReseed();
    return NextResponse.json({
      ok: true,
      message: "Projects re-seeded successfully. Starter files and test cases are refreshed.",
    });
  } catch (err) {
    console.error("[Reseed] Error:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
