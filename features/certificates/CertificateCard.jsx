import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';
import { downloadCertificateAsPng } from './certificateDownload';
import { markCertificateDownloaded } from './certificateStorage';
import CertificateCanvas from './CertificateCanvas';

export default function CertificateCard({ certificate, onUpdate }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasId = `dash-cert-${certificate.certificateKey}`;

  const dateStr = new Date(certificate.unlockedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownload = async () => {
    setDownloading(true);
    const success = await downloadCertificateAsPng(canvasId, certificate.certificateKey);
    if (success) {
      markCertificateDownloaded(certificate.certificateKey, certificate.roadmapFamily);
      if (onUpdate) onUpdate();
    }
    setDownloading(false);
  };

  const handleCopyCaption = () => {
    const caption = `I just completed a milestone on Ignitio 🚀\n\nIgnitio helps learners build real progress through structured roadmaps, XP, assignments, and AI mentor guidance.\n\nStart learning: https://ignitio.cloud`;
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Hidden Canvas for generation */}
      <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
        <CertificateCanvas certificate={certificate} canvasId={canvasId} />
      </div>

      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#00a9ff]/10 text-[#00a9ff] rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
          </div>
          {certificate.downloaded ? (
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Saved
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
              New
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
          {certificate.milestoneTitle}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{certificate.roadmapTitle}</p>

        <p className="text-xs text-gray-400 font-medium">Unlocked: {dateStr}</p>
      </div>

      <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          {downloading ? '...' : 'Download'}
        </button>
        <button
          onClick={handleCopyCaption}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          title="Copy sharing caption"
        >
          {copied ? (
            <span className="text-green-600 font-semibold px-1">Copied!</span>
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
