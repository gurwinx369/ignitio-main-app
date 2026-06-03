// Gemini client with sequential API key rotation on rate limit (429).
// Change KYLE_MODEL here to swap the underlying model everywhere in one line.
// Keys are read from env at startup. Add more by extending GEMINI_API_KEYS.

import { GoogleGenerativeAI } from "@google/generative-ai";

export const KYLE_MODEL = "gemini-2.5-flash";

// Rate-limit error codes returned by the Gemini SDK.
const RATE_LIMIT_CODES = new Set([429, "RESOURCE_EXHAUSTED", "429"]);

function isRateLimitError(err) {
  if (!err) return false;
  // SDK wraps errors with a status or a message containing the HTTP code.
  if (RATE_LIMIT_CODES.has(err.status)) return true;
  if (RATE_LIMIT_CODES.has(String(err.status))) return true;
  const msg = err.message ?? "";
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota");
}

// Build the ordered list of keys from env. Gaps are silently skipped.
function loadApiKeys() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_ONE,
    process.env.GEMINI_API_KEY_TWO,
    process.env.GEMINI_API_KEY_THREE,
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No Gemini API keys configured. Set at least GEMINI_API_KEY in your env.");
  }

  return keys;
}

// Rotation state — module-level so it persists across requests in the same process.
const API_KEYS = loadApiKeys();
let currentKeyIndex = 0;

// Lazily-created GoogleGenerativeAI instances, one per key slot.
const clients = new Array(API_KEYS.length).fill(null);

function getClientForIndex(index) {
  if (!clients[index]) {
    clients[index] = new GoogleGenerativeAI(API_KEYS[index]);
  }
  return clients[index];
}

function getCurrentClient() {
  return getClientForIndex(currentKeyIndex);
}

function rotateKey() {
  const previous = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return previous !== currentKeyIndex; // false when only one key exists
}

// Returns a proxy around the real Gemini model that transparently retries
// with the next key on rate-limit errors. Callers in kyle.service.js call
// model.generateContent(...) exactly as before — no changes needed there.
export function getModel() {
  function buildModel(keyIndex) {
    return getClientForIndex(keyIndex).getGenerativeModel({ model: KYLE_MODEL });
  }

  const handler = {
    get(_, prop) {
      // Proxy only generateContent — every other property passes through directly.
      if (prop !== "generateContent") {
        return buildModel(currentKeyIndex)[prop];
      }

      return async function generateContentWithRotation(...args) {
        const startIndex = currentKeyIndex;

        // Attempt with each key at most once per call.
        for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
          const keyIndex = (startIndex + attempt) % API_KEYS.length;

          try {
            const result = await buildModel(keyIndex).generateContent(...args);
            // On success, commit the working key as current so the next call
            // starts from here rather than an exhausted key.
            currentKeyIndex = keyIndex;
            return result;
          } catch (err) {
            if (!isRateLimitError(err)) {
              // Non-rate-limit error — surface it immediately, no rotation.
              throw err;
            }

            const nextIndex = (keyIndex + 1) % API_KEYS.length;
            const hasNextKey = nextIndex !== startIndex || attempt < API_KEYS.length - 1;

            if (hasNextKey && attempt < API_KEYS.length - 1) {
              // Advance the global pointer so subsequent parallel calls also
              // start from the next key.
              currentKeyIndex = nextIndex;
            } else {
              // All keys exhausted for this request.
              throw new Error(
                `All ${API_KEYS.length} Gemini API key(s) hit rate limits. ` +
                  "Please wait before retrying."
              );
            }
          }
        }
      };
    },
  };

  return new Proxy({}, handler);
}
