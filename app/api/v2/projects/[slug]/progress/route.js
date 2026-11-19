import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { projectController } from "@/features/projects/controllers/ProjectController";

/**
 * PATCH /api/v2/projects/:slug/progress
 * Debounced sync of working files into the Projects MongoDB cluster
 */
export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing project slug" }, { status: 400 });
  }

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error || !decodedToken?.uid) {
    return NextResponse.json({ ok: false, error: error || "Authentication required" }, { status: status || 401 });
  }

  return projectController.syncProgress(request, slug, decodedToken.uid);
}
