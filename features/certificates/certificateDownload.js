import { toPng, toBlob } from 'html-to-image';
import { CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT } from './CertificateCanvas';

const renderOptions = {
  cacheBust: true,
  pixelRatio: 2,
  style: {
    transform: 'scale(1)',
    transformOrigin: 'top left',
    width: `${CERTIFICATE_WIDTH}px`,
    height: `${CERTIFICATE_HEIGHT}px`,
  },
};

/**
 * Generate a high-resolution PNG Blob from a certificate canvas element.
 * @param {string} elementId – DOM id of the certificate element
 * @returns {Promise<Blob|null>}
 */
export async function generateCertificatePngBlob(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    const blob = await toBlob(element, renderOptions);
    return blob ?? null;
  } catch (err) {
    console.error('Error generating certificate blob', err);
    return null;
  }
}

/**
 * Download the certificate as a PNG file.
 * @param {string} elementId – DOM id of the certificate element
 * @param {string} certificateKey – used in the filename
 * @returns {Promise<boolean>}
 */
export async function downloadCertificateAsPng(elementId, certificateKey) {
  const blob = await generateCertificatePngBlob(elementId);
  if (!blob) return false;

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `ignitio-${certificateKey}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error downloading certificate image', err);
    return false;
  }
}
