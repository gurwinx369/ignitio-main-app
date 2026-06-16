import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { adminAuth } from "@/lib/firebase/firebase-admin";

// SECTION 1: ZOD VALIDATORS
// Mirrors the schema exactly.
// Zod runs before a single DB call is made.
// If the shape is wrong, we reject immediately.

// Old Zod validators commented out.
const CreateUserValidator = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  role: z.enum(["student", "writer", "designer", "developer", "other"]),
});

// SECTION 2: TOKEN VERIFICATION HELPER
// Extracts and verifies the Firebase ID token
// from the Authorization header.
// Returns the decoded token (contains uid, email).
// Never trust firebaseUID from the request body.

async function verifyFirebaseToken(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing or malformed Authorization header", status: 401 };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { decodedToken };
  } catch (err) {
    // Don't expose the raw Firebase error — it leaks internals
    //  return { error: "Invalid or expired token", status: 401 };
    console.error("[Firebase verify error]", err.code, err.message);
    return {
      error:
        process.env.NODE_ENV === "development"
          ? `Firebase error: ${err.code} — ${err.message}`
          : "Invalid or expired token",
      status: 401,
    };
  }
}

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

  const { email, role } = validation.data;

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
        existingProfile.firebaseUID = decodedToken.uid;
        await existingProfile.save();
      }
    }

    if (existingProfile) {
      return NextResponse.json(
        {
          message: "User profile found",
          user: {
            id: existingProfile._id,
            email: existingProfile.email,
            onboardingComplete: existingProfile.onboardingComplete,
            createdAt: existingProfile.createdAt,
          },
          existing: true,
        },
        { status: 200 },
      );
    }

    // Step 5: Atomic create
    const userProfile = await UserProfile.create({
      firebaseUID: decodedToken.uid, // from verified token, never from body
      email: tokenEmail,
      role,
      onboardingComplete: true,
      completedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "User profile created",
        user: {
          id: userProfile._id,
          email: userProfile.email,
          onboardingComplete: userProfile.onboardingComplete,
          createdAt: userProfile.createdAt,
        },
        existing: false,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err.code === 11000) {
      // Race condition fallback
      const duplicateProfile = await UserProfile.findOne({ email: tokenEmail });
      if (duplicateProfile) {
        if (duplicateProfile.firebaseUID !== decodedToken.uid) {
          duplicateProfile.firebaseUID = decodedToken.uid;
          await duplicateProfile.save();
        }
        return NextResponse.json(
          {
            message: "User profile found",
            user: {
              id: duplicateProfile._id,
              email: duplicateProfile.email,
              onboardingComplete: duplicateProfile.onboardingComplete,
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
      const profileToHeal = await UserProfile.findOne({ email: tokenEmail }).select("-__v");
      
      if (profileToHeal) {
        profileToHeal.firebaseUID = decodedToken.uid;
        await profileToHeal.save();
        
        userProfile = profileToHeal.toObject();
      }
    }

    if (!userProfile) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "User profile found", user: userProfile },
      { status: 200 },
    );
  } catch (err) {
    console.error("[GET /api/v2/user] DB error:", err.name);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
