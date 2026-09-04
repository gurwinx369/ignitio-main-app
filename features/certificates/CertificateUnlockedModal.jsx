"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Download, Share2, X } from "lucide-react";
import CertificateCanvas from "./CertificateCanvas";
import { downloadCertificateAsPng } from "./certificateDownload";
import { markCertificateDownloaded } from "./certificateStorage";
import { shareCertificate } from "./certificateShare";
import StrandsReveal from "./StrandsReveal";

const CERTIFICATE_WIDTH = 735;
const CERTIFICATE_HEIGHT = 934;

/* ─── Main Modal Component ────────────────────────────────── */
export default function CertificateUnlockedModal({ certificate, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [previewScale, setPreviewScale] = useState(1);

  const panelRef = useRef(null);
  const headerRef = useRef(null);
  const previewAreaRef = useRef(null);
  const helperRef = useRef(null);
  const footerRef = useRef(null);

  const canvasId = `cert-canvas-${certificate.certificateKey}`;

  /* ─── prefers-reduced-motion ──────────────────────────────── */
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  /* ─── Escape key ─────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ─── Vibration effect (ponytail: simplest robust loop) ── */
  useEffect(() => {
    let intervalId;
    if (!revealComplete) {
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        try {
          intervalId = setInterval(() => window.navigator.vibrate(100), 150);
        } catch (e) {}
      }
    } else {
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        try { window.navigator.vibrate(0); } catch (e) {}
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        try { window.navigator.vibrate(0); } catch (e) {}
      }
    };
  }, [revealComplete]);

  /* ─── Reveal timer ───────────────────────────────────────── */
  useEffect(() => {
    if (!prefersReducedMotion) return;
    const id = window.setTimeout(() => setRevealComplete(true), 0);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion]);

  /* ─── Preview scale ──────────────────────────────────────── */
  const updateScale = useCallback(() => {
    if (!panelRef.current || !previewAreaRef.current) return;

    const panelHeight = panelRef.current.getBoundingClientRect().height;
    const headerHeight = headerRef.current ? headerRef.current.getBoundingClientRect().height : 70;
    const helperHeight = helperRef.current ? helperRef.current.getBoundingClientRect().height : 30;
    const footerHeight = footerRef.current ? footerRef.current.getBoundingClientRect().height : 80;

    const verticalPadding = 60;
    const availableHeight = Math.max(150, panelHeight - headerHeight - helperHeight - footerHeight - verticalPadding);
    const previewAreaWidth = previewAreaRef.current.getBoundingClientRect().width;
    const availableWidth = Math.max(150, previewAreaWidth - 24);

    const scale = Math.min(
      1,
      availableWidth / CERTIFICATE_WIDTH,
      availableHeight / CERTIFICATE_HEIGHT
    );

    setPreviewScale(Math.max(0.38, scale));
  }, []);

  useEffect(() => {
    if (!revealComplete) return;
    requestAnimationFrame(() => updateScale());
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [revealComplete, updateScale]);

  /* ─── Helpers ────────────────────────────────────────────── */
  const showShareMessage = (message) => {
    setShareMessage(message);
    setTimeout(() => setShareMessage(""), 2500);
  };

  /* ─── Download ───────────────────────────────────────────── */
  const handleDownload = async () => {
    setDownloading(true);
    const success = await downloadCertificateAsPng(
      canvasId,
      certificate.certificateKey
    );
    if (success) {
      markCertificateDownloaded(
        certificate.certificateKey,
        certificate.roadmapFamily
      );
    }
    setDownloading(false);
  };

  /* ─── Share ──────────────────────────────────────────────── */
  const handleShare = async () => {
    setSharing(true);
    await shareCertificate({
      canvasId,
      certificate,
      onMessage: showShareMessage,
    });
    setSharing(false);
  };

  /* ─── Backdrop click ─────────────────────────────────────── */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* ─── Computed ───────────────────────────────────────────── */
  const scaledWidth = CERTIFICATE_WIDTH * previewScale;
  const scaledHeight = CERTIFICATE_HEIGHT * previewScale;

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-[#19183b]/80 backdrop-blur-sm p-3 sm:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        /* Card spring entrance — Duolingo-style pop */
        @keyframes cuml-cardSpring {
          0%   { opacity: 0; transform: scale(0.82) translateY(28px); }
          55%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
          75%  { transform: scale(0.98) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cuml-card-spring {
          animation: cuml-cardSpring 0.58s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .cuml-card-spring { animation: none !important; }
        }

        /* Golden shimmer sweep across the card */
        @keyframes cuml-shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(250%) skewX(-12deg); }
        }
        .cuml-shimmer-track {
          animation: cuml-shimmer 0.9s ease-out 0.35s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .cuml-shimmer-track { animation: none !important; }
        }

        /* Star burst particles */
        @keyframes cuml-starOut {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
        }
        .cuml-star {
          animation: cuml-starOut 0.65s ease-out var(--sd) forwards;
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .cuml-star { display: none; }
        }

        /* Header / footer fade-up */
        @keyframes cuml-fadeUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cuml-header { animation: cuml-fadeUp 0.4s ease-out 0.5s both; }
        .cuml-footer { animation: cuml-fadeUp 0.4s ease-out 0.65s both; }
        @media (prefers-reduced-motion: reduce) {
          .cuml-header, .cuml-footer { animation: none !important; }
        }
      `}</style>

      {/* ── Modal panel — transparent, no background ────────── */}
      <div
        ref={panelRef}
        className="relative flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[460px] flex-col overflow-hidden"
      >
        {/* ── Close button (after reveal) ───────────────────── */}
        {revealComplete && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate modal"
            className="absolute top-0 right-0 z-20 p-2 rounded-full bg-white/15 border border-white/25 text-white/60 hover:text-white hover:bg-white/25 transition-[color,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ── Content Area ───────────────────────────────────── */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden p-0">
          {!revealComplete ? (
            /* ── Achievement unlock reveal animation ────── */
            <div className="flex flex-col items-center justify-center w-full h-[300px] sm:h-[380px] lg:h-[460px]">
              <StrandsReveal durationMs={2800} onComplete={() => setRevealComplete(true)} />
            </div>
          ) : (
            /* ── Revealed: card floating on dark backdrop, no modal box ── */
            <div className="flex flex-col items-center justify-center h-full w-full">

              {/* Heading / subheading */}
              <div ref={headerRef} className="shrink-0 text-center mb-4 cuml-header">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                  You earned it. Share it.
                </h2>
                <p className="text-white/55 text-sm">
                  You unlocked{" "}
                  <span className="text-[#00a9ff] font-semibold">
                    {certificate.milestoneTitle}
                  </span>
                  .
                </p>
              </div>

              {/* Certificate — bare, no wrapper box */}
              <div ref={previewAreaRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
                <div className="relative flex justify-center items-center">

                  {/* Star burst particles */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const dist = 80 + (i % 3) * 30;
                    const sx = Math.round(Math.cos(angle) * dist);
                    const sy = Math.round(Math.sin(angle) * dist);
                    const colors = ["#00a9ff", "#f59e0b", "#ffffff", "#00a9ff"];
                    const size = 5 + (i % 3) * 3;
                    return (
                      <div
                        key={i}
                        className="cuml-star"
                        style={{
                          "--sx": `${sx}px`,
                          "--sy": `${sy}px`,
                          "--sd": `${i * 0.035}s`,
                          width: size,
                          height: size,
                          background: colors[i % colors.length],
                          top: "50%",
                          left: "50%",
                          marginTop: -size / 2,
                          marginLeft: -size / 2,
                        }}
                      />
                    );
                  })}

                  {/* Card — spring entrance + shimmer */}
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] cuml-card-spring"
                    style={{
                      width: `${scaledWidth}px`,
                      height: `${scaledHeight}px`,
                      minWidth: `${scaledWidth}px`,
                      minHeight: `${scaledHeight}px`,
                      maxWidth: "100%",
                    }}
                  >
                    <div
                      className="absolute top-0 left-0"
                      style={{
                        width: `${CERTIFICATE_WIDTH}px`,
                        height: `${CERTIFICATE_HEIGHT}px`,
                        transform: `scale(${previewScale})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <CertificateCanvas
                        certificate={certificate}
                        canvasId={canvasId}
                      />
                    </div>

                    {/* Golden shimmer sweep — one-shot on reveal */}
                    <div
                      className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent cuml-shimmer-track" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status / helper text */}
              <div ref={helperRef} className="shrink-0 mt-3 text-center text-xs text-white/40 min-h-[1.25rem]">
                {shareMessage ? (
                  <span className="inline-block bg-[#00a9ff]/15 text-[#00a9ff] border border-[#00a9ff]/25 px-3 py-1 rounded-full font-medium">
                    {shareMessage}
                  </span>
                ) : (
                  "Caption copied automatically when you share."
                )}
              </div>

              {/* ── Icon-only action buttons — below the card ──────── */}
              <div
                ref={footerRef}
                className="shrink-0 mt-5 mb-1 flex items-center justify-center gap-5 cuml-footer"
              >
                {/* Download — white pill */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    aria-label="Download card"
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-[#19183b] shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-[transform,box-shadow] duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    {downloading ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-[11px] font-semibold text-white/45 tracking-wide uppercase">Save</span>
                </div>

                {/* Share — cyan pill */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={sharing}
                    aria-label="Share card"
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-[#00a9ff] text-white shadow-[0_4px_16px_rgba(0,169,255,0.45)] hover:shadow-[0_8px_28px_rgba(0,169,255,0.55)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-[transform,box-shadow] duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a9ff]/50"
                  >
                    {sharing ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <Share2 className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-[11px] font-semibold text-white/45 tracking-wide uppercase">Share</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
