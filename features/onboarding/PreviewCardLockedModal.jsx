"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Lock, X, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import CertificateCanvas from "@/features/certificates/CertificateCanvas";
import { motion, AnimatePresence } from "framer-motion";

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

// Stagger container — children animate in sequentially
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 26 } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.78 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

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

      // ponytail: queue cert animation for dashboard — all certs are valid, including fallback preview- ones
      if (certificate) {
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
      className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-lock-heading"
    >
      {/* Panel — transparent, no background */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full sm:max-w-[400px] max-h-[96dvh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white/60 hover:text-white hover:bg-white/25 transition-[color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile drag handle */}
        <div className="sm:hidden mx-auto mt-3 mb-0 h-1.5 w-10 rounded-full bg-white/30 relative z-10" />

        {/* Staggered content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative flex flex-col items-center px-6 pt-7 pb-5 overflow-y-auto"
        >
          {/* Badge */}
          <motion.div
            variants={popIn}
            className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full mb-4 border border-amber-400/30 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Card earned
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-5 px-2">
            <h2
              id="cert-lock-heading"
              className="text-[22px] font-extrabold text-white leading-tight tracking-tight"
            >
              Don&apos;t let it disappear.
            </h2>
            <p className="mt-2 text-[13.5px] text-white/60 leading-relaxed">
              Create a free account to save this card, keep your progress on
              every device, and share it on LinkedIn.
            </p>
          </motion.div>

          {/* Certificate preview — sealed behind glass */}
          <motion.div
            variants={popIn}
            ref={containerRef}
            className="relative w-full flex justify-center items-center mb-6"
            style={{ height: `${scaledH + 16}px` }}
          >
            <div
              className="relative shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-[0_16px_48px_-10px_rgba(0,0,0,0.65)]"
              style={{ width: `${scaledW}px`, height: `${scaledH}px` }}
            >
              {/* Blurred cert beneath */}
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

              {/* Minimal lock overlay — no inner card box */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[5px]">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#00a9ff]/35 motion-safe:animate-ping" />
                  <div className="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="mt-2.5 text-[12px] font-semibold text-white/85 tracking-wide">
                  Sign up to reveal
                </p>
              </div>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeUp} className="w-full">
            <button
              onClick={handleSignupClick}
              className="group w-full flex items-center justify-center gap-2 bg-[#00a9ff] hover:bg-[#0095e0] text-white font-extrabold text-[15px] h-14 rounded-2xl shadow-[0_5px_0px_#0085cc] active:translate-y-[3px] active:shadow-[0_2px_0px_#0085cc] transition-[transform,box-shadow,background-color] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00a9ff]"
            >
              Claim My Card
              <ArrowRight className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-center text-[11px] text-white/40">
              Free forever · No credit card · Takes 10 seconds
            </p>
            <button
              onClick={onClose}
              className="w-full mt-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-150 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg"
            >
              Not now
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
