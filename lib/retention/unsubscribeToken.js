import crypto from 'crypto';

export function createUnsubscribeToken(user) {
  const secret = process.env.RETENTION_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error('Missing RETENTION_UNSUBSCRIBE_SECRET environment variable');
  }

  const payload = user._id.toString();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  // Token format: payload.signature
  const token = `${payload}.${signature}`;
  
  // Base64 encode for safe URL usage
  return Buffer.from(token).toString('base64');
}

export function verifyUnsubscribeToken(token) {
  const secret = process.env.RETENTION_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error('Missing RETENTION_UNSUBSCRIBE_SECRET environment variable');
  }

  try {
    const decodedToken = Buffer.from(token, 'base64').toString('utf8');
    const parts = decodedToken.split('.');
    
    if (parts.length !== 2) {
      return null; // Invalid format
    }

    const [payload, signature] = parts;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (isSignatureValid) {
      return payload; // Returns the user ID
    }
    
    return null;
  } catch (error) {
    return null; // Failed to parse or verify
  }
}
