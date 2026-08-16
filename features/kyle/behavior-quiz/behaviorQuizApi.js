// features/kyle/behavior-quiz/behaviorQuizApi.js
//
// Thin, stateless API helpers for the behavior quiz pipeline.
// No state, no side effects — pure async functions.

export class BehaviorQuizApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "BehaviorQuizApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(res) {
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // payload remains null
  }

  if (!res.ok) {
    const message = payload?.error || "Behavior quiz API request failed";
    throw new BehaviorQuizApiError(message, res.status, payload);
  }

  return payload;
}

/**
 * Trigger a behavioral quiz after a completed roadmap level.
 * The client sends only the level identity.
 * Canonical concept/transcript context is resolved server-side.
 *
 * @returns {{ fired: boolean, sessionId?: string, quizItems?: Array, resumed?: boolean }}
 * @throws {BehaviorQuizApiError} on non-2xx response
 * @throws {Error} on network failure
 */
export async function triggerBehaviorQuiz({ user, levelId, roadmapId }) {
  if (!user || !levelId || !roadmapId) return null;

  const token = await user.getIdToken();
  const res = await fetch("/api/v2/kyle/behavior-quiz/trigger", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ levelId, roadmapId }),
  });

  return parseResponse(res);
}

/**
 * Submits all collected quiz responses for a session (fire-and-forget).
 *
 * @returns {{ conceptVerdicts: object }}
 * @throws {BehaviorQuizApiError} on non-2xx response
 * @throws {Error} on network failure
 */
export async function submitBehaviorQuiz({ user, sessionId, submittedAttempts }) {
  if (!user || !sessionId || !submittedAttempts?.length) return null;

  const token = await user.getIdToken();
  const res = await fetch("/api/v2/kyle/behavior-quiz/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, submittedAttempts }),
  });

  return parseResponse(res);
}
