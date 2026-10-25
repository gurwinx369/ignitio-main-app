import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile, ONBOARDING_VERSIONS, USER_ROLES, USER_GOALS } from "@/models/v2/user.profile.model";
import { FreePathResult } from "@/models/v2/freepathresult.model";
import { UserLegalConsent } from "@/models/v2/user.legal-consent.model";
import { verifyFirebaseToken } from "@/lib/auth";
import { activateRoadmap } from "@/lib/onboarding/activation.service";
import { getOnboardingRoute } from "@/lib/onboarding/onboarding-route";

const CURRENT_TERMS_VERSION = "2026-07-07";
const CURRENT_PRIVACY_VERSION = "2026-07-07";

const TimeWindowSchema = z.object({
  period: z.enum(["MORNING", "NOON", "EVENING", "NIGHT"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be HH:MM"),
});

const ScheduleSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  windows: z.array(TimeWindowSchema).min(1, "At least one window is required"),
});

const FreePathSchema = z.object({
  year: z.string().optional(),
  pathTaken: z.enum(["A", "B", "C"]).optional(),
  roadmap: z.array(z.string()).optional(),
  diagnosticResults: z.array(z.any()).optional().default([]),
  notificationAllowed: z.boolean().optional().default(false),
}).optional().nullable();

const BootstrapValidator = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  goal: z.string().optional().nullable(),
  freePath: FreePathSchema,
  schedule: ScheduleSchema.optional().nullable(),
  role: z.enum(Object.values(USER_ROLES)).optional().default("developer"),
  activeRoadmapSlug: z.string().optional(),
  initializeLegalConsent: z.boolean().optional().default(true),
});

export async function POST(request) {
  await connectToDB();

  // 1. Verify token
  const { decodedToken, error: authError, status: authStatus } = await verifyFirebaseToken(request);
  if (authError || !decodedToken) {
    return NextResponse.json({ message: authError || "Unauthorized" }, { status: authStatus || 401 });
  }

  const tokenEmail = decodedToken.email?.toLowerCase().trim();

  // 2. Parse & Validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
  }

  const validation = BootstrapValidator.safeParse(body);
  if (!validation.success) {
    const issues = validation.error.issues || validation.error.errors || [];
    const firstError = issues[0];
    return NextResponse.json(
      {
        message: "Validation failed",
        field: firstError?.path ? firstError.path.join(".") : "",
        detail: firstError?.message || "Validation failed",
      },
      { status: 422 }
    );
  }

  const { email, goal, freePath, schedule, role, activeRoadmapSlug, initializeLegalConsent } = validation.data;
  const isDsa = activeRoadmapSlug === "dsa" || (Array.isArray(freePath?.roadmap) && freePath.roadmap.includes("dsa") && !freePath.roadmap.includes("python"));

  // 3. Security check: Token email must match payload email
  if (!tokenEmail || tokenEmail !== email) {
    return NextResponse.json({ message: "Email does not match authenticated token" }, { status: 403 });
  }

  try {
    // 4. Idempotent check for existing user
    let existingProfile = await UserProfile.findOne({ firebaseUID: decodedToken.uid });

    if (!existingProfile) {
      existingProfile = await UserProfile.findOne({ email: tokenEmail });
      if (existingProfile && existingProfile.firebaseUID !== decodedToken.uid) {
        await UserProfile.updateOne(
          { _id: existingProfile._id },
          { $set: { firebaseUID: decodedToken.uid } },
          { timestamps: false }
        );
        existingProfile.firebaseUID = decodedToken.uid;
      }
    }

    // SCENARIO: Account already exists
    if (existingProfile) {
      if (initializeLegalConsent) {
        try {
          await UserLegalConsent.findOneAndUpdate(
            {
              firebaseUID: decodedToken.uid,
              termsVersion: CURRENT_TERMS_VERSION,
              privacyVersion: CURRENT_PRIVACY_VERSION,
            },
            {
              $setOnInsert: {
                acceptedTerms: true,
                acceptedPrivacy: true,
                acceptedAtUTC: new Date(),
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch {}
      }

      // If user has already completed onboarding, do NOT overwrite or re-activate
      if (existingProfile.onboardingComplete === true) {
        return NextResponse.json(
          {
            success: true,
            existing: true,
            user: {
              id: existingProfile._id,
              email: existingProfile.email,
              role: existingProfile.role,
              onboardingComplete: true,
            },
            redirectTo: "/home",
          },
          { status: 200 }
        );
      }

      // If existing user is partially onboarded, update schedule/role if provided and activate
      if (schedule) {
        await UserProfile.updateOne(
          { _id: existingProfile._id },
          {
            $set: {
              schedulePreference: schedule,
              role: role || existingProfile.role || "developer",
              ...(goal ? { goal } : {}),
              ...(isDsa ? { activeRoadmapSlug: "dsa", roadmap_name: "dsa" } : {}),
            },
          }
        );
      }

      const activationResult = await activateRoadmap(decodedToken.uid);
      const targetRoute = activationResult.success ? "/home" : getOnboardingRoute(existingProfile);

      return NextResponse.json(
        {
          success: true,
          existing: true,
          user: {
            id: existingProfile._id,
            email: existingProfile.email,
          },
          redirectTo: targetRoute,
        },
        { status: 200 }
      );
    }

    // SCENARIO: Brand New User Signup
    const defaultSchedule = {
      timezone: schedule?.timezone || "UTC",
      windows: schedule?.windows || [
        {
          period: "MORNING",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
      isDefault: !schedule,
    };

    const ALLOWED_GOALS = new Set(Object.values(USER_GOALS));
    const safeGoal = goal && ALLOWED_GOALS.has(goal) ? goal : USER_GOALS.CURIOSITY_GENERAL;

    const initialActiveRoadmapSlug = isDsa ? "dsa" : (activeRoadmapSlug || "python-beginner");

    const newProfile = await UserProfile.create({
      firebaseUID: decodedToken.uid,
      email: tokenEmail,
      role: role || "developer",
      goal: safeGoal,
      activeRoadmapSlug: initialActiveRoadmapSlug,
      roadmap_name: initialActiveRoadmapSlug,
      onboardingComplete: false,
      onboardingVersion: ONBOARDING_VERSIONS.V5,
      onboardingState: {
        step: "activation_pending",
      },
      schedulePreference: defaultSchedule,
    });

    // Save free-path results if user completed free-path onboarding prior to signup
    if (freePath?.year && freePath?.pathTaken) {
      try {
        const sanitizedDiagnostic = Array.isArray(freePath.diagnosticResults)
          ? freePath.diagnosticResults.filter(
              (d) =>
                d &&
                typeof d.skillId === "string" &&
                ["mastery", "developing", "gap", "insufficient"].includes(d.verdict)
            )
          : [];

        await FreePathResult.findOneAndUpdate(
          { firebaseUID: decodedToken.uid },
          {
            $set: {
              year: String(freePath.year),
              pathTaken: freePath.pathTaken,
              roadmap: isDsa ? ["dsa"] : (Array.isArray(freePath.roadmap) ? freePath.roadmap : []),
              diagnosticResults: sanitizedDiagnostic,
              notificationAllowed: Boolean(freePath.notificationAllowed),
              completedAt: new Date(),
            },
          },
          { upsert: true, new: true, runValidators: true }
        );
      } catch (fpErr) {
        console.warn("[bootstrap] FreePathResult save warning:", fpErr.message);
      }
    }

    // Ingest legal consent
    if (initializeLegalConsent) {
      try {
        await UserLegalConsent.findOneAndUpdate(
          {
            firebaseUID: decodedToken.uid,
            termsVersion: CURRENT_TERMS_VERSION,
            privacyVersion: CURRENT_PRIVACY_VERSION,
          },
          {
            $setOnInsert: {
              acceptedTerms: true,
              acceptedPrivacy: true,
              acceptedAtUTC: new Date(),
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (consentErr) {
        console.warn("[bootstrap] Legal consent save warning:", consentErr.message);
      }
    }

    // Execute atomic roadmap & streak activation
    const activationResult = await activateRoadmap(decodedToken.uid);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newProfile._id,
          email: newProfile.email,
          role: newProfile.role,
        },
        nextStep: activationResult.nextStep || "completed",
        redirectTo: "/home",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/v2/onboarding/bootstrap] Server Error:", err);
    return NextResponse.json(
      { message: "Failed to initialize learner account" },
      { status: 500 }
    );
  }
}
