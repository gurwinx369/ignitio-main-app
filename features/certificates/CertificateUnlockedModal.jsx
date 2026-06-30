import React, { useState, useEffect, useRef } from 'react';
import { Download, Copy, Share2, X, MessageCircle, Instagram } from 'lucide-react';
import CertificateCanvas from './CertificateCanvas';
import { downloadCertificateAsPng } from './certificateDownload';
import { markCertificateDownloaded } from './certificateStorage';

const CERTIFICATE_WIDTH = 735;
const CERTIFICATE_HEIGHT = 934;

export default function CertificateUnlockedModal({ certificate, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const canvasId = `cert-canvas-${certificate.certificateKey}`;

  const previewWrapRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);


  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealComplete(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (!previewWrapRef.current) return;

      const parent = previewWrapRef.current.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();

      const availableWidth = rect.width - 24;
      const availableHeight = Math.min(window.innerHeight * 0.52, 560);

      const scale = Math.min(
        1,
        availableWidth / CERTIFICATE_WIDTH,
        availableHeight / CERTIFICATE_HEIGHT
      );

      setPreviewScale(scale);
    };

    if (revealComplete) {
      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }
  }, [revealComplete]);

  const handleDownload = async () => {
    setDownloading(true);
    const success = await downloadCertificateAsPng(canvasId, certificate.certificateKey);
    if (success) {
      markCertificateDownloaded(certificate.certificateKey, certificate.roadmapFamily);
    }
    setDownloading(false);
  };

  const shareUrl = "https://ignitio.cloud";

  const shareText = `I just completed ${certificate.milestoneTitle} on Ignitio 🚀
  
  Ignitio helps learners build real progress through structured roadmaps, XP, assignments, and AI mentor guidance.
  
  Start learning: ${shareUrl}`;

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (error) {
      console.error("Failed to copy share text", error);
      return false;
    }
  };

  const showShareMessage = (message) => {
    setShareMessage(message);
    setTimeout(() => {
      setShareMessage("");
    }, 2500);
  };

  const handleCopyCaption = async () => {
    const copied = await copyShareText();
    if (copied) {
      showShareMessage("Caption copied!");
    }
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareInstagram = async () => {
    const copied = await copyShareText();
    if (copied) {
      showShareMessage("Caption copied. Download the card and upload it to Instagram.");
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleShareDiscord = async () => {
    const copied = await copyShareText();
    if (copied) {
      showShareMessage("Caption copied. Paste it in Discord with your downloaded card.");
    }
    window.open("https://discord.com/channels/@me", "_blank", "noopener,noreferrer");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const scaledWidth = CERTIFICATE_WIDTH * previewScale;
  const scaledHeight = CERTIFICATE_HEIGHT * previewScale;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-[140] p-3 sm:p-4"
      onClick={handleBackdropClick}
    >
      <style>
        {`
          .treasure-box-container {
            perspective: 1000px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
            position: relative;
          }
          .treasure-box-body {
            width: 140px;
            height: 90px;
            background: linear-gradient(to bottom, #d4af37, #996515);
            border-radius: 8px;
            position: absolute;
            bottom: 60px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.6);
            border: 2px solid #5c4033;
            z-index: 10;
          }
          .treasure-lid {
            width: 140px;
            height: 45px;
            background: linear-gradient(to top, #d4af37, #b8860b);
            border-radius: 20px 20px 0 0;
            position: absolute;
            bottom: 150px;
            transform-origin: bottom;
            border: 2px solid #5c4033;
            animation: openLid 1s forwards ease-in-out;
            z-index: 15;
          }
          .treasure-glow {
            position: absolute;
            bottom: 100px;
            width: 120px;
            height: 20px;
            background: #ffdf00;
            box-shadow: 0 0 60px 40px #ffdf00;
            opacity: 0;
            animation: glowEffect 1.2s forwards;
            z-index: 12;
          }
          .treasure-card-rise {
            position: absolute;
            bottom: 90px;
            width: 100px;
            height: 127px;
            background: #fff;
            border-radius: 4px;
            opacity: 0;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: riseCard 1s forwards 0.4s;
            z-index: 11;
          }
          @keyframes openLid {
            0% { transform: rotateX(0deg); }
            100% { transform: rotateX(110deg); }
          }
          @keyframes glowEffect {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.7; transform: scale(1.5); }
          }
          @keyframes riseCard {
            0% { opacity: 0; transform: translateY(0) scale(0.5); }
            50% { opacity: 1; transform: translateY(-80px) scale(1); }
            100% { opacity: 0; transform: translateY(-160px) scale(1.3); }
          }
        `}
      </style>

      <div className="bg-[#19183b] border border-[#00a9ff]/30 rounded-xl max-w-[680px] w-full flex flex-col shadow-2xl relative max-h-[92dvh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close certificate modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-[160] bg-black/40 hover:bg-black/60 p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {!revealComplete ? (
          <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-bold text-white mb-8 text-center animate-pulse">Unlocking Milestone...</h2>
            <div className="treasure-box-container">
              <div className="treasure-glow"></div>
              <div className="treasure-card-rise"></div>
              <div className="treasure-lid"></div>
              <div className="treasure-box-body"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 sm:p-6 text-center border-b border-gray-800">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                🎉 Milestone Unlocked!
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                You earned a certificate for completing <span className="text-[#00a9ff] font-medium">{certificate.milestoneTitle}</span>.
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-black/40 flex justify-center">
              <div
                ref={previewWrapRef}
                className="relative shrink-0"
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
                  <CertificateCanvas certificate={certificate} canvasId={canvasId} />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {shareMessage && (
                <div className="mb-3 rounded-lg border border-[#00a9ff]/30 bg-[#00a9ff]/10 px-4 py-2 text-sm text-[#9ee7ff] text-center">
                  {shareMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 bg-[#00a9ff] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-[#00a9ff]/90 transition-colors disabled:opacity-50">
                  <Download className="w-5 h-5" />
                  {downloading ? "Downloading..." : "Download"}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="flex items-center justify-center gap-2 bg-gray-800 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  <Copy className="w-5 h-5" />
                  Copy Caption
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="flex items-center justify-center gap-2 bg-[#0a66c2] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-[#0a66c2]/90 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  LinkedIn
                </button>

                <button
                  type="button"
                  onClick={handleShareInstagram}
                  className="flex items-center justify-center gap-2 bg-pink-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </button>

                <button
                  type="button"
                  onClick={handleShareDiscord}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Discord
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="sm:col-span-2 flex items-center justify-center py-2.5 sm:py-3 px-4 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-gray-700"
                >
                  Later
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
