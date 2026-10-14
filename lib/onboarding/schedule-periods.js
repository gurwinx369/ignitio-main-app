export const SCHEDULE_PERIOD_CONFIG = {
    MORNING: {
        min: "05:00",
        max: "12:00",
        defaultStart: "08:00",
        defaultEnd: "09:00",
    },

    NOON: {
        min: "12:00",
        max: "17:00",
        defaultStart: "12:00",
        defaultEnd: "13:00",
    },

    EVENING: {
        min: "17:00",
        max: "21:00",
        defaultStart: "18:00",
        defaultEnd: "19:00",
    },

    NIGHT: {
        min: "21:00",
        max: "23:59",
        defaultStart: "21:00",
        defaultEnd: "22:00",
    },
};

function timeToMinutes(time) {
    if (
        typeof time !== "string" ||
        !/^\d{2}:\d{2}$/.test(time)
    ) {
        return null;
    }

    const [hours, minutes] =
        time.split(":").map(Number);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

export function validateTimeWithinPeriod({
    period,
    startTime,
    endTime,
}) {
    const config =
        SCHEDULE_PERIOD_CONFIG[period];

    if (!config) {
        return {
            valid: false,
            error: `Invalid schedule period: ${period}`,
        };
    }

    const startMinutes =
        timeToMinutes(startTime);

    const endMinutes =
        timeToMinutes(endTime);

    const minMinutes =
        timeToMinutes(config.min);

    const maxMinutes =
        timeToMinutes(config.max);

    if (
        startMinutes === null ||
        endMinutes === null
    ) {
        return {
            valid: false,
            error: "Invalid schedule time.",
        };
    }

    if (endMinutes <= startMinutes) {
        return {
            valid: false,
            error:
                "End time must be after start time.",
        };
    }

    if (
        startMinutes < minMinutes ||
        startMinutes >= maxMinutes
    ) {
        return {
            valid: false,
            error:
                `${period} start time must be between ${config.min} and ${config.max}.`,
        };
    }

    if (
        endMinutes <= minMinutes ||
        endMinutes > maxMinutes
    ) {
        return {
            valid: false,
            error:
                `${period} end time must be between ${config.min} and ${config.max}.`,
        };
    }

    return {
        valid: true,
    };
}

export function deriveScheduleFromBrowser() {
  const tz = (typeof Intl !== "undefined" &&
    Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC";

  const now   = new Date();
  const h     = now.getHours();
  const m     = now.getMinutes();

  const roundedM  = Math.round(m / 15) * 15;
  const carry     = roundedM >= 60 ? 1 : 0;
  const startH    = (h + carry) % 24;
  const startM    = roundedM % 60;

  let period;
  if (startH >= 5 && startH < 12)       period = "MORNING";
  else if (startH >= 12 && startH < 17) period = "NOON";
  else if (startH >= 17 && startH < 21) period = "EVENING";
  else                                   period = "NIGHT";

  const config = SCHEDULE_PERIOD_CONFIG[period];
  const { min, max } = config;
  const [minH, minM] = min.split(":").map(Number);
  const [maxH, maxM] = max.split(":").map(Number);
  const minMins      = minH * 60 + minM;
  const maxMins      = maxH * 60 + maxM;

  let startMins = startH * 60 + startM;

  if (startMins < minMins) startMins = minMins;

  const pad      = (n) => String(n).padStart(2, "0");
  const startTime = `${pad(Math.floor(startMins / 60))}:${pad(startMins % 60)}`;

  const rawEndMins = Math.min(startMins + 60, maxMins);
  const endTime    = `${pad(Math.floor(rawEndMins / 60))}:${pad(rawEndMins % 60)}`;

  return { timezone: tz, period, startTime, endTime };
}