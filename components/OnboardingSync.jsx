"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/features/context/AuthContext";
import { syncOnboardingFromLocalStorage } from "@/lib/onboarding/sync-localstorage";

/**
 * OnboardingSync
 * 
 * Silently runs in the background on authenticated layouts (like /home).
 * If a user experiences a network drop or a 422 error during onboarding and 
 * manages to bypass the gateway into the dashboard, their diagnostic payload 
 * will remain stranded in localStorage.
 * 
 * This component securely scoops up any stranded payload, flushes it to the 
 * backend, and safely clears localStorage so they don't lose their data.
 */
export default function OnboardingSync() {
  const { user } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!user || hasSynced.current) return;
    
    // Fast check before doing any heavy async work
    const hasData = localStorage.getItem("ignitio:onboarding_result") || 
                    localStorage.getItem("ignitio:free_onboarding_v1") || 
                    localStorage.getItem("genai_preview_assessment");
                    
    if (!hasData) {
      hasSynced.current = true;
      return;
    }

    hasSynced.current = true;
    
    user.getIdToken().then((token) => {
      syncOnboardingFromLocalStorage(token).catch(console.error);
    }).catch(console.error);
    
  }, [user]);

  return null;
}
