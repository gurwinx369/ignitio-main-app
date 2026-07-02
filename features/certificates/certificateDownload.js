import { toPng } from 'html-to-image';
import { CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT } from './CertificateCanvas';

export async function downloadCertificateAsPng(elementId, certificateKey) {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2, // higher resolution
      style: {
        transform: 'scale(1)', // Ensure it renders at actual size
        transformOrigin: 'top left',
        width: `${CERTIFICATE_WIDTH}px`,
        height: `${CERTIFICATE_HEIGHT}px`,
      },
    });

    const link = document.createElement('a');
    link.download = `ignitio-${certificateKey}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('Error generating certificate image', err);
    return false;
  }
}
