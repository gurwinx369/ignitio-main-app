import React, { useState } from 'react';
import { useAuth } from "@/features/context/AuthContext";
import { Flame, Lightbulb, Clock } from 'lucide-react';
import { resolveCertificateTemplate } from "./certificateTemplateResolver";

export const CERTIFICATE_WIDTH = 735;
export const CERTIFICATE_HEIGHT = 934;


const TEMPLATE_TEXT_POSITIONS = {
  providedOn: { top: 53, left: 594, width: 900 },
  day: { top: 660, left: 125, width: 120 },
  quizzes: { top: 660, left: 515, width: 80 },
  minutes: { top: 790, left: 300, width: 110 },
};

export default function CertificateCanvas({ certificate, canvasId }) {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);

  const displayName =
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Ignitio Learner';

  const dateStr = new Date(certificate.unlockedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const meta = certificate.metadata || {};
  const providedOn = certificate.providedOn || meta.providedOn || dateStr;

  // Fallbacks for backward compatibility
  const certificateDayMatch = certificate.certificateKey?.match(/\d+/);
  const fallbackDayNumber = certificateDayMatch
    ? Number.parseInt(certificateDayMatch[0], 10)
    : 1;

  const dayNumber = certificate.dayNumber ?? meta.dayNumber ?? fallbackDayNumber;
  const quizCount = certificate.quizCompletedCount ?? meta.quizCompletedCount ?? 0;
  const duration = certificate.durationMinutes ?? meta.durationMinutes ?? 0;

  const labelText = certificate.certificateKey === "dsa-level-1" ? "Level 1" : `Day ${dayNumber}`;

  const resolvedTemplate = resolveCertificateTemplate(certificate);

  return (
    <div
      id={canvasId}
      className={`relative overflow-hidden ${imgError ? 'bg-[#19183b]' : 'bg-transparent'}`}
      style={{
        width: `${CERTIFICATE_WIDTH}px`,
        height: `${CERTIFICATE_HEIGHT}px`,
        boxSizing: 'border-box',
      }}
    >
      {!imgError && (
        <>
          <img
            src={`/certificates/templates/${resolvedTemplate}`}
            alt="Certificate Background"
            className="absolute inset-0 w-full h-full -z-10"
            style={{ objectFit: 'fill' }}
            onError={() => setImgError(true)}
          />
          {!certificate.certificateKey?.endsWith("-level-1") && (
            <>
              <div className="absolute z-10" style={{ ...TEMPLATE_TEXT_POSITIONS.providedOn, fontSize: '21px', fontWeight: 800, color: '#111111', textAlign: 'left', lineHeight: 1 }}>
                {providedOn}
              </div>
              <div className="absolute z-10" style={{ ...TEMPLATE_TEXT_POSITIONS.day, fontSize: '17px', fontWeight: 900, color: '#111111', textAlign: 'center', lineHeight: 1 }}>
                {labelText}
              </div>
              <div className="absolute z-10" style={{ ...TEMPLATE_TEXT_POSITIONS.quizzes, fontSize: '18px', fontWeight: 900, color: '#111111', textAlign: 'center', lineHeight: 1 }}>
                {quizCount}
              </div>
              <div className="absolute z-10" style={{ ...TEMPLATE_TEXT_POSITIONS.minutes, fontSize: '18px', fontWeight: 900, color: '#111111', textAlign: 'center', lineHeight: 1 }}>
                {duration} min
              </div>
            </>
          )}
        </>
      )}

      {imgError && (
        <>
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center -z-10 border-8 border-[#00a9ff] bg-[#19183b]">
            <div className="absolute top-10 right-10 text-[#00a9ff] font-bold text-3xl">Ignitio</div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white z-10">
            <h2 className="text-4xl font-semibold tracking-widest uppercase text-[#00a9ff] mb-4">
              Certificate of Achievement
            </h2>

            <p className="text-2xl text-gray-300 mb-8">This is to certify that</p>

            <h1 className="text-7xl font-bold text-white mb-6">
              {displayName}
            </h1>

            <p className="text-2xl text-gray-300 mb-8">has successfully completed</p>

            <h3 className="text-5xl font-semibold text-[#f59e0b] mb-12">
              {certificate.milestoneTitle}
            </h3>

            <div className="flex w-full justify-between items-center px-12 mt-10 bg-black/30 backdrop-blur-sm rounded-2xl py-6 border border-white/10">
              <div className="flex flex-col items-center">
                <p className="text-xl font-bold text-white mb-1">
                  {providedOn}
                </p>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Provided On</p>
              </div>

              <div className="w-px h-12 bg-white/20"></div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-xl font-bold text-white">{labelText}</p>
              </div>

              <div className="w-px h-12 bg-white/20"></div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-xl font-bold text-white">
                  {quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'} completed
                </p>
              </div>

              <div className="w-px h-12 bg-white/20"></div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400/20 rounded-lg border border-blue-400/30">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-white">{duration} {duration === 1 ? 'Minute' : 'Minutes'} invested</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
