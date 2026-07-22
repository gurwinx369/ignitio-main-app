// features/kyle/behavior-quiz/behaviorQuizApi.js
//
// Thin, stateless API helpers for the behavior quiz pipeline.
// No state, no side effects — pure async functions.

/**
 * Fires after a level is completed. Server decides whether the quiz triggers.
 * Client sends concept/transcript so the server doesn't need a DB lookup for it.
 *
 * @returns {{ fired: boolean, sessionId?: string, quizItems?: Array }} | null on network error
 */
export async function triggerBehaviorQuiz({ user, levelId, roadmapId, concept, transcriptContext, levelContext }) {
  if (!user || !levelId || !roadmapId) return null;

  try {
    const token = await user.getIdToken();
    const res = await fetch("/api/v2/kyle/behavior-quiz/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ levelId, roadmapId, concept, transcriptContext, levelContext }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Submits all collected quiz responses for a session (fire-and-forget).
 *
 * @returns {{ conceptVerdicts: object }} | null on failure
 */
export async function submitBehaviorQuiz({ user, sessionId, submittedAttempts }) {
  if (!user || !sessionId || !submittedAttempts?.length) return null;

  try {
    const token = await user.getIdToken();
    const res = await fetch("/api/v2/kyle/behavior-quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, submittedAttempts }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
