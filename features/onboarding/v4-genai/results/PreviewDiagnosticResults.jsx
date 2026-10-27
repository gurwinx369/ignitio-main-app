"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoadmapResult } from "@/components/roadmap/roadmap-result";

export default function PreviewDiagnosticResults() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    let payload = {};
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("genai_preview_assessment");
      if (stored) {
        try {
          payload = JSON.parse(stored);
        } catch (e) {}
      }
    }
    setData({
      roadmap: ["prompt", "system_design"],
    });
  }, []);

  const handleContinue = () => {
    router.push("/auth/signup?from=genai_preview&redirect=/onboarding/paywall");
  };

  return (
    <RoadmapResult
      goal="gen_ai"
      roadmapIds={data?.roadmap || ["prompt", "system_design"]}
      onContinue={handleContinue}
      onBack={() => router.push("/onboarding/diagnostic")}
    />
  );
}
