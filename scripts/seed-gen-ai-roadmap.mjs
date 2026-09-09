/**
 * seed-gen-ai-roadmap.mjs
 *
 * Manually seeds the Gen AI roadmap template through the existing
 * admin API endpoint.
 *
 * Prerequisites:
 *   - npm run dev must be running on port 5000
 *   - FIREBASE_PROJECT_ID must be set in .env
 *   - FIREBASE_CLIENT_EMAIL must be set in .env
 *   - FIREBASE_PRIVATE_KEY must be set in .env
 *   - NEXT_PUBLIC_FIREBASE_API_KEY must be set in .env
 *   - FIREBASE_UID must be an authorized admin UID
 *
 * Usage:
 *   node scripts/seed-gen-ai-roadmap.mjs
 */

import "dotenv/config";
import admin from "firebase-admin";

// ── Config ────────────────────────────────────────────────────────────────────

const FIREBASE_UID = "i0k4EWsW2ggq8abHNoYyK9mpio13";
const ROADMAP_SLUG = "gen-ai-internship";
const DEV_BASE_URL = "https://app.ignitio.cloud";

const WEB_API_KEY = "AIzaSyDIEt3oa0WdFy5YQyTC-Uf-cgTSHCIGVPc";

// ── Validation ────────────────────────────────────────────────────────────────

const requiredEnv = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

// ── Firebase Admin init ───────────────────────────────────────────────────────

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function mintCustomToken(uid) {
    return admin.auth().createCustomToken(uid);
}

async function exchangeCustomTokenForIdToken(customToken) {
    const url =
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken` +
        `?key=${WEB_API_KEY}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            `Firebase token exchange failed: ${data.error?.message ?? JSON.stringify(data)
            }`
        );
    }

    return data.idToken;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log("=".repeat(60));
    console.log("Ignitio — Gen AI Roadmap Template Seeder");
    console.log("=".repeat(60));
    console.log(`UID       : ${FIREBASE_UID}`);
    console.log(`Roadmap   : ${ROADMAP_SLUG}`);
    console.log(`Server    : ${DEV_BASE_URL}`);
    console.log("=".repeat(60));

    // Step 1
    console.log("\n[1/3] Minting Firebase custom token...");
    const customToken = await mintCustomToken(FIREBASE_UID);
    console.log("      Done.");

    // Step 2
    console.log("[2/3] Exchanging for Firebase ID token...");
    const idToken = await exchangeCustomTokenForIdToken(customToken);
    console.log("      Done.");

    // Step 3
    console.log("[3/3] Calling POST /api/v2/admin/seed-roadmap...");

    const res = await fetch(`${DEV_BASE_URL}/api/v2/admin/seed-roadmap`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            slug: ROADMAP_SLUG,
        }),
    });

    const data = await res.json();

    console.log("\n── Response ────────────────────────────────────────────");
    console.log(`HTTP status : ${res.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (!res.ok) {
        throw new Error(
            `Roadmap seed failed with HTTP ${res.status}`
        );
    }

    console.log("\n✓ Gen AI roadmap template seeded successfully!");
    console.log("=".repeat(60));
}

main().catch((err) => {
    console.error("\n✗ Seed failed:");
    console.error(err.message);
    process.exit(1);
});