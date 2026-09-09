import mongoose, {
    Schema,
} from "mongoose";

export const STREAK_DAY_STATUS = {
    COMPLETED: "completed",
    FREEZE_USED: "freeze_used",
    GRACE_USED: "grace_used",
    EARNBACK_RECOVERED:
        "earnback_recovered",
    MISSED: "missed",
};

export const STREAK_DAY_PROTECTION = {
    FREEZE: "freeze",
    GRACE: "grace",
    EARNBACK: "earnback",
};

const StreakDaySchema =
    new Schema(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "UserProfile",
                required: true,
                index: true,
            },

            firebaseUID: {
                type: String,
                required: true,
                trim: true,
                index: true,
            },

            /*
             * Calendar date in the streak timezone
             * that was authoritative when this
             * historical day was recorded.
             *
             * Format: YYYY-MM-DD
             */
            dateLocal: {
                type: String,
                required: true,
                trim: true,
            },

            /*
             * Snapshot the timezone rather than
             * deriving historical dates from the
             * user's current timezone later.
             */
            timezone: {
                type: String,
                required: true,
                trim: true,
            },

            status: {
                type: String,
                enum: Object.values(
                    STREAK_DAY_STATUS,
                ),
                required: true,
            },

            /*
             * Number of genuine unique level
             * completions recorded for this
             * calendar day.
             *
             * Protected/missed days normally have 0.
             */
            completedLevelsCount: {
                type: Number,
                default: 0,
                min: 0,
            },

            protectedBy: {
                type: String,
                enum: [
                    null,
                    ...Object.values(
                        STREAK_DAY_PROTECTION,
                    ),
                ],
                default: null,
            },
        },
        {
            timestamps: true,
        },
    );

/*
 * Exactly one permanent ledger row per
 * user per local streak date.
 */
StreakDaySchema.index(
    {
        userId: 1,
        dateLocal: 1,
    },
    {
        unique: true,
        name:
            "streak_day_user_date_unique",
    },
);

/*
 * Primary authenticated month-history query.
 */
StreakDaySchema.index(
    {
        firebaseUID: 1,
        dateLocal: 1,
    },
    {
        name:
            "streak_day_firebase_date",
    },
);

export const StreakDay =
    mongoose.models.StreakDay ||
    mongoose.model(
        "StreakDay",
        StreakDaySchema,
    );