"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RoadmapSelectionGrid from "./components/RoadmapSelectionGrid";
import OnboardingProfession from "./onboarding-V3/OnboardingProfession";
import { useAuth } from "@/features/context/AuthContext";

export default function PreviewOnboardingFlow() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State for handling role selection for specific roadmaps
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [profession, setProfession] = useState("");

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  const handleSelectRoadmap = (roadmapId) => {
    if (roadmapId === "gen-ai") {
      router.push("/preview/gen-ai");
      return;
    }

    if (roadmapId === "dsa" || roadmapId === "prompt-engineering") {
      setSelectedRoadmap(roadmapId);
      return;
    }

    router.push(`/preview/roadmaps/${roadmapId}`);
  };

  const handleProfessionNext = () => {
    if (!profession) return;
    localStorage.setItem("profession", profession);
    router.push(`/preview/roadmaps/${selectedRoadmap}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf5ee] flex justify-center items-center">
      {!selectedRoadmap ? (
        <RoadmapSelectionGrid onSelect={handleSelectRoadmap} />
      ) : (
        <OnboardingProfession
          selection={profession}
          setSelection={setProfession}
          onNext={handleProfessionNext}
          roadmap={selectedRoadmap}
        />
      )}
    </div>
  );
}
