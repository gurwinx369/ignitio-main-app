/**
 * seed-user-roadmap.mjs
 *
 * Seeds the Gen AI roadmap for a specific Firebase user.
 *
 * Strategy:
 *   1. Use Firebase Admin SDK to mint a custom token for the target UID.
 *   2. Exchange the custom token for an ID token via the Firebase Auth REST API.
 *   3. POST to the running dev server (localhost:5000) with the ID token.
 *
 * This avoids any module-alias issues and uses the real HTTP stack end-to-end.
 *
 * Prerequisites:
 *   - `npm run dev` must be running on port 5000.
 *   - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *     and NEXT_PUBLIC_FIREBASE_API_KEY must be set in .env.
 *
 * Usage:
 *   node scripts/seed-user-roadmap.mjs
 */

import "dotenv/config";
import admin from "firebase-admin";

// ── Config ────────────────────────────────────────────────────────────────────

const FIREBASE_UID  = "i0k4EWsW2ggq8abHNoYyK9mpio13";
const ROADMAP_SLUG  = "gen-ai-internship";
const DEV_BASE_URL  = "http://localhost:5000";

// Firebase Web API key (used to exchange custom token → ID token)
// Matches the apiKey in lib/firebase/firebase.js
const WEB_API_KEY = "AIzaSyDIEt3oa0WdFy5YQyTC-Uf-cgTSHCIGVPc";

// Morning slot: 07:00 – 08:00 IST
const ONBOARDING_BODY = {
  roadmapSlug: ROADMAP_SLUG,
  q1:  "never_touched_llm",
  q2:  "__skipped__",
  q2b: "__skipped__",
  q3:  "__skipped__",
  q3b: "__skipped__",
  q4:  "__skipped__",
  q5:  "__skipped__",
  q6:  "__skipped__",
  q7:  "__skipped__",
  q7b: "__skipped__",
  q8:  "__skipped__",
  q10: "internship_1_3_months",
  schedule: {
    timezone:  "Asia/Kolkata",
    period:    "MORNING",
    startTime: "07:00",
    endTime:   "08:00",
  },
};

// ── Firebase Admin init ───────────────────────────────────────────────────────

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Mint a Firebase custom token for the given UID using the Admin SDK.
 */
async function mintCustomToken(uid) {
  return admin.auth().createCustomToken(uid);
}

/**
 * Exchange a Firebase custom token for a real ID token via the REST API.
 * Uses the signInWithCustomToken endpoint.
 */
async function exchangeCustomTokenForIdToken(customToken) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${WEB_API_KEY}`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ token: customToken, returnSecureToken: true }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Token exchange failed: ${data.error?.message ?? JSON.stringify(data)}`
    );
  }

  return data.idToken;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("Ignitio — Roadmap Seed Script");
  console.log("=".repeat(60));
  console.log(`UID       : ${FIREBASE_UID}`);
  console.log(`Roadmap   : ${ROADMAP_SLUG}`);
  console.log(`Goal      : internship_1_3_months`);
  console.log(`Schedule  : MORNING  07:00–08:00  Asia/Kolkata`);
  console.log(`Server    : ${DEV_BASE_URL}`);
  console.log("=".repeat(60));

  // Step 1: Mint custom token
  console.log("\n[1/3] Minting Firebase custom token...");
  const customToken = await mintCustomToken(FIREBASE_UID);
  console.log("      Done.");

  // Step 2: Exchange for ID token
  console.log("[2/3] Exchanging for Firebase ID token...");
  const idToken = await exchangeCustomTokenForIdToken(customToken);
  console.log("      Done.");

  // Step 3: POST to onboarding endpoint
  console.log("[3/3] Calling POST /api/v2/onboarding...");
  const res = await fetch(`${DEV_BASE_URL}/api/v2/onboarding`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify(ONBOARDING_BODY),
  });

  const data = await res.json();

  console.log("\n── Response ────────────────────────────────────────────");
  console.log(`HTTP status : ${res.status}`);

  if (!res.ok) {
    console.error("ERROR:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log("✓ Onboarding seeded successfully!\n");
  console.log(`  personalizationId : ${data.personalizationId}`);
  console.log(`  roadmapSlug       : ${data.roadmapSlug}`);
  console.log(`  totalLevels       : ${data.totalLevels}`);
  console.log(`  totalLevelsSaved  : ${data.totalLevelsSaved ?? 0}`);
  console.log(`  skippedDays       : [${(data.skippedDays ?? []).join(", ")}]`);
  console.log(`  optionalDays      : ${(data.optionalDays ?? []).length} days`);
  console.log(`  includedDays      : ${(data.includedDays ?? []).length} days`);
  console.log("=".repeat(60));

  process.exit(0);
}

main().catch((err) => {
  console.error("\nUnhandled error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
