import crypto from "crypto";

/**
 * Constant-time string equality check to mitigate timing attacks.
 * Safe against null, undefined, non-strings, and unequal buffer lengths.
 *
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 * @returns {boolean}
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

export default timingSafeEqual;
