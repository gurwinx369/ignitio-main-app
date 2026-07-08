"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/context/AuthContext";
import { Button } from "@/components/ui/button";

const CONSENT_VERSION = "2026-07-07";
const CONSENT_STORAGE_PREFIX = "ignitio:required-consent:v1";

export default function RequiredConsentModal() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only check when user is available and we are not on an onboarding route
    if (!user || !user.uid) return;
    if (pathname && pathname.startsWith("/home/onboarding")) {
      setIsOpen(false);
      return;
    }

    try {
      const storageKey = `${CONSENT_STORAGE_PREFIX}:${user.uid}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (
          parsed.acceptedTerms &&
          parsed.acceptedPrivacy
        ) {
          setIsOpen(false);
          return;
        }
      }
      // If we reach here, either no record, or invalid record, show modal
      setIsOpen(true);
    } catch (err) {
      console.error("Error reading consent from localStorage", err);
      setIsOpen(true);
    }
  }, [user, pathname]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleContinue = () => {
    if (!user || !user.uid) return;
    if (!acceptedTerms) return;

    try {
      const storageKey = `${CONSENT_STORAGE_PREFIX}:${user.uid}`;
      const consentRecord = {
        acceptedTerms: true,
        acceptedPrivacy: true,
        termsVersion: CONSENT_VERSION,
        privacyVersion: CONSENT_VERSION,
        acceptedAt: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(consentRecord));
      setIsOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error saving consent to localStorage", err);
      setError("We could not save your confirmation. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-modal-title"
      >
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 id="consent-modal-title" className="text-xl font-bold text-zinc-900 dark:text-white">
            Before continuing
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Please confirm the following to continue using Ignitio.
          </p>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-primary focus:ring-primary focus:ring-offset-2 dark:bg-zinc-800 transition-colors"
              />
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              I have read and agree to Ignitio’s{" "}
              <a href="https://ignitio.cloud/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Terms & Conditions</a>
              {" "}and{" "}
              <a href="https://ignitio.cloud/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Privacy Policy</a>.
            </div>
          </label>

          <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 px-1">
            By continuing, you confirm that you meet Ignitio’s eligibility requirements.
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              For paid subscriptions, Ignitio’s{" "}
              <a href="https://ignitio.cloud/refund-cancellation-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Refund & Cancellation Policy</a>
              {" "}applies.
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive dark:text-red-400 font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!acceptedTerms}
            className="w-full sm:w-auto"
          >
            Continue to Ignitio
          </Button>
        </div>
      </div>
    </div>
  );
}
