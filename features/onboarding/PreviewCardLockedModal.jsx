"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Lock, X, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import CertificateCanvas from "@/features/certificates/CertificateCanvas";

const CERTIFICATE_WIDTH = 735;
const CERTIFICATE_HEIGHT = 934;

// ponytail: previewScale mirrors CertificateUnlockedModal logic exactly
function usePreviewScale(containerRef, show) {
  const [scale, setScale] = useState(0.38);

  const update = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const s = Math.min(
      1,
      (width - 24) / CERTIFICATE_WIDTH,
      (height - 24) / CERTIFICATE_HEIGHT,
    );
    setScale(Math.max(0.28, s));
  }, [containerRef]);

  useEffect(() => {
    if (!show) return;
    const id = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", update);
    };
  }, [show, update]);

  return scale;
}

import { saveUnlockedCertificate } from "@/features/certificates/certificateStorage";

export default function PreviewCardLockedModal({
  certificate,
  roadmapId,
  completedLevelId,
  completedLevels,
  onClose,
}) {
  const router = useRouter();
  const containerRef = useRef(null);
  const scale = usePreviewScale(containerRef, true);
  const canvasId = `preview-cert-${certificate?.certificateKey || "preview"}`;

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSignupClick = () => {
    // Save preview payload so progress migrates automatically after signup
    try {
      localStorage.setItem(
        "ignitio:preview_payload",
        JSON.stringify({
          roadmapId,
          completedLevelId,
          completedLevels,
          profession: localStorage.getItem("profession") || "other",
          savedAt: Date.now(),
        }),
      );

      // ponytail: store real cert now and queue animation for dashboard
      if (certificate && !certificate.certificateKey?.startsWith("preview-")) {
        saveUnlockedCertificate(certificate);
        localStorage.setItem(
          "ignitio:pending_certificate_animation",
          JSON.stringify(certificate),
        );
      }
    } catch {
      /* storage full — non-fatal */
    }

    router.push(
      `/auth/signup?from=preview&roadmap=${roadmapId}&level=${completedLevelId}`,
    );
  };

  const scaledW = CERTIFICATE_WIDTH * scale;
  const scaledH = CERTIFICATE_HEIGHT * scale;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center bg-gradient-to-b from-[#19183b]/50 via-black/60 to-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-lock-heading"
    >
      <div className="relative w-full sm:max-w-[400px] max-h-[96dvh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_25px_70px_-15px_rgba(25,24,59,0.45)] ring-1 ring-white/40 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* subtle top sheen — sells the "glass" material */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/60 backdrop-blur-md border border-white/60 text-[#19183b]/60 hover:text-[#19183b] hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a9ff]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile drag handle */}
        <div className="sm:hidden mx-auto mt-3 mb-0 h-1.5 w-10 rounded-full bg-[#19183b]/15 relative z-10" />

        {/* Content */}
        <div className="relative flex flex-col items-center px-6 pt-7 pb-5 overflow-y-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-800 text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full mb-4 border border-amber-400/25 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Certificate earned
          </div>

          {/* Header */}
          <div className="text-center mb-5 px-2">
            <h2
              id="cert-lock-heading"
              className="text-[22px] font-extrabold text-[#19183b] leading-tight tracking-tight"
            >
              Don't let it disappear.
            </h2>
            <p className="mt-2 text-[13.5px] text-[#19183b]/60 leading-relaxed">
              Create a free account to save this certificate, keep your progress
              on every device, and share it on LinkedIn.
            </p>
          </div>

          {/* Certificate preview, sealed behind glass */}
          <div
            ref={containerRef}
            className="relative w-full flex justify-center items-center mb-6"
            style={{ height: `${scaledH + 16}px` }}
          >
            <div
              className="relative shrink-0 rounded-2xl overflow-hidden border border-white/70 shadow-[0_10px_30px_-8px_rgba(25,24,59,0.35)]"
              style={{ width: `${scaledW}px`, height: `${scaledH}px` }}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  width: `${CERTIFICATE_WIDTH}px`,
                  height: `${CERTIFICATE_HEIGHT}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  filter: "blur(7px)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                <CertificateCanvas
                  certificate={certificate}
                  canvasId={canvasId}
                />
              </div>

              {/* Frosted glass seal */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md">
                <div className="flex flex-col items-center gap-2.5 bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-5 shadow-lg border border-white/70 mx-4 text-center">
                  <div className="relative flex items-center justify-center w-11 h-11">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#00a9ff]/30 motion-safe:animate-ping" />
                    <div className="relative w-10 h-10 rounded-full bg-[#19183b] flex items-center justify-center">
                      <Lock className="w-4.5 h-4.5 text-white" />
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-[#19183b] leading-snug">
                    Certificate locked
                  </p>
                  <p className="text-[11px] text-[#19183b]/50 leading-snug">
                    Sign up to reveal it
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="w-full">
            <button
              onClick={handleSignupClick}
              className="group w-full flex items-center justify-center gap-2 bg-[#00a9ff] hover:bg-[#0095e0] text-white font-extrabold text-[15px] h-14 rounded-2xl shadow-[0_5px_0px_#0085cc] active:translate-y-[3px] active:shadow-[0_2px_0px_#0085cc] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00a9ff]"
            >
              Claim My Certificate
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-center text-[11px] text-[#19183b]/40">
              Free forever · No credit card · Takes 10 seconds
            </p>
            <button
              onClick={onClose}
              className="w-full mt-2 text-sm text-[#19183b]/40 hover:text-[#19183b]/70 transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a9ff]/40 rounded-lg"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
