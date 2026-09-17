"use client";
import React from "react";
import { useRouter } from "next/navigation";
import DiagnosticAssessment from "./DiagnosticAssessment";

export default function PreviewGenAiFlow() {
  const router = useRouter();

  const handlePreviewSubmit = async (payload) => {
    // Save to local storage so the next step (after signup) knows what happened
    localStorage.setItem("genai_preview_assessment", JSON.stringify(payload));
    return { success: true };
  };

  const handleSuccess = () => {
    // ponytail: unauth results page first, then signup
    router.push("/preview/gen-ai/results");
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf5ee]">
      <DiagnosticAssessment
        mode="preview"
        submitAssessment={handlePreviewSubmit}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
