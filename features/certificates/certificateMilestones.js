export function getRoadmapFamily(roadmapId) {
  if (roadmapId?.startsWith("dsa")) return "dsa";
  if (roadmapId?.startsWith("prompt-engineering")) return "prompt-engineering";
  if (roadmapId?.startsWith("c-language")) return "c-language";
  return roadmapId;
}

function getDay(roadmapData, targetDayId) {
  return roadmapData.days?.find((day) => day.id === targetDayId);
}

function isDayComplete(roadmapData, completedLevels, targetDayId) {
  const day = getDay(roadmapData, targetDayId);
  if (!day?.levels?.length) return false;
  return day.levels.every((level) => completedLevels.includes(level.id));
}

function isLevelInDay(roadmapData, levelId, targetDayId) {
  const day = getDay(roadmapData, targetDayId);
  return !!day?.levels?.some((level) => level.id === levelId);
}

const CERTIFICATE_RULES = [
  {
    certificateKey: "prompt-day-1",
    roadmapFamily: "prompt-engineering",
    milestoneTitle: "Completed Day 1 of Prompt Engineering",
    template: "prompt-day-1.png",
    condition: ({ roadmapData, completedLevels, triggerType, dayId }) => {
      if (!roadmapData.id.startsWith("prompt-engineering")) return false;
      if (triggerType !== "day") return false;
      if (dayId !== "day1") return false;
      return isDayComplete(roadmapData, completedLevels, "day1");
    },
    getStats: (roadmapData) => {
      const day1 = getDay(roadmapData, "day1");
      return { dayNumber: 1, milestoneLevels: day1?.levels || [] };
    }
  },
  {
    certificateKey: "prompt-day-2",
    roadmapFamily: "prompt-engineering",
    milestoneTitle: "Completed Day 2 of Prompt Engineering",
    template: "prompt-day-1.png",
    condition: ({ roadmapData, completedLevels, triggerType, dayId }) => {
      if (!roadmapData.id.startsWith("prompt-engineering")) return false;
      if (triggerType !== "day") return false;
      if (dayId !== "day2") return false;
      return isDayComplete(roadmapData, completedLevels, "day2");
    },
    getStats: (roadmapData) => {
      const day2 = getDay(roadmapData, "day2");
      return { dayNumber: 2, milestoneLevels: day2?.levels || [] };
    }
  },
  {
    certificateKey: "prompt-day-3",
    roadmapFamily: "prompt-engineering",
    milestoneTitle: "Completed Day 3 of Prompt Engineering",
    template: "prompt-day-1.png",
    condition: ({ roadmapData, completedLevels, triggerType, dayId }) => {
      if (!roadmapData.id.startsWith("prompt-engineering")) return false;
      if (triggerType !== "day") return false;
      if (dayId !== "day3") return false;
      return isDayComplete(roadmapData, completedLevels, "day3");
    },
    getStats: (roadmapData) => {
      const day3 = getDay(roadmapData, "day3");
      return { dayNumber: 3, milestoneLevels: day3?.levels || [] };
    }
  },
  {
    certificateKey: "dsa-level-1",
    roadmapFamily: "dsa",
    milestoneTitle: "Completed DSA Level 1",
    template: "dsa-milestone.png",
    condition: ({ roadmapData, completedLevels, triggerType, levelId }) => {
      if (!roadmapData.id.startsWith("dsa")) return false;
      if (triggerType !== "level") return false;
      const firstLevel = roadmapData.days?.[0]?.levels?.[0];
      return !!firstLevel && completedLevels.includes(firstLevel.id) && levelId === firstLevel.id;
    },
    getStats: (roadmapData) => {
      const firstLevel = roadmapData.days?.[0]?.levels?.[0];
      return { dayNumber: 1, milestoneLevels: firstLevel ? [firstLevel] : [] };
    }
  },
  {
    certificateKey: "c-level-1",
    roadmapFamily: "c-language",
    milestoneTitle: "Completed C Language First Level",
    template: "c-course-milestone.jpg",
    condition: ({ roadmapData, completedLevels, triggerType, levelId }) => {
      // ponytail: simplest logic for first level completion, reusing the pattern
      if (!roadmapData.id.startsWith("c-language")) return false;
      if (triggerType !== "level") return false;
      const firstLevel = roadmapData.days?.[0]?.levels?.[0];
      return !!firstLevel && completedLevels.includes(firstLevel.id) && levelId === firstLevel.id;
    }
  },
  {
    certificateKey: "dsa-day-10",
    roadmapFamily: "dsa",
    milestoneTitle: "Completed 10 Days of DSA",
    template: "dsa-milestone.png",
    condition: ({ roadmapData, completedLevels, triggerType, dayId }) => {
      if (!roadmapData.id.startsWith("dsa")) return false;
      if (triggerType !== "day") return false;
      if (dayId !== "day10") return false;
      return isDayComplete(roadmapData, completedLevels, "day10");
    },
    getStats: (roadmapData) => {
      const day10 = roadmapData.days?.find((d) => d.id === "day10");
      return { dayNumber: 10, milestoneLevels: day10?.levels || [] };
    }
  },
  {
    certificateKey: "dsa-day-20",
    roadmapFamily: "dsa",
    milestoneTitle: "Completed 20 Days of DSA",
    template: "dsa-milestone.png",
    condition: ({ roadmapData, completedLevels, triggerType, dayId }) => {
      if (!roadmapData.id.startsWith("dsa")) return false;
      if (triggerType !== "day") return false;
      if (dayId !== "day20") return false;
      return isDayComplete(roadmapData, completedLevels, "day20");
    },
    getStats: (roadmapData) => {
      const day20 = roadmapData.days?.find((d) => d.id === "day20");
      return { dayNumber: 20, milestoneLevels: day20?.levels || [] };
    }
  },
  {
    certificateKey: "dsa-day-23",
    roadmapFamily: "dsa",
    milestoneTitle: "Completed the 23-Day DSA Roadmap",
    template: "dsa-milestone.png",
    condition: ({ roadmapData, completedLevels, triggerType, dayId }) => {
      if (!roadmapData.id.startsWith("dsa")) return false;
      if (triggerType !== "day") return false;
      if (dayId !== "day23") return false;
      return isDayComplete(roadmapData, completedLevels, "day23");
    },
    getStats: (roadmapData) => {
      const day23 = roadmapData.days?.find((d) => d.id === "day23");
      return { dayNumber: 23, milestoneLevels: day23?.levels || [] };
    }
  }
];

export function checkCertificateUnlock({ roadmapData, completedLevels, levelId, dayId, triggerType }) {
  if (!roadmapData || !completedLevels) return null;

  for (const rule of CERTIFICATE_RULES) {
    const isMet = rule.condition({ roadmapData, completedLevels, levelId, dayId, triggerType });
    if (isMet) {
      const family = getRoadmapFamily(roadmapData.id);
      const stats = rule.getStats ? rule.getStats(roadmapData) : { dayNumber: 1, milestoneLevels: [] };
      return {
        certificateKey: rule.certificateKey,
        roadmapId: roadmapData.id,
        roadmapFamily: family,
        roadmapTitle: roadmapData.title || roadmapData.name || "Roadmap",
        milestoneTitle: rule.milestoneTitle,
        template: rule.template,
        unlockedAt: new Date().toISOString(),
        dayNumber: stats.dayNumber,
        milestoneLevels: stats.milestoneLevels
      };
    }
  }

  return null;
}

export function getEligibleCertificates({ roadmapData, completedLevels, assignmentPassedDays = {} }) {
  if (!roadmapData || !completedLevels) return [];

  const eligible = [];

  for (const rule of CERTIFICATE_RULES) {
    const isLevelBased = rule.certificateKey === "dsa-level-1" || rule.certificateKey === "c-level-1";

    let triggerType = isLevelBased ? "level" : "day";
    let dayId = null;
    let levelId = null;

    if (rule.certificateKey === "dsa-level-1" || rule.certificateKey === "c-level-1") {
      const firstLevel = roadmapData.days?.[0]?.levels?.[0];
      levelId = firstLevel?.id;
      if (!levelId || !completedLevels.includes(levelId)) continue;
    }

    if (rule.certificateKey === "prompt-day-1") dayId = "day1";
    if (rule.certificateKey === "prompt-day-2") dayId = "day2";
    if (rule.certificateKey === "prompt-day-3") dayId = "day3";
    if (rule.certificateKey === "dsa-day-10") dayId = "day10";
    if (rule.certificateKey === "dsa-day-20") dayId = "day20";
    if (rule.certificateKey === "dsa-day-23") dayId = "day23";

    if (!isLevelBased && !assignmentPassedDays[dayId]) continue;

    const isMet = rule.condition({
      roadmapData,
      completedLevels,
      triggerType,
      dayId,
      levelId
    });

    if (!isMet) continue;

    const family = getRoadmapFamily(roadmapData.id);
    const stats = rule.getStats ? rule.getStats(roadmapData) : { dayNumber: 1, milestoneLevels: [] };

    eligible.push({
      certificateKey: rule.certificateKey,
      roadmapId: roadmapData.id,
      roadmapFamily: family,
      roadmapTitle: roadmapData.title || roadmapData.name || "Roadmap",
      milestoneTitle: rule.milestoneTitle,
      template: rule.template,
      unlockedAt: new Date().toISOString(),
      dayNumber: stats.dayNumber,
      milestoneLevels: stats.milestoneLevels
    });
  }

  return eligible;
}
