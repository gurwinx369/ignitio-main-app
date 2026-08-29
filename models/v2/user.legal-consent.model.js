import mongoose from "mongoose";

const UserLegalConsentSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      trim: true,
    },
    acceptedTerms: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "acceptedTerms must be true for a legal consent record",
      },
    },
    acceptedPrivacy: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "acceptedPrivacy must be true for a legal consent record",
      },
    },
    termsVersion: {
      type: String,
      required: true,
      trim: true,
    },
    privacyVersion: {
      type: String,
      required: true,
      trim: true,
    },
    acceptedAtUTC: {
      type: Date,
      required: true,
    },
  },
  { timestamps: false }
);

// Compound unique index for idempotent acceptance per version combination
UserLegalConsentSchema.index(
  { firebaseUID: 1, termsVersion: 1, privacyVersion: 1 },
  { unique: true, name: "uid_terms_privacy_unique" }
);

export const UserLegalConsent =
  mongoose.models.UserLegalConsent ||
  mongoose.model("UserLegalConsent", UserLegalConsentSchema);
