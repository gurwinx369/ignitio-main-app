// lib/analytics/serverAnalytics.ts
// Node.js server-side PostHog client for capturing exceptions and server events.

import { PostHog } from 'posthog-node';

let serverPostHog: PostHog | null = null;

export function getServerPostHog(): PostHog | null {
  if (serverPostHog) return serverPostHog;

  const key = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    'https://us.i.posthog.com';

  if (!key) return null;

  try {
    serverPostHog = new PostHog(key, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
    return serverPostHog;
  } catch {
    return null;
  }
}

/**
 * Capture an authoritative server-side event after database commit succeeds.
 * In serverless runtimes, flush ensures the event is dispatched immediately.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, any> = {}
): Promise<void> {
  const client = getServerPostHog();
  if (!client || !distinctId) return;

  try {
    client.capture({
      distinctId,
      event,
      properties,
    });
    // Flush immediately in serverless/short-lived execution contexts
    await client.flush().catch(() => {});
  } catch (e) {
    console.warn(`Failed to capture server event ${event} in PostHog:`, e);
  }
}

export function captureServerException(
  error: unknown,
  distinctId: string = 'anonymous',
  properties: Record<string, any> = {}
): void {
  const client = getServerPostHog();
  if (!client) return;

  try {
    const err = error instanceof Error ? error : new Error(String(error));
    client.capture({
      distinctId,
      event: '$exception',
      properties: {
        $exception_message: err.message,
        $exception_type: err.name,
        $exception_stack_trace_raw: err.stack,
        ...properties,
      },
    });
  } catch (e) {
    console.warn('Failed to capture server exception in PostHog:', e);
  }
}
