import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { projectController } from "@/features/projects/controllers/ProjectController";
import { spamRateLimiter, enforceRateLimit, getClientIp } from "@/lib/security/rateLimiter";

/**
 * POST /api/v2/projects/:slug/execute
 * Executes user code in sandbox against milestone test cases
 */
export async function POST(request, { params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing project slug" }, { status: 400 });
  }

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error || !decodedToken?.uid) {
    return NextResponse.json({ ok: false, error: error || "Authentication required" }, { status: status || 401 });
  }

  // Rate limit: 15 runs per minute per user
  const rateLimitKey = `project_run:${decodedToken.uid}`;
  const rateLimitError = await enforceRateLimit(spamRateLimiter, rateLimitKey);
  if (rateLimitError) {
    return rateLimitError;
  }

  return projectController.executeCode(request, slug, decodedToken.uid);
}
