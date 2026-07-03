import { UserProfile } from '../../models/v2/user.profile.model';

/**
 * Safely normalizes missing retention fields for legacy user profiles.
 * Preserves existing values and never overwrites true to false.
 */
export async function normalizeUserProfileRetentionFields(userId) {
  if (!userId) return null;

  try {
    const user = await UserProfile.findById(userId).lean();
    if (!user) return null;

    let needsUpdate = false;
    const updateQuery = { $set: {} };

    // If missing or explicitly null, set to false
    if (user.retentionUnsubscribed === undefined || user.retentionUnsubscribed === null) {
      updateQuery.$set.retentionUnsubscribed = false;
      needsUpdate = true;
    }

    // If missing, set to null
    if (user.retentionUnsubscribedAt === undefined) {
      updateQuery.$set.retentionUnsubscribedAt = null;
      needsUpdate = true;
    }

    // If missing, set to null (do not overwrite if null or a date)
    if (user.last_learning_active_on === undefined) {
      updateQuery.$set.last_learning_active_on = null;
      needsUpdate = true;
    }

    if (!needsUpdate) return null;

    const result = await UserProfile.updateOne(
      { _id: userId },
      updateQuery,
      { timestamps: false }
    );

    return result;
  } catch (error) {
    // Log sanitized warning without throwing
    console.error(`[Warning] Failed to normalize retention fields for user ${userId}`);
    return null;
  }
}
