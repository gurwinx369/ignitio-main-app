export function readLocalRoadmapProgress({ roadmapId, allLevels, days }) {
  if (typeof window === "undefined") {
    return { completedLevels: [], passedAssignments: [] };
  }

  try {
    const allCompletedIds = new Set();
    const legacyKeys = [
      `progress_${roadmapId}_beginner`,
      `progress_${roadmapId}_intermediate`,
      `progress_${roadmapId}_advanced`,
      `progress_${roadmapId}_day1`,
      `progress_${roadmapId}_day2`,
      `progress_${roadmapId}_day3`,
    ];

    // Read legacy keys
    legacyKeys.forEach((key) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            parsed.forEach((id) => allCompletedIds.add(id));
          }
        } catch (e) {
          // Ignore parsing errors for individual keys
        }
      }
    });

    // Read canonical key
    const canonicalKey = `completed_levels_${roadmapId}`;
    const canonicalSaved = localStorage.getItem(canonicalKey);
    if (canonicalSaved) {
      try {
        const parsed = JSON.parse(canonicalSaved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => allCompletedIds.add(id));
        }
      } catch (e) {
        // Ignore
      }
    }

    // Filter unknown IDs
    const validIds = new Set(allLevels.map((level) => level.id));
    const validCompletedIds = Array.from(allCompletedIds).filter((id) => validIds.has(id));

    // Sort according to allLevels order
    const completedLevels = validCompletedIds.sort((a, b) => {
      const aIndex = allLevels.findIndex((l) => l.id === a);
      const bIndex = allLevels.findIndex((l) => l.id === b);
      return aIndex - bIndex;
    });

    // Read passed assignments
    const passedAssignments = [];
    if (Array.isArray(days)) {
      days.forEach((day) => {
        if (
          localStorage.getItem(`assignment_passed_${roadmapId}_${day.id}`) ===
          "true"
        ) {
          passedAssignments.push(day.id);
        }
      });
    }

    return {
      completedLevels,
      passedAssignments,
    };
  } catch (err) {
    console.warn("Failed to read roadmap progress from localStorage", err);
    return { completedLevels: [], passedAssignments: [] };
  }
}

export function writeLocalRoadmapProgress({
  roadmapId,
  completedLevels,
  passedAssignments,
}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (Array.isArray(completedLevels)) {
      localStorage.setItem(
        `completed_levels_${roadmapId}`,
        JSON.stringify(completedLevels)
      );
    }

    if (Array.isArray(passedAssignments)) {
      passedAssignments.forEach((dayId) => {
        localStorage.setItem(`assignment_passed_${roadmapId}_${dayId}`, "true");
      });
    }
  } catch (err) {
    console.warn("Failed to write roadmap progress to localStorage", err);
  }
}
