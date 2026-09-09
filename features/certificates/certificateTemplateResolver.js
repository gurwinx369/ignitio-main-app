import {
    getCertificateTemplateByKey,
    getKnownCertificateTemplates,
} from "./certificateMilestones.js";

const DEFAULT_CERTIFICATE_KEY = "prompt-day-1";

const DEFAULT_TEMPLATE =
    getCertificateTemplateByKey(DEFAULT_CERTIFICATE_KEY) ||
    "prompt-day-1.png";

const KNOWN_TEMPLATES = new Set(
    getKnownCertificateTemplates()
);

/**
 * Resolves the canonical template for any certificate shape.
 *
 * Priority:
 * 1. Canonical certificateKey/dayId from certificate rules
 * 2. Known explicit template/imageKey
 * 3. Legacy extensionless imageKey
 * 4. Default template
 */
export function resolveCertificateTemplate(cert) {
    if (!cert) {
        return DEFAULT_TEMPLATE;
    }

    const identity =
        cert.certificateKey ||
        cert.dayId ||
        "";

    // Canonical certificate definition always wins.
    const canonicalTemplate =
        getCertificateTemplateByKey(identity);

    if (canonicalTemplate) {
        return canonicalTemplate;
    }

    // Backward compatibility for localStorage / Mongo shapes.
    const explicitTemplate =
        cert.template ||
        cert.imageKey ||
        "";

    if (KNOWN_TEMPLATES.has(explicitTemplate)) {
        return explicitTemplate;
    }

    // Legacy extensionless imageKey:
    // "c-course-milestone" -> "c-course-milestone.jpg"
    if (
        typeof cert.imageKey === "string" &&
        cert.imageKey
    ) {
        const legacyMatch = [...KNOWN_TEMPLATES].find(
            (template) =>
                template.replace(/\.[^.]+$/, "") === cert.imageKey
        );

        if (legacyMatch) {
            return legacyMatch;
        }
    }

    return DEFAULT_TEMPLATE;
}