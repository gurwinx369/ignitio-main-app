import { getGenAiWeekNumber } from "./genAiWeekHelper";

/**
 * Filters GenAI roadmap days to only those containing at least one level
 * that has both `dailyBuild` and `expectedOutput` defined and non-empty,
 * and falls within the specified minWeek and maxWeek range (inclusive).
 *
 * Each returned day's `levels` array is also filtered to only those build levels.
 * Days and levels with no build data are silently skipped.
 *
 * @param {Array} days - The `days` array from genAiRoadmapData
 * @param {number} minWeek - Minimum canonical week number (inclusive)
 * @param {number} maxWeek - Maximum canonical week number (inclusive)
 * @returns {Array} Filtered days with build levels only
 */
export function filterDailyBuildWeeks(days, minWeek = 1, maxWeek = 12) {
    if (!Array.isArray(days)) return [];

    return days
        .filter((day) => {
            const week = getGenAiWeekNumber(day);
            if (week === null) return false;
            return week >= minWeek && week <= maxWeek;
        })
        .map((day) => ({
            ...day,
            levels: day.levels.filter(
                (l) => l.dailyBuild?.trim() && l.expectedOutput?.trim(),
            ),
        }))
        .filter((day) => day.levels.length > 0);
}
