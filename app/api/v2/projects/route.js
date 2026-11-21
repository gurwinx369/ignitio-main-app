import { verifyFirebaseToken } from "@/lib/auth";
import { projectController } from "@/features/projects/controllers/ProjectController";

/**
 * GET /api/v2/projects
 * Lists all published projects matching track/tier filters, with progress if authenticated
 */
export async function GET(request) {
  const { decodedToken } = await verifyFirebaseToken(request);
  const firebaseUID = decodedToken?.uid || undefined;
  return projectController.listProjects(request, firebaseUID);
}
