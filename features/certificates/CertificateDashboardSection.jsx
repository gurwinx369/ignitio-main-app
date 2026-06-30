import React, { useEffect, useState } from 'react';
import { getUnlockedCertificates } from './certificateStorage';
import CertificateCard from './CertificateCard';

export default function CertificateDashboardSection() {
  const [certificates, setCertificates] = useState([]);

  const loadCertificates = () => {
    const certs = getUnlockedCertificates();
    // Sort by unlocked date, newest first
    certs.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    setCertificates(certs);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  if (certificates.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">My Cards</h2>
        <span className="bg-[#00a9ff]/10 text-[#00a9ff] text-sm font-semibold px-3 py-1 rounded-full">
          {certificates.length} {certificates.length === 1 ? 'Earned' : 'Earned'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {certificates.map((cert) => (
          <CertificateCard
            key={`${cert.roadmapFamily}-${cert.certificateKey}`}
            certificate={cert}
            onUpdate={loadCertificates}
          />
        ))}
      </div>
    </div>
  );
}
