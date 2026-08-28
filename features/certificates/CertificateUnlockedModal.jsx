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

    const id = window.setTimeout(() => {
      setRevealComplete(true);
    }, 0);

    return () => window.clearTimeout(id);
  }, [prefersReducedMotion]);

  /* ─── Preview scale ──────────────────────────────────────── */
  const updateScale = useCallback(() => {
    if (!panelRef.current || !previewAreaRef.current) return;

    // Use actual dimensions instead of guessing.
    // If some elements aren't rendered yet, provide safe fallbacks.
    const panelHeight = panelRef.current.getBoundingClientRect().height;
    
    // We assume panelHeight is physically constrained by the browser via max-h.
    // The amount of height available for the image is the panel minus the text & footer.
    const headerHeight = headerRef.current ? headerRef.current.getBoundingClientRect().height : 70;
    const helperHeight = helperRef.current ? helperRef.current.getBoundingClientRect().height : 30;
    const footerHeight = footerRef.current ? footerRef.current.getBoundingClientRect().height : 80;

    // Vertical padding inside the content area (pt-12 pb-3 = 15*4 = 60px padding)
    const verticalPadding = 60;
    
    // Math.max to prevent negative or tiny scales
    const availableHeight = Math.max(150, panelHeight - headerHeight - helperHeight - footerHeight - verticalPadding);
    
    const previewAreaWidth = previewAreaRef.current.getBoundingClientRect().width;
    const availableWidth = Math.max(150, previewAreaWidth - 24); // subtract small side margin

    const scale = Math.min(
      1,
      availableWidth / CERTIFICATE_WIDTH,
      availableHeight / CERTIFICATE_HEIGHT
    );
    
    setPreviewScale(Math.max(0.38, scale));
  }, []);

  useEffect(() => {
    if (!revealComplete) return;
    
    // Calculate right after reveal is complete.
    // Use requestAnimationFrame to ensure DOM elements (refs) are fully rendered.
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
      className="fixed inset-0 z-[140] flex items-center justify-center bg-[#19183b]/70 backdrop-blur-sm p-3 sm:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        /* certificate card entrance */
        .cuml-card-enter{
          animation:cuml-cardIn .45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes cuml-cardIn{
          0%{opacity:0;transform:scale(0.94) translateY(8px)}
          100%{opacity:1;transform:scale(1) translateY(0)}
        }
        @media(prefers-reduced-motion:reduce){
          .cuml-card-enter{animation:none !important;}
        }
      `}</style>

      {/* ── Modal panel ────────────────────────────────────── */}
      <div 
        ref={panelRef}
        className={`relative flex max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-[460px] flex-col overflow-hidden ${!revealComplete ? 'bg-transparent shadow-none border-none' : 'rounded-[2rem] bg-[#fffaf3] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#f1e4d2]'}`}
      >
        {/* ── Close button (only shown after reveal) ──────── */}
        {revealComplete && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate modal"
            className="absolute top-4 left-4 z-10 p-2 rounded-full transition-colors bg-white/70 text-[#19183b] hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ── Content Area ─────────────────────────────────── */}
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden ${!revealComplete ? 'p-0' : 'px-4 sm:px-5 pt-12 pb-3'}`}>
          {!revealComplete ? (
            /* ─── Achievement unlock reveal animation ────── */
            <div className="flex flex-col items-center justify-center w-full h-[300px] sm:h-[380px] lg:h-[460px]">
              <StrandsReveal durationMs={2800} onComplete={() => setRevealComplete(true)} />
            </div>
          ) : (
            /* ─── Revealed content ───────────────────────── */
            <div className="flex flex-col items-center justify-center h-full w-full cuml-card-enter">
              
              {/* heading/subheading */}
              <div ref={headerRef} className="shrink-0 text-center mb-3">
                <h2 className="text-lg sm:text-xl font-bold text-[#19183b] mb-1">
                  Share your achievement!
                </h2>
                <p className="text-slate-500 text-sm">
                  You unlocked{" "}
                  <span className="text-[#00a9ff] font-medium">
                    {certificate.milestoneTitle}
                  </span>
                  .
                </p>
              </div>

              {/* certificate preview area */}
              <div ref={previewAreaRef} className="flex-1 min-h-0 w-full flex items-center justify-center">
                <div className="flex justify-center items-center bg-white border border-[#f1e4d2] shadow-sm rounded-xl p-2 sm:p-3">
                  <div
                    className="relative shrink-0 flex items-center justify-center"
                    style={{
                      width: `${scaledWidth}px`,
                      height: `${scaledHeight}px`,
                      minWidth: `${scaledWidth}px`,
                      minHeight: `${scaledHeight}px`,
                      maxWidth: "100%",
                      overflow: "hidden",
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
                  </div>
                </div>
              </div>

              {/* status / helper text */}
              <div ref={helperRef} className="shrink-0 mt-3 text-center text-xs text-slate-500 min-h-[1.25rem]">
                {shareMessage ? (
                  <span className="inline-block bg-[#00a9ff]/10 text-[#007bcc] border border-[#00a9ff]/20 px-2 py-0.5 rounded-full">{shareMessage}</span>
                ) : (
                  "Caption is copied automatically when you share."
                )}
              </div>

            </div>
          )}
        </div>

        {/* ── Bottom action bar (inside panel, not fixed) ── */}
        {revealComplete && (
          <div ref={footerRef} className="shrink-0 border-t border-[#f1e4d2] bg-[#fffaf3] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#19183b] text-white hover:bg-[#272762] h-12 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Downloading..." : "Download"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#19183b] border border-[#f1e4d2] hover:bg-[#fcf5ee] h-12 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm"
            >
              <Share2 className="w-4 h-4" />
              {sharing ? "Sharing..." : "Share"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
