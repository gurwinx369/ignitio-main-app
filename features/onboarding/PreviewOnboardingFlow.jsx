"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingProfession from "./onboarding-V3/OnboardingProfession";

export default function PreviewOnboardingFlow() {
  const [profession, setProfession] = useState("");
  const router = useRouter();
  const handleProfessionNext = () => {
    if (!profession) return;
    localStorage.setItem("profession", profession);
    router.push("/preview/home");
  };

  return (
    <OnboardingProfession
      selection={profession}
      setSelection={setProfession}
      onNext={handleProfessionNext}
    />
  );
}
