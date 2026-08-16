/**
 * Resolves levels based on the canonical template and active personalization.
 * Returns an array of level IDs that are currently active and required.
 */
export function deriveGenAiActiveLevelIds(template, personalization) {
  if (!template || !personalization) return [];
  
  const activeDayIds = new Set(personalization.includedDayIds || []);
  const activeLevelIds = [];

  for (const day of (template.days || [])) {
    if (activeDayIds.has(day.id)) {
      for (const lvl of (day.levels || [])) {
        activeLevelIds.push(lvl.id);
      }
    }
  }

  return activeLevelIds;
}

/**
 * Normalizes completed levels by merging monotonically and validating against active levels.
 * Hidden historical levels are preserved.
 * New completions must exist in both the template and the personalization (active).
 */
export function normalizeCanonicalCompletedLevels(existingCompleted, newCompleted, activeLevelIds) {
  const activeSet = new Set(activeLevelIds);
  const existingSet = new Set(existingCompleted || []);
  
  // Start with existing to preserve historical (even if now hidden)
  const finalSet = new Set(existingCompleted || []);

  for (const lvl of (newCompleted || [])) {
    // Only accept new if it's currently active (required or optional, but included)
    if (activeSet.has(lvl)) {
      finalSet.add(lvl);
    }
  }

  return Array.from(finalSet);
}

/**
 * Calculates roadmap status based on intersection of historical completed and active required.
 */
export function calculateRequiredRoadmapStatus(completedLevels, activeLevelIds) {
  const completedSet = new Set(completedLevels || []);
  const activeRequiredCount = (activeLevelIds || []).length;
  
  if (activeRequiredCount === 0) return "not_started";

  let completedActiveCount = 0;
  for (const lvl of (activeLevelIds || [])) {
    if (completedSet.has(lvl)) {
      completedActiveCount++;
    }
  }

  if (completedActiveCount === 0 && completedSet.size === 0) {
    return "not_started";
  } else if (completedActiveCount === 0 && completedSet.size > 0) {
    // If they have historical hidden progress but no active progress
    return "in_progress";
  }

  if (completedActiveCount >= activeRequiredCount) return "completed";
  
  return "in_progress";
}

/**
 * Computes completed days based on the intersection of active days and completed levels.
 * Only days that are in the active personalization are considered.
 */
export function deriveGenAiCompletedDays(template, personalization, completedLevels) {
  if (!template || !personalization) return [];
  
  const activeDayIds = new Set(personalization.includedDayIds || []);
  const completedSet = new Set(completedLevels || []);
  const completedDays = [];

  for (const day of (template.days || [])) {
    if (!activeDayIds.has(day.id)) continue;
    
    let isDayCompleted = true;
    let hasLevels = false;

    for (const lvl of (day.levels || [])) {
      hasLevels = true;
      if (!completedSet.has(lvl.id)) {
        isDayCompleted = false;
        break;
      }
    }

    if (hasLevels && isDayCompleted) {
      completedDays.push(day.id);
    }
  }

  return completedDays;
}
