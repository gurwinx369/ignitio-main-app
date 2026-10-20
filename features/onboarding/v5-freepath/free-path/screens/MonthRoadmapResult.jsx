"use client";

import { useMemo } from "react";
import { RoadmapResult } from "@/components/roadmap/roadmap-result";

// ponytail: deleted 450 lines of duplicate roadmap UI. Shortest path is to reuse RoadmapResult.
export default function MonthRoadmapResult({ roadmap, path, goal, onContinue, onBack }) {
  const effectiveRoadmap = useMemo(() => {
    if (goal === "dsa") {
      return ["dsa"];
    }
    if (!roadmap || !Array.isArray(roadmap) || roadmap.length === 0) {
      return ["python", "git"];
    }
    // For all other goals, ensure DSA is NOT present
    return roadmap.filter((id) => id !== "dsa");
  }, [roadmap, goal]);

  return (
    <RoadmapResult 
      goal={goal}
      roadmapIds={effectiveRoadmap} 
      onContinue={onContinue} 
      onBack={onBack} 
    />
  );
}