import { NextResponse } from "next/server";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";
import { verifyFirebaseToken } from "@/lib/auth";
import { useFreezeToRecoverStreak } from "@/lib/users/streak.service";

export async function POST(request) {
  await connectToDB();

  const { decodedToken, error, status } = await verifyFirebaseToken(request);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const user = await UserProfile.findOne({ firebaseUID: decodedToken.uid });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const result = await useFreezeToRecoverStreak({ userProfile: user });
    if (!result.success) {
      return NextResponse.json(
        { message: result.message, streak: result.streak },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, message: result.message, streak: result.streak },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/v2/streak/freeze/use] Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
