"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/onboarding/reveal-utils";

const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);

export function CountUp({ to, on, delay = 0, duration = 900 }) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!on || prefersReducedMotion()) {
      setValue(to);
      return;
    }

    setValue(0);
    let frame = 0;
    let startedAt = 0;

    const tick = (now) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      setValue(Math.round(to * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    const timeout = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [on, to, delay, duration]);

  return <>{value}</>;
}
