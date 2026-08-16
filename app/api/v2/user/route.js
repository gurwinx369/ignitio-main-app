import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile, ONBOARDING_VERSIONS } from "@/models/v2/user.profile.model";
import { normalizeUserProfileRetentionFields } from "@/lib/users/profileMigration.helpers";
import { getLocalDateString } from "@/lib/users/streak.service";
import { verifyFirebaseToken } from "@/lib/auth";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-route";

// SECTION 1: ZOD VALIDATORS
// Mirrors the schema exactly.
// Zod runs before a single DB call is made.
// If the shape is wrong, we reject immediately.

// Accept role optionally for forward-compat; provisioning ignores it.
// Role is set exclusively by the dedicated role-selection step.
const CreateUserValidator = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  role: z.enum(["student", "writer", "designer", "developer", "other"]).optional().nullable(),
});

// SECTION 2: TOKEN VERIFICATION HELPER
// Extracts and verifies the Firebase ID token
// from the Authorization header.
// Returns the decoded token (contains uid, email).
// Never trust firebaseUID from the request body.


// SECTION 3: POST — Create User Profile
// Flow: verify token → validate body →
//       check email matches token →
//       atomic create → return safe response

export async function POST(request) {
  await connectToDB();

  // Step 1: Verify Firebase token first — before touching the body.
  // If auth fails, don't even parse the request.
  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  const tokenEmail =
    typeof decodedToken.email === "string"
      ? decodedToken.email.toLowerCase().trim()
      : "";

  // Step 2: Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const validation = CreateUserValidator.safeParse(body);

  if (!validation.success) {
    // Return the first validation error, formatted cleanly.
    // Don't expose Zod's full error tree — it's noisy.
    const issues = validation.error.issues || validation.error.errors || [];
    const firstError = issues[0];
    return NextResponse.json(
      {
        message: "Validation failed",
        field: firstError?.path ? firstError.path.join(".") : "",
        detail: firstError?.message || "Validation failed",
      },
      { status: 422 }, // unprocessable content error code
    );
  }

  const { email } = validation.data;

  // Step 3: Verify the email in the body matches the token.
  // Prevents a logged-in user from creating a profile under
  // a different email by tampering with the request body.
  if (!tokenEmail || tokenEmail !== email) {
    return NextResponse.json(
      { message: "Email does not match authenticated user" },
      { status: 403 },
    );
  }

  // Step 4: Make POST idempotent — ensure profile exists
  try {
    let existingProfile = await UserProfile.findOne({ firebaseUID: decodedToken.uid });

    if (!existingProfile) {
      existingProfile = await UserProfile.findOne({ email: tokenEmail });
      if (existingProfile && existingProfile.firebaseUID !== decodedToken.uid) {
        // Use updateOne to avoid full-document validation on legacy profiles
        await UserProfile.updateOne(
          { _id: existingProfile._id },
          { $set: { firebaseUID: decodedToken.uid } },
          { timestamps: false }
        );
        existingProfile.firebaseUID = decodedToken.uid;
      }
    }

    if (existingProfile) {
      await normalizeUserProfileRetentionFields(existingProfile._id);
      return NextResponse.json(
        {
          message: "User profile found",
          user: {
            id: existingProfile._id,
            email: existingProfile.email,
            role: existingProfile.role,
            onboardingComplete: existingProfile.onboardingComplete,
            onboardingVersion: existingProfile.onboardingVersion,
            onboardingState: existingProfile.onboardingState,
            createdAt: existingProfile.createdAt,
          },
          existing: true,
        },
        { status: 200 },
      );
    }

    // Step 5: Atomic create
    const now = new Date();
    const todayLocal = getLocalDateString(now, "Asia/Kolkata");

    const userProfile = await UserProfile.create({
      firebaseUID: decodedToken.uid, // from verified token, never from body
      email: tokenEmail,
      // role is intentionally omitted — schema defaults to "other".
      // The dedicated role-selection step overwrites this later.
      onboardingComplete: false,
      onboardingVersion: ONBOARDING_VERSIONS.V4,
      onboardingState: {
        step: "diagnostic",
      },
      streak: {
        timezone: "Asia/Kolkata",
        onboardingStartDate: todayLocal,
      }
    });

    return NextResponse.json(
      {
        message: "User profile created",
        user: {
          id: userProfile._id,
          email: userProfile.email,
          role: userProfile.role,
          onboardingComplete: userProfile.onboardingComplete,
          onboardingVersion: userProfile.onboardingVersion,
          onboardingState: userProfile.onboardingState,
          createdAt: userProfile.createdAt,
        },
        existing: false,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err.code === 11000) {
      // Race condition fallback
      const duplicateProfile = await UserProfile.findOne({ email: tokenEmail }).lean();
      if (duplicateProfile) {
        if (duplicateProfile.firebaseUID !== decodedToken.uid) {
          // Use updateOne to avoid full-document validation on legacy profiles
          await UserProfile.updateOne(
            { _id: duplicateProfile._id },
            { $set: { firebaseUID: decodedToken.uid } },
            { timestamps: false }
          );
        }
        await normalizeUserProfileRetentionFields(duplicateProfile._id);
        return NextResponse.json(
          {
            message: "User profile found",
            user: {
              id: duplicateProfile._id,
              email: duplicateProfile.email,
              role: duplicateProfile.role,
              onboardingComplete: duplicateProfile.onboardingComplete,
              onboardingVersion: duplicateProfile.onboardingVersion,
              onboardingState: duplicateProfile.onboardingState,
              createdAt: duplicateProfile.createdAt,
            },
            existing: true,
          },
          { status: 200 },
        );
      }
    }

    // Unknown DB error — log internally, return generic message.
    // Never send err.message to the client — it can expose
    // schema structure, query details, or connection strings.
    console.error("[POST /api/v2/user] DB error:", err.name);
    console.error("[POST /api/v2/user] DB error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper to strip internal fields from the user document
function toSafeUser(profile, requiresOnboarding = false) {
  return {
    id: profile._id?.toString(),
    firebaseUID: profile.firebaseUID,
    email: profile.email,
    role: profile.role,
    onboardingComplete: Boolean(profile.onboardingComplete),
    requiresOnboarding,
    createdAt: profile.createdAt,
    completedAt: profile.completedAt,
    onboardingVersion: profile.onboardingVersion ?? "v2",
    onboardingState: profile.onboardingState ?? null,
    goal: profile.goal ?? "not_set",
    schedulePreference: profile.schedulePreference ?? {
      timezone: "Asia/Kolkata",
      windows: [],
      isDefault: true,
    },
    dailyTimeBudgetMinutes: profile.dailyTimeBudgetMinutes ?? null,
  };
}

// SECTION 4: GET — Fetch User Profile
// A user can only fetch their own profile.
// The UID from the token is the lookup key

export async function GET(request) {
  await connectToDB();

  const {
    decodedToken,
    error: authError,
    status: authStatus,
  } = await verifyFirebaseToken(request);

  if (authError) {
    return NextResponse.json({ message: authError }, { status: authStatus });
  }

  const tokenEmail =
    typeof decodedToken.email === "string"
      ? decodedToken.email.toLowerCase().trim()
      : "";

  try {
    let userProfile = await UserProfile.findOne({
      firebaseUID: decodedToken.uid,
    })
      .select("-__v") // strip Mongoose version key
      .lean(); // return plain JS object, not Mongoose doc

    if (!userProfile && tokenEmail) {
      // Fallback: search by email to heal stale firebaseUID
      // Use updateOne to avoid full-document validation on legacy profiles
      const profileToHeal = await UserProfile.findOne({ email: tokenEmail })
        .select("-__v")
        .lean();

      if (profileToHeal) {
        await UserProfile.updateOne(
          { _id: profileToHeal._id },
          { $set: { firebaseUID: decodedToken.uid } },
          { timestamps: false }
        );
        // Re-query lean with healed firebaseUID
        userProfile = await UserProfile.findById(profileToHeal._id)
          .select("-__v")
          .lean();
      }
    }

    if (!userProfile) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 },
      );
    }

    await normalizeUserProfileRetentionFields(userProfile._id);

    const requiresOnboarding = !isOnboardingComplete(userProfile);

    return NextResponse.json(
      { message: "User profile found", user: toSafeUser(userProfile, requiresOnboarding) },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/v2/user] DB error:", err.name);

    // Log detailed Mongoose ValidationError fields for diagnostics.
    // Never log tokens, Authorization header, or decoded Firebase token.
    if (err.name === "ValidationError") {
      console.error("[GET /api/v2/user] ValidationError message:", err.message);
      const failingFields = Object.keys(err.errors || {});
      console.error("[GET /api/v2/user] Failing fields:", failingFields);
      for (const key of failingFields) {
        const fieldErr = err.errors[key];
        console.error(`[GET /api/v2/user] Field "${key}":`, {
          path: fieldErr.path,
          kind: fieldErr.kind,
          value: fieldErr.value,
          message: fieldErr.message,
        });
      }
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
