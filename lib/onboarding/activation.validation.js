export function isValidIanaTimezone(timezone) {
  if (!timezone || typeof timezone !== "string") return false;
  if (timezone === "UTC") return true;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

export function validateSchedulePreference(schedulePref) {
  if (!schedulePref) return { valid: false, error: "Schedule preference is missing" };
  
  if (!isValidIanaTimezone(schedulePref.timezone)) {
    return { valid: false, error: `Invalid timezone: ${schedulePref.timezone}` };
  }
  
  if (!Array.isArray(schedulePref.windows) || schedulePref.windows.length === 0) {
    return { valid: false, error: "Schedule windows must be a non-empty array" };
  }
  
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const VALID_PERIODS = new Set([
    "MORNING",
    "NOON",
    "EVENING",
    "NIGHT",
  ]);
  
  for (const w of schedulePref.windows) {
    if (!w.period || typeof w.period !== "string" || !VALID_PERIODS.has(w.period)) {
      return { valid: false, error: `Invalid schedule period: ${w.period}` };
    }
    
    if (!w.startTime || !timeRegex.test(w.startTime)) {
      return { valid: false, error: `Invalid start time format: ${w.startTime}` };
    }
    
    if (!w.endTime || !timeRegex.test(w.endTime)) {
      return { valid: false, error: `Invalid end time format: ${w.endTime}` };
    }
    
    const [startH, startM] = w.startTime.split(":").map(Number);
    const [endH, endM] = w.endTime.split(":").map(Number);
    
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    
    if (isNaN(startMin) || isNaN(endMin) || startMin < 0 || startMin >= 1440 || endMin < 0 || endMin >= 1440) {
      return { valid: false, error: "Window time conversion produced invalid minutes" };
    }
    
    if (endMin <= startMin) {
      return { valid: false, error: `End time (${w.endTime}) must be after start time (${w.startTime})` };
    }
  }
  
  return { valid: true };
}
