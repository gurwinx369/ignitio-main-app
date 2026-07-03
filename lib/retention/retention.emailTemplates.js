export function getRetentionEmailTemplate(campaignKey, { firstName, appBaseUrl, unsubscribeLink }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';

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
        return { src: `${normalizedBase}/email/retention-nudge-1.png`, alt: 'Ignitio roadmap reminder' };
      case 'retention_nudge_2':
        return { src: `${normalizedBase}/email/retention-nudge-2.png`, alt: 'Ignitio learning progress reminder' };
      case 'retention_nudge_3':
        return { src: `${normalizedBase}/email/retention-nudge-3.png`, alt: 'Ignitio continue learning reminder' };
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
      subject = 'Your next step is waiting on Ignitio';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          ${heroHtml}
          <p>${greeting}</p>
          <p>You started a learning path on Ignitio, and your next step is still waiting for you.</p>
          <p>No pressure — even one small lesson or assignment today can keep your progress moving in the right direction.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appBaseUrl}/home" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resume Learning</a>
          </div>
          <p>Keep going,<br>The Ignitio Team</p>
          ${footer}
        </div>
      `;
      break;

    case 'retention_nudge_2':
      subject = 'A small push to keep your momentum alive';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          ${heroHtml}
          <p>${greeting}</p>
          <p>Your roadmap has already started building structure for you. Now the main thing is to not let the gap become too wide.</p>
          <p>Open Ignitio, complete one focused step, and let the momentum come back. Small progress still counts.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appBaseUrl}/home" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Continue Progress</a>
          </div>
          <p>You have this,<br>The Ignitio Team</p>
          ${footer}
        </div>
      `;
      break;

    case 'retention_nudge_3':
      subject = 'Kyle saved your roadmap for you';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          ${heroHtml}
          <p>${greeting}</p>
          <p>Kyle noticed you have been away from your learning roadmap for a while.</p>
          <p>Your progress is still saved. Your next lesson is still there. You do not need to restart — just return and take the next step when you are ready.</p>
          <p>Learning becomes easier when you come back before the habit fades completely.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appBaseUrl}/home" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Return to Ignitio</a>
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
