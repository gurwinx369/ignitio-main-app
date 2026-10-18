function formatRoadmapName(slug) {
  if (!slug) return "your learning path";
  const map = {
    "python-beginner": "Python Beginner",
    "git-github": "Git & GitHub",
    "cpp": "C++ Programming",
    "c-language-course": "C Programming",
    "system-design-fundamentals": "System Design Fundamentals",
    "prompt-engineering": "Prompt Engineering",
    "dsa": "Data Structures & Algorithms",
  };
  return map[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getRetentionEmailTemplate(campaignKey, { firstName, appBaseUrl, unsubscribeLink, activeRoadmapSlug }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const roadmapName = formatRoadmapName(activeRoadmapSlug);

  const footer = `
    <br><br>
    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      You are receiving this email because you recently started learning on Ignitio. 
      <br>
      If you'd prefer not to receive these reminders, you can <a href="${unsubscribeLink}" style="color: #666; text-decoration: underline;">unsubscribe here</a>.
    </p>
  `;

  function normalizeBaseUrl(url) {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  function getRetentionHeroImage(key, base) {
    const normalizedBase = normalizeBaseUrl(base);
    switch (key) {
      case 'retention_nudge_1':
        return { src: `${normalizedBase}/email/retention-nudge-1.jpg`, alt: 'Ignitio roadmap reminder' };
      case 'retention_nudge_2':
        return { src: `${normalizedBase}/email/retention-nudge-2.jpg`, alt: 'Ignitio learning progress reminder' };
      case 'retention_nudge_3':
        return { src: `${normalizedBase}/email/retention-nudge-3.jpg`, alt: 'Ignitio continue learning reminder' };
      default:
        return null;
    }
  }

  const heroImageData = getRetentionHeroImage(campaignKey, appBaseUrl);
  const heroHtml = heroImageData
    ? `<img src="${heroImageData.src}" alt="${heroImageData.alt}" style="display: block; width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 20px;" />`
    : '';

  let subject = '';
  let html = '';

  switch (campaignKey) {
    case 'retention_nudge_1':
      subject = firstName ? `${firstName}, your next milestone in ${roadmapName} is waiting` : `Your next step in ${roadmapName} is waiting`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          ${heroHtml}
          <p>${greeting}</p>
          <p>You made great progress in <strong>${roadmapName}</strong> on Ignitio, and your next step is ready for you.</p>
          <p>No pressure — even one 5-minute lesson today keeps your streak burning and your momentum moving in the right direction.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appBaseUrl}/home" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Continue ${roadmapName}</a>
          </div>
          <p>Keep going,<br>The Ignitio Team</p>
          ${footer}
        </div>
      `;
      break;

    case 'retention_nudge_2':
      subject = `Protect your progress in ${roadmapName}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          ${heroHtml}
          <p>${greeting}</p>
          <p>Your <strong>${roadmapName}</strong> roadmap has already built valuable structure for you. Now the key is not letting the habit gap become too wide.</p>
          <p>Open Ignitio, complete one focused step or a quick 3-minute challenge with Kibo, and let your momentum return. Small progress still counts.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appBaseUrl}/home" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resume ${roadmapName}</a>
          </div>
          <p>You have this,<br>The Ignitio Team</p>
          ${footer}
        </div>
      `;
      break;

    case 'retention_nudge_3':
      subject = `Kibo saved your spot in ${roadmapName}`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          ${heroHtml}
          <p>${greeting}</p>
          <p>Kibo noticed you have been away from your <strong>${roadmapName}</strong> roadmap for a while.</p>
          <p>Your progress is completely safe and waiting right where you left off. You never have to restart — just return and take the next step whenever you are ready.</p>
          <p>Tech skills compound through small, steady steps. We are cheering for you!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appBaseUrl}/home" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Return to ${roadmapName}</a>
          </div>
          <p>We are keeping your roadmap ready,<br>The Ignitio Team</p>
          ${footer}
        </div>
      `;
      break;

    default:
      throw new Error(`Unknown campaign key: ${campaignKey}`);
  }

  return { subject, html };
}
