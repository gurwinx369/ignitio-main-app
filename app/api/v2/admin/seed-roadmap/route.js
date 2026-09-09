// Admin seed endpoint — POST /api/v2/admin/seed-roadmap
//
// Purpose: upsert any roadmap template from static data files.
// Protected by Firebase token + admin UID allowlist (env var).
// Idempotent — safe to call repeatedly.
//
// To add a new roadmap:
//   1. Create the data file (e.g. data/dsa/dsaRoadmapData.js)
//   2. Add it to the ROADMAP_REGISTRY below
//   3. POST /api/v2/admin/seed-roadmap with { slug: "dsa-internship" }

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import {
  RoadmapTemplate,
  ROADMAP_GOAL,
} from "@/models/v2/roadmap.templates.model";
import { genAiRoadmapData } from "@/data/genAi/genAiRoadmapData";

// ─── Registry ────────────────────────────────────────────────────────────────
// Add new roadmaps here. Never call upsertFromStaticData directly from a route.

const ROADMAP_REGISTRY = {
  "gen-ai-internship": {
    data: genAiRoadmapData,
    goal: ROADMAP_GOAL.LAND_INTERNSHIP,
  },
  // "dsa-internship": { data: dsaRoadmapData, goal: ROADMAP_GOAL.LAND_INTERNSHIP },
};

// ─── Admin UID allowlist ──────────────────────────────────────────────────────
// Set ADMIN_FIREBASE_UIDS in .env as a comma-separated list.
// Only these UIDs can call this endpoint.

function getAdminUids() {
  const raw = process.env.ADMIN_FIREBASE_UIDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean),
  );
}

// ─── Zod schema ───────────────────────────────────────────────────────────────

const SeedBodySchema = z.object({
  slug: z.string().min(1),
});

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  // Step 1: Auth
  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  // Step 2: Admin check
  const adminUids = getAdminUids();
  if (adminUids.size > 0 && !adminUids.has(decodedToken.uid)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Step 3: Parse body
  let rawBody;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const validation = SeedBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Missing required field: slug" },
      { status: 422 },
    );
  }

  const { slug } = validation.data;

  // Step 4: Resolve registry entry
  const entry = ROADMAP_REGISTRY[slug];
  if (!entry) {
    return NextResponse.json(
      {
        message: `Slug '${slug}' is not registered. Add it to the ROADMAP_REGISTRY in the seed endpoint.`,
        availableSlugs: Object.keys(ROADMAP_REGISTRY),
      },
      { status: 404 },
    );
  }

  // Step 5: Upsert
  try {
    await connectToDB();
    const doc = await RoadmapTemplate.upsertFromStaticData(
      entry.data,
      entry.goal,
    );
    return NextResponse.json(
      {
        success: true,
        message: `Roadmap '${slug}' seeded successfully`,
        totalDays: doc.days?.length ?? 0,
        totalLevels: doc.totalLevels ?? 0,
        updatedAt: doc.updatedAt,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(
      "[POST /api/v2/admin/seed-roadmap] Error:",
      err.name,
      err.message,
    );
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
