export function getNow() {
  return new Date();
}

export function sanitizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string" && v.trim() !== "");
}

export function normalizeCompletedLevels(completedLevels, allLevelIds) {
  if (!Array.isArray(completedLevels) || !Array.isArray(allLevelIds)) {
    return [];
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
