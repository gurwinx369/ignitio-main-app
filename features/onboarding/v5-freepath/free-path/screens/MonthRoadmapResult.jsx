"use client";

import { RoadmapResult } from "@/components/roadmap/roadmap-result";

// ponytail: deleted 450 lines of duplicate roadmap UI. Shortest path is to reuse RoadmapResult.
export default function MonthRoadmapResult({ roadmap, path, onContinue, onBack }) {
  return (
    <RoadmapResult 
      roadmapIds={roadmap} 
      onContinue={onContinue} 
      onBack={onBack} 
    />
  );
}