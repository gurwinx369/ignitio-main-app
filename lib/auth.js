// Shared Firebase ID token verifier for all protected API routes.
// Returns { decodedToken } on success or { error, status } on failure.

import { adminAuth } from "@/lib/firebase/firebase-admin";

export async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or malformed Authorization header", status: 401 };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { decodedToken };
  } catch (err) {
    console.error("[verifyFirebaseToken]", err.code, err.message);
    return {
      error:
        process.env.NODE_ENV === "development"
          ? `Firebase error: ${err.code} — ${err.message}`
          : "Invalid or expired token",
      status: 401,
    };
  }
}
