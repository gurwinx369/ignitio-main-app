/**
 * Free-path mastery classifier.
 *
 * A skill is excluded from the roadmap ONLY when all three of its
 * diagnostic answers return "mastery". Any other combination keeps the
 * full skill in — this is the binary include/exclude rule from the spec.
 *
 * The classifier is deliberately simple: we do not implement the full
 * LLR Bayesian model here because the free-path questions use explicit
 * answer-level verdict tags, so we can read the verdict directly.
 *
 * ponytail: no Bayesian math needed — verdict is embedded in the question
 * bank. Add LLR scoring here if future questions need it.
 */

import { QUESTIONS_BY_SKILL, SKILL_ORDER } from "./free-path-questions";

/**
 * @param {string} questionId
 * @param {string} answeredValue   the option value the user selected
 * @returns {"mastery" | "developing" | "gap" | "unanswered"}
 */
function getAnswerVerdict(questionId, answeredValue) {
  if (!answeredValue) return "unanswered";

  // Find the question across all skills
  const question = Object.values(QUESTIONS_BY_SKILL)
    .flat()
    .find((q) => q.id === questionId);

  if (!question) return "unanswered";

  const option = question.options.find((o) => o.value === answeredValue);
  return option?.verdict ?? "unanswered";
}

/**
 * Classify a single skill based on the three answers the user gave.
 *
 * @param {string} skillId
 * @param {Record<string, string>} answers  — { questionId: selectedValue }
 * @returns {{ verdict: "mastery" | "developing" | "gap" | "insufficient", exclude: boolean }}
 */
function classifySkill(skillId, answers) {
  const questions = QUESTIONS_BY_SKILL[skillId] ?? [];

  if (questions.length === 0) {
    return { verdict: "insufficient", exclude: false };
  }

  const verdicts = questions.map((q) => getAnswerVerdict(q.id, answers[q.id]));

  // Edge case: any unanswered question → always include
  if (verdicts.includes("unanswered")) {
    return { verdict: "insufficient", exclude: false };
  }

  const allMastery = verdicts.every((v) => v === "mastery");

  if (allMastery) {
    return { verdict: "mastery", exclude: true };
  }

  const hasGap = verdicts.some((v) => v === "gap");
  return {
    verdict: hasGap ? "gap" : "developing",
    exclude: false,
  };
}

/**
 * Run the full free-path classifier across all 4 skills.
 *
 * @param {Record<string, string>} answers  — { questionId: selectedValue }
 * @returns {Array<{ skillId: string, verdict: string, include: boolean }>}
 */
export function classifyFreePathSkills(answers) {
  return SKILL_ORDER.map((skillId) => {
    const { verdict, exclude } = classifySkill(skillId, answers);
    return { skillId, verdict, include: !exclude };
  });
}

/**
 * Derive the final ordered roadmap from the classifier results.
 * Skills with include=true appear in spec order (Git → Python → Prompt → SD).
 *
 * @param {Array<{ skillId: string, include: boolean }>} results
 * @returns {string[]} ordered skill IDs to include
 */
export function buildFreeRoadmap(results) {
  return results.filter((r) => r.include).map((r) => r.skillId);
}
