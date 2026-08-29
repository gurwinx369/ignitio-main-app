import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import connectToDB from "@/dbConfig/dbConnection";
import { UserLegalConsent } from "@/models/v2/user.legal-consent.model";

const CURRENT_TERMS_VERSION = "2026-07-07";
const CURRENT_PRIVACY_VERSION = "2026-07-07";

const REQUIRED_VERSIONS = {
  termsVersion: CURRENT_TERMS_VERSION,
  privacyVersion: CURRENT_PRIVACY_VERSION,
};

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { decodedToken, status, error } = await verifyFirebaseToken(request);
    
    if (error) {
      return NextResponse.json(
        { ok: false, error },
        {
          status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    await connectToDB();

    const consent = await UserLegalConsent.findOne({
      firebaseUID: decodedToken.uid,
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
      acceptedTerms: true,
      acceptedPrivacy: true,
    }).lean();

    if (consent) {
      return NextResponse.json(
        {
          ok: true,
          accepted: true,
          requiredVersions: REQUIRED_VERSIONS,
          consent: {
            termsVersion: consent.termsVersion,
            privacyVersion: consent.privacyVersion,
            acceptedAtUTC: consent.acceptedAtUTC,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        accepted: false,
        requiredVersions: REQUIRED_VERSIONS,
        consent: null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/v2/legal-consent]", error.name);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request) {
  try {
    const { decodedToken, status, error } = await verifyFirebaseToken(request);

    if (error) {
      return NextResponse.json({ ok: false, error }, { status });
    }

    await connectToDB();

    const query = {
      firebaseUID: decodedToken.uid,
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
    };

    let consent;
    
    try {
      consent = await UserLegalConsent.findOneAndUpdate(
        query,
        {
          $setOnInsert: {
            acceptedTerms: true,
            acceptedPrivacy: true,
            acceptedAtUTC: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      ).lean();
    } catch (dbError) {
      // Handle E11000 duplicate key race
      if (dbError.code === 11000) {
        consent = await UserLegalConsent.findOne(query).lean();
        
        if (!consent) {
          throw new Error("Failed to resolve E11000 race");
        }
      } else {
        throw dbError;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        accepted: true,
        consent: {
          termsVersion: consent.termsVersion,
          privacyVersion: consent.privacyVersion,
          acceptedAtUTC: consent.acceptedAtUTC,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/v2/legal-consent]", error.name);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
