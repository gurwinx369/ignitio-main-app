const STORAGE_KEY = "ignitio:certificates";

export function getUnlockedCertificates() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse certificates from localStorage", error);
    return [];
  }
}

export function hasUnlockedCertificate(certificateKey, roadmapFamily) {
  const certificates = getUnlockedCertificates();
  return certificates.some(
    (c) => c.certificateKey === certificateKey && c.roadmapFamily === roadmapFamily
  );
}

export function saveUnlockedCertificate(certificate) {
  if (typeof window === "undefined") return false;
  
  const certificates = getUnlockedCertificates();
  
  const existingIndex = certificates.findIndex(
    (c) => c.certificateKey === certificate.certificateKey && c.roadmapFamily === certificate.roadmapFamily
  );

  if (existingIndex !== -1) {
    const existing = certificates[existingIndex];
    certificates[existingIndex] = {
      ...existing,
      ...certificate,
      unlockedAt: existing.unlockedAt || certificate.unlockedAt || new Date().toISOString(),
      downloaded: existing.downloaded || false,
      quizCompletedCount: Math.max(
        Number(existing.quizCompletedCount || 0),
        Number(certificate.quizCompletedCount || 0)
      ),
      durationMinutes: Math.max(
        Number(existing.durationMinutes || 0),
        Number(certificate.durationMinutes || 0)
      )
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
      return true;
    } catch (error) {
      console.error("Failed to save certificate to localStorage", error);
      return false;
    }
  }

  const newCertificate = {
    ...certificate,
    unlockedAt: certificate.unlockedAt || new Date().toISOString(),
    downloaded: false
  };

  certificates.push(newCertificate);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    return true;
  } catch (error) {
    console.error("Failed to save certificate to localStorage", error);
    return false;
  }
}

export function markCertificateDownloaded(certificateKey, roadmapFamily) {
  if (typeof window === "undefined") return;
  
  const certificates = getUnlockedCertificates();
  const index = certificates.findIndex(
    (c) => c.certificateKey === certificateKey && c.roadmapFamily === roadmapFamily
  );

  if (index !== -1) {
    certificates[index].downloaded = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    } catch (error) {
      console.error("Failed to update certificate downloaded state", error);
    }
  }
}
