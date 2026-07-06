import { generateCertificatePngBlob, downloadCertificateAsPng } from "./certificateDownload";
import { markCertificateDownloaded } from "./certificateStorage";

const shareUrl = "https://ignitio.cloud";

export const generateShareText = (milestoneTitle) => {
  return (
    `I just completed ${milestoneTitle} on Ignitio 🚀\n\n` +
    `Ignitio helps learners build real progress through structured roadmaps, XP, assignments, and AI mentor guidance.\n\n` +
    `Start learning: ${shareUrl}`
  );
};

export const copyCaption = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Handles the unified sharing logic for certificates.
 * @param {Object} options
 * @param {string} options.canvasId - DOM ID of the canvas
 * @param {Object} options.certificate - Certificate data object
 * @param {Function} options.onMessage - Callback to show status message
 * @returns {Promise<void>}
 */
export const shareCertificate = async ({ canvasId, certificate, onMessage }) => {
  const shareText = generateShareText(certificate.milestoneTitle);
  
  // 1. Copy caption first
  const copied = await copyCaption(shareText);

  // 2. Generate PNG blob
  const blob = await generateCertificatePngBlob(canvasId);

  try {
    if (blob && navigator.share) {
      const file = new File(
        [blob],
        `ignitio-${certificate.certificateKey}.png`,
        { type: "image/png" }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Native share with file
        await navigator.share({
          title: "Ignitio Achievement",
          text: shareText,
          url: shareUrl,
          files: [file],
        });
      } else {
        // Native share without file
        await navigator.share({
          title: "Ignitio Achievement",
          text: shareText,
          url: shareUrl,
        });
      }
    } else {
      // No native share – download card + notify
      if (blob) {
        await downloadCertificateAsPng(canvasId, certificate.certificateKey);
        markCertificateDownloaded(
          certificate.certificateKey,
          certificate.roadmapFamily
        );
      }
      if (onMessage) {
        onMessage(copied ? "Caption copied. Card downloaded." : "Card downloaded.");
      }
    }
  } catch (err) {
    if (err?.name === "AbortError") {
      // User cancelled native share
      if (copied && onMessage) onMessage("Caption copied.");
    } else {
      // Generic failure – fallback
      console.error("Share failed", err);
      try {
        await downloadCertificateAsPng(canvasId, certificate.certificateKey);
        markCertificateDownloaded(
          certificate.certificateKey,
          certificate.roadmapFamily
        );
        if (onMessage) {
          onMessage(copied ? "Caption copied. Card downloaded." : "Card downloaded.");
        }
      } catch {
        if (copied && onMessage) onMessage("Caption copied.");
      }
    }
  }
};
