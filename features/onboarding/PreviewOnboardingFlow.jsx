"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingProfession from "./onboarding-V3/OnboardingProfession";
import { useAuth } from "@/features/context/AuthContext";

export default function PreviewOnboardingFlow() {
  const [profession, setProfession] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  const handleProfessionNext = () => {
    if (!profession) return;
    localStorage.setItem("profession", profession);
    router.push("/preview/home");
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf5ee] flex justify-center items-center">
      <OnboardingProfession
        selection={profession}
        setSelection={setProfession}
        onNext={handleProfessionNext}
      />
    </div>
  );
}
