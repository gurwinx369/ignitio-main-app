import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { projectController } from "@/features/projects/controllers/ProjectController";

/**
 * GET /api/v2/projects/:slug
 * Retrieves workspace definition and saved working files for a project
 */
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing project slug" }, { status: 400 });
  }

  const { decodedToken } = await verifyFirebaseToken(request);
  const firebaseUID = decodedToken?.uid || undefined;

  return projectController.getWorkspace(slug, firebaseUID);
}
