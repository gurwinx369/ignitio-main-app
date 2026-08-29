/**
 * Parses the canonical week number from a GenAI day ID.
 * Expects format: "genai-w{number}"
 */
export function getGenAiWeekNumber(day) {
    const match = String(day?.id || "").match(/^genai-w(\d+)$/i);
    if (!match) return null;

    const week = Number(match[1]);
    return Number.isInteger(week) ? week : null;
}

/**
 * Pure helper to filter canonical week nodes between min and max bounds inclusive.
 */
export function filterGenAiWeeks(days, minWeek, maxWeek) {
    if (!Array.isArray(days)) return [];
    
    return days.filter((day) => {
        const week = getGenAiWeekNumber(day);
        if (week === null) return false;
        return week >= minWeek && week <= maxWeek;
    });
}
