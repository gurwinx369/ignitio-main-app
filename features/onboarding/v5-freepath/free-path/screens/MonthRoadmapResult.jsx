"use client";

import { useMemo } from "react";
import { RoadmapResult } from "@/components/roadmap/roadmap-result";

// ponytail: deleted 450 lines of duplicate roadmap UI. Shortest path is to reuse RoadmapResult.
export default function MonthRoadmapResult({ roadmap, path, goal, onContinue, onBack }) {
  const effectiveRoadmap = useMemo(() => {
    if (!roadmap || !Array.isArray(roadmap) || roadmap.length === 0) {
      return goal === "dsa" ? ["python", "git", "dsa"] : ["python", "git"];
    }
    // Only include DSA if user specifically chose DSA
    if (goal === "dsa") {
      if (!roadmap.includes("dsa")) {
        const gitIdx = roadmap.indexOf("git");
        if (gitIdx !== -1) {
          const next = [...roadmap];
          next.splice(gitIdx + 1, 0, "dsa");
          return next;
        }
        return [...roadmap, "dsa"];
      }
      return roadmap;
    }
    // For all other goals, ensure DSA is NOT present
    return roadmap.filter((id) => id !== "dsa");
  }, [roadmap, goal]);

  return (
    <RoadmapResult 
      roadmapIds={effectiveRoadmap} 
      onContinue={onContinue} 
      onBack={onBack} 
    />
  );
}