// Shared server-side client for Kyle FastAPI service.
// Import "server-only" to guarantee this module never ships to the browser bundle.
// Handles: auth forwarding, timeouts, sanitized error surfaces, safe JSON parsing.

import "server-only";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 45_000;

function getBaseUrl() {
  const raw = (process.env.FASTAPI_BASE_URL ?? "").trim();
  if (!raw) {
    // Treated as a request-time configuration failure — not a startup crash.
    // Sanitized message: no env-variable names or values reach the browser.
    throw new KyleFastApiError(
      "Kibo service is not configured",
      500
    );
  }
  // Remove trailing slashes so path concatenation is always predictable.
  return raw.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class KyleFastApiError extends Error {
  /**
   * @param {string}  message          - Sanitized message safe to return to browser.
   * @param {number}  status           - HTTP status to forward to the browser (500/502/504/etc.).
   * @param {number}  [upstreamStatus] - Raw HTTP status from FastAPI, for server logs only.
   */
  constructor(message, status, upstreamStatus) {
    super(message);
    this.name = "KyleFastApiError";
    this.status = status;
    this.upstreamStatus = upstreamStatus ?? null;
  }
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

/**
 * Calls the Kyle FastAPI service from a Next.js Route Handler.
 *
 * The AbortController timeout spans the full upstream operation:
 *   fetch() → status check → response.text() → JSON.parse()
 * clearTimeout is called once, only after the entire operation succeeds or fails.
 *
 * @param {object}  opts
 * @param {Request} opts.request       - The incoming Next.js request (for Authorization).
 * @param {string}  opts.path          - FastAPI path, e.g. "/api/v1/quiz/generate".
 * @param {object}  opts.body          - JSON-serialisable request body.
 * @param {number}  [opts.timeoutMs]   - Abort timeout in ms. Defaults to 45 000.
 *
 * @returns {Promise<object>} Parsed JSON from FastAPI on success.
 * @throws  {KyleFastApiError}         Always throws a KyleFastApiError on any failure.
 */
export async function callKyleFastApi({ request, path, body, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  // --- Require a Bearer token before touching the network ---
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // This branch should be unreachable if the route already ran verifyFirebaseToken,
    // but we guard defensively so the client never silently omits auth.
    throw new KyleFastApiError("Missing or malformed Authorization header", 401);
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  // --- Bounded timeout: active across fetch + body reading + JSON parse ---
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Step 1 — network round-trip
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward the exact Firebase ID token the browser sent to Next.js.
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (fetchErr) {
      if (fetchErr?.name === "AbortError") {
        console.error("[kyle-fastapi.client] Request timed out after", timeoutMs, "ms:", path);
        throw new KyleFastApiError("Kibo request timed out", 504);
      }
      // Network-level failure (ECONNREFUSED, DNS, etc.) — message is safe to log.
      console.error("[kyle-fastapi.client] Connection error:", path, fetchErr?.message);
      throw new KyleFastApiError("Kibo service is unreachable", 502);
    }

    // Step 2 — status check (still inside the active timeout)
    if (!response.ok) {
      // Log upstream status only — never forward the body to the browser.
      console.error(
        "[kyle-fastapi.client] Upstream error:",
        path,
        "status:", response.status
      );
      throw new KyleFastApiError("Kibo returned an error", 502, response.status);
    }

    // Step 3 — body reading (still inside the active timeout)
    let text;
    try {
      text = await response.text();
    } catch (readErr) {
      if (readErr?.name === "AbortError") {
        console.error("[kyle-fastapi.client] Body read timed out after", timeoutMs, "ms:", path);
        throw new KyleFastApiError("Kibo request timed out", 504);
      }
      console.error("[kyle-fastapi.client] Body read error:", path, readErr?.message);
      throw new KyleFastApiError("Kibo returned an unreadable response", 502, response.status);
    }

    if (!text || !text.trim()) {
      console.error("[kyle-fastapi.client] Empty response body from:", path);
      throw new KyleFastApiError("Kibo returned an empty response", 502, response.status);
    }

    // Step 4 — JSON parse (still inside the active timeout)
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      console.error("[kyle-fastapi.client] JSON parse error from:", path, parseErr?.message);
      throw new KyleFastApiError("Kibo returned a malformed response", 502, response.status);
    }

    return json;
  } finally {
    // Clear exactly once — after the entire operation has succeeded or failed.
    clearTimeout(timeoutId);
  }
}
