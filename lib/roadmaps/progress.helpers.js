export function getNow() {
  return new Date();
}

export function sanitizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string" && v.trim() !== "");
}

export function normalizeCompletedLevels(completedLevels, allLevelIds) {
  if (!Array.isArray(completedLevels)) {
    return [];
  }

  // If allLevelIds is not provided or empty, preserve existing completed IDs deduplicated
  if (!Array.isArray(allLevelIds) || allLevelIds.length === 0) {
    return Array.from(
      new Set(completedLevels.filter((id) => typeof id === "string" && id.trim() !== ""))
    );
  }

  // Deduplicate and filter out unknown level IDs
  const validLevelIds = new Set(allLevelIds);
  const uniqueCompleted = new Set(
    completedLevels.filter((id) => validLevelIds.has(id))
  );

  // Sort based on the order in allLevelIds
  return Array.from(uniqueCompleted).sort((a, b) => {
    return allLevelIds.indexOf(a) - allLevelIds.indexOf(b);
  });
}

export function calculateRoadmapStatus({ completedLevels, totalLevels }) {
  const completedCount = Array.isArray(completedLevels)
    ? completedLevels.length
    : 0;
  const total = typeof totalLevels === "number" ? totalLevels : 0;

  if (completedCount === 0) {
    return "not_started";
  }
  if (completedCount >= total && total > 0) {
    return "completed";
  }
  return "in_progress";
}

export function calculateCompletedDays({ days, completedLevels }) {
  if (!Array.isArray(days) || !Array.isArray(completedLevels)) {
    return [];
  }

  const completedSet = new Set(completedLevels);
  const completedDays = [];

  for (const day of days) {
    if (!day || !day.id || !Array.isArray(day.levelIds)) continue;

    // A day is completed if all its levels are completed
    const isDayCompleted =
      day.levelIds.length > 0 &&
      day.levelIds.every((levelId) => completedSet.has(levelId));

    if (isDayCompleted) {
      completedDays.push(day.id);
    }
  }

  return completedDays;
}

export function hasUserCompletedAnyLesson() {
  if (typeof window === "undefined") return false;

  try {
    if (localStorage.getItem("has_completed_first_lesson") === "true") {
      return true;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("completed_levels_") ||
          key.startsWith("progress_") ||
          key === "completedLevels")
      ) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localStorage.setItem("has_completed_first_lesson", "true");
              return true;
            }
          } catch (e) {
            // Ignore non-json items
          }
        }
      }
    }
  } catch (err) {
    console.warn("Error checking completed lessons", err);
  }

  return false;
}
