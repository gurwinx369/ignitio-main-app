import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { UserCertificate } from "@/models/v2/user.certificate.model";
import { verifyFirebaseToken } from "@/lib/auth";

// ──────────────────────────────────────────────
// Safe projection — never expose raw _id
// ──────────────────────────────────────────────
const SAFE_FIELDS = {
  _id: 0,
  certificateKey: 1,
  certificateType: 1,
  roadmapFamily: 1,
  roadmapSlug: 1,
  roadmapTitle: 1,
  dayId: 1,
  dayTitle: 1,
  title: 1,
  description: 1,
  imageKey: 1,
  unlockedAtUTC: 1,
  metadata: 1,
};

function toSafeCard(cert) {
  return {
    certificateKey: cert.certificateKey,
    certificateType: cert.certificateType,
    roadmapFamily: cert.roadmapFamily,
    roadmapSlug: cert.roadmapSlug,
    roadmapTitle: cert.roadmapTitle,
    dayId: cert.dayId,
    dayTitle: cert.dayTitle,
    title: cert.title,
    description: cert.description,
    imageKey: cert.imageKey,
    unlockedAt: cert.unlockedAtUTC instanceof Date
      ? cert.unlockedAtUTC.toISOString()
      : cert.unlockedAtUTC || new Date().toISOString(),
    metadata: {
      completedLevelsCount: cert.metadata?.completedLevelsCount ?? 0,
      totalLevelsInDay: cert.metadata?.totalLevelsInDay ?? 0,
    },
  };
}

// ──────────────────────────────────────────────
// Zod schema for a single certificate input
// ──────────────────────────────────────────────
const CertificateInputSchema = z.object({
  certificateKey: z.string().max(120),
  certificateType: z.enum(["day_completion"]).optional().default("day_completion"),
  roadmapFamily: z.string().max(80).optional().default(""),
  roadmapSlug: z.string().max(120),
  roadmapTitle: z.string().max(160).optional().default(""),
  dayId: z.string().max(120),
  dayTitle: z.string().max(160).optional().default(""),
  title: z.string().max(160),
  description: z.string().max(500).optional().default(""),
  imageKey: z.string().max(120).optional().default(""),
  unlockedAt: z.string().optional(),
  metadata: z.object({
    completedLevelsCount: z.number().int().min(0).optional().default(0),
    totalLevelsInDay: z.number().int().min(0).optional().default(0),
  }).optional().default({}),
});

// ──────────────────────────────────────────────
// GET /api/v2/certificates
// ──────────────────────────────────────────────
export async function GET(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid }).select("_id");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const certs = await UserCertificate
      .find({ userId: user._id }, SAFE_FIELDS)
      .sort({ unlockedAtUTC: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      certificates: certs.map(toSafeCard),
    }, { status: 200 });

  } catch (err) {
    console.error("[GET /api/v2/certificates] Error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// POST /api/v2/certificates  (sync bridge)
// ──────────────────────────────────────────────
export async function POST(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid }).select("_id");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Accept single object or array
    const raw = await request.json();
    const rawItems = Array.isArray(raw) ? raw : [raw];

    if (rawItems.length > 50) {
      return NextResponse.json({ message: "Max batch size is 50 certificates" }, { status: 400 });
    }

    // Validate each item with Zod
    const parsed = [];
    for (let i = 0; i < rawItems.length; i++) {
      const result = CertificateInputSchema.safeParse(rawItems[i]);
      if (!result.success) {
        const msg = result.error.errors.map(e => `[${i}] ${e.path.join(".")}: ${e.message}`).join("; ");
        return NextResponse.json({ message: `Validation error: ${msg}` }, { status: 400 });
      }
      parsed.push(result.data);
    }

    // Derive server-side identity — never trust client
    const userId = user._id;
    const firebaseUID = decodedToken.uid;
    const now = new Date();

    // Build bulkWrite ops using upsert with $setOnInsert for immutable fields
    const ops = parsed.map((cert) => {
      let unlockedAtUTC;
      try {
        const parsedDate = cert.unlockedAt ? new Date(cert.unlockedAt) : null;
        unlockedAtUTC = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : now;
      } catch {
        unlockedAtUTC = now;
      }

      return {
        updateOne: {
          filter: {
            userId,
            roadmapSlug: cert.roadmapSlug,
            dayId: cert.dayId,
            certificateType: cert.certificateType || "day_completion",
          },
          update: {
            $setOnInsert: {
              userId,
              firebaseUID,
              certificateKey: cert.certificateKey,
              certificateType: cert.certificateType || "day_completion",
              roadmapFamily: cert.roadmapFamily || "",
              roadmapSlug: cert.roadmapSlug,
              roadmapTitle: cert.roadmapTitle || "",
              dayId: cert.dayId,
              dayTitle: cert.dayTitle || "",
              title: cert.title,
              description: cert.description || "",
              imageKey: cert.imageKey || "",
              unlockedAtUTC,
              metadata: {
                completedLevelsCount: cert.metadata?.completedLevelsCount ?? 0,
                totalLevelsInDay: cert.metadata?.totalLevelsInDay ?? 0,
              },
            },
          },
          upsert: true,
        },
      };
    });

    const result = await UserCertificate.bulkWrite(ops, { ordered: false });
    const insertedCount = result.upsertedCount ?? 0;
    const skippedCount = parsed.length - insertedCount;

    // Return the user's full certificate list after sync
    const certs = await UserCertificate
      .find({ userId }, SAFE_FIELDS)
      .sort({ unlockedAtUTC: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      syncedCount: parsed.length,
      insertedCount,
      skippedCount,
      certificates: certs.map(toSafeCard),
    }, { status: 200 });

  } catch (err) {
    console.error("[POST /api/v2/certificates] Error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}