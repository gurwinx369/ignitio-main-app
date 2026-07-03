export async function sendRetentionEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RETENTION_FROM_EMAIL;

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  if (!fromEmail) {
    throw new Error('Missing RETENTION_FROM_EMAIL environment variable');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Ignitio-Retention/1.0',
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.id; // Return the provider message ID
}
