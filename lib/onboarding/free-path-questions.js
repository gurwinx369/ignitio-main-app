/**
 * Free-path diagnostic question bank.
 *
 * 4 skills × 3 questions = 12 cards total.
 * Question types per skill:
 *   1. predict-outcome   — simulate what happens
 *   2. diagnose-the-break — reason backward from a failure
 *   3. trade-off/why-not — justify a choice
 *
 * Answer verdicts:
 *   "mastery"    — correct
 *   "developing" — plausible but incomplete
 *   "gap"        — wrong for a recognisable reason
 */

export const SKILL_IDS = Object.freeze({
  GIT: "git",
  PYTHON: "python",
  PROMPT: "prompt",
  SYSTEM_DESIGN: "system_design",
});

export const SKILL_LABELS = Object.freeze({
  [SKILL_IDS.GIT]: "Git / GitHub",
  [SKILL_IDS.PYTHON]: "Python",
  [SKILL_IDS.PROMPT]: "Prompt Engineering",
  [SKILL_IDS.SYSTEM_DESIGN]: "System Design",
});

// Order matches the spec: Git → Python → Prompt Engineering → System Design
export const SKILL_ORDER = [
  SKILL_IDS.GIT,
  SKILL_IDS.PYTHON,
  SKILL_IDS.PROMPT,
  SKILL_IDS.SYSTEM_DESIGN,
];

export const FREE_PATH_QUESTIONS = [
  // ── Git / GitHub ────────────────────────────────────────────────────────────

  {
    id: "git_1",
    skill: SKILL_IDS.GIT,
    type: "predict",
    title: "What happens when you run `git merge feature` on the `main` branch?",
    options: [
      { value: "a", label: "Git replays `feature`'s commits on top of `main` (rebasing).", verdict: "gap" },
      { value: "b", label: "Git integrates `feature`'s changes into `main`, creating a merge commit if histories diverged.", verdict: "mastery" },
      { value: "c", label: "Git deletes the `feature` branch after combining.", verdict: "gap" },
      { value: "d", label: "Git fast-forwards `main` only if there are no new commits on `main`.", verdict: "developing" },
    ],
  },
  {
    id: "git_2",
    skill: SKILL_IDS.GIT,
    type: "diagnose",
    title: "You pushed to `main` but the remote rejected it with 'non-fast-forward'. What caused this?",
    options: [
      { value: "a", label: "Your commit message was invalid.", verdict: "gap" },
      { value: "b", label: "Someone else pushed commits to the remote after your last pull, so your history is behind.", verdict: "mastery" },
      { value: "c", label: "The remote branch is protected — no one can push directly.", verdict: "developing" },
      { value: "d", label: "You forgot to stage your files before committing.", verdict: "gap" },
    ],
  },
  {
    id: "git_3",
    skill: SKILL_IDS.GIT,
    type: "tradeoff",
    title: "A teammate says 'just rebase instead of merging — it keeps history clean'. When would you NOT rebase?",
    options: [
      { value: "a", label: "When you want a clear record of when features were integrated.", verdict: "developing" },
      { value: "b", label: "When the branch has already been pushed and others are working from it — rebasing rewrites history and breaks their work.", verdict: "mastery" },
      { value: "c", label: "When the branch has fewer than 5 commits.", verdict: "gap" },
      { value: "d", label: "Rebase is always safe — it never causes problems.", verdict: "gap" },
    ],
  },

  // ── Python ───────────────────────────────────────────────────────────────────

  {
    id: "python_1",
    skill: SKILL_IDS.PYTHON,
    type: "predict",
    title: "What does this print?",
    code: `def append_item(value, lst=[]):
    lst.append(value)
    return lst

print(append_item(1))
print(append_item(2))`,
    options: [
      { value: "a", label: "[1]  then  [2]", verdict: "gap" },
      { value: "b", label: "[1]  then  [1, 2]", verdict: "mastery" },
      { value: "c", label: "Error on the second call.", verdict: "gap" },
      { value: "d", label: "[1, 2]  on both lines.", verdict: "gap" },
    ],
  },
  {
    id: "python_2",
    skill: SKILL_IDS.PYTHON,
    type: "diagnose",
    title: "Your script crashes with `AttributeError: 'NoneType' has no attribute 'split'`. What's the most likely root cause?",
    options: [
      { value: "a", label: "A function returned `None` instead of a string, and you called `.split()` on it without checking.", verdict: "mastery" },
      { value: "b", label: "You imported the wrong module.", verdict: "gap" },
      { value: "c", label: "Python doesn't support `.split()` on variables — only on literals.", verdict: "gap" },
      { value: "d", label: "The string contained special characters that broke `.split()`.", verdict: "developing" },
    ],
  },
  {
    id: "python_3",
    skill: SKILL_IDS.PYTHON,
    type: "tradeoff",
    title: "Why use a virtual environment instead of installing packages globally?",
    options: [
      { value: "a", label: "Virtual environments make Python run faster.", verdict: "gap" },
      { value: "b", label: "It's required — Python won't install packages otherwise.", verdict: "gap" },
      { value: "c", label: "It isolates each project's dependencies so different projects don't break each other's versions.", verdict: "mastery" },
      { value: "d", label: "It automatically updates packages to their latest versions.", verdict: "developing" },
    ],
  },

  // ── Prompt Engineering ───────────────────────────────────────────────────────

  {
    id: "prompt_1",
    skill: SKILL_IDS.PROMPT,
    type: "predict",
    title: "You send an LLM this prompt: 'Summarise this article. Article: {article}'. The model outputs 'I'm unable to find the article.' What happens next time you actually fill in {article}?",
    options: [
      { value: "a", label: "The model will still fail because it cached the earlier response.", verdict: "gap" },
      { value: "b", label: "The model will summarise correctly — the first failure was because the placeholder was never substituted.", verdict: "mastery" },
      { value: "c", label: "The model will refuse — it learned from the first call that there's no article.", verdict: "gap" },
      { value: "d", label: "It depends on the temperature setting.", verdict: "developing" },
    ],
  },
  {
    id: "prompt_2",
    skill: SKILL_IDS.PROMPT,
    type: "diagnose",
    title: "Your production chatbot sometimes returns JSON, sometimes plain text, and sometimes refuses to answer at all. Same prompt, different runs. What's the most likely cause?",
    options: [
      { value: "a", label: "The server is overloaded.", verdict: "gap" },
      { value: "b", label: "The prompt doesn't constrain output format, so the model chooses randomly based on sampling.", verdict: "mastery" },
      { value: "c", label: "You're calling a different model version each time.", verdict: "developing" },
      { value: "d", label: "JSON parsing in the app is broken.", verdict: "gap" },
    ],
  },
  {
    id: "prompt_3",
    skill: SKILL_IDS.PROMPT,
    type: "tradeoff",
    title: "When would you use few-shot examples in a prompt instead of just a clear instruction?",
    options: [
      { value: "a", label: "Always — more tokens in the prompt always improves output quality.", verdict: "gap" },
      { value: "b", label: "When the task has a nuanced output pattern that's easier to demonstrate than describe (e.g. a specific tone, structured format, or edge-case handling).", verdict: "mastery" },
      { value: "c", label: "Only when the model has never seen the task before.", verdict: "developing" },
      { value: "d", label: "Never — instructions are always clearer than examples.", verdict: "gap" },
    ],
  },

  // ── System Design ────────────────────────────────────────────────────────────

  {
    id: "sd_1",
    skill: SKILL_IDS.SYSTEM_DESIGN,
    type: "predict",
    title: "Your API reads user data from a single database on every request. Traffic doubles. What's the first observable symptom?",
    options: [
      { value: "a", label: "The database silently drops records to keep up.", verdict: "gap" },
      { value: "b", label: "Response times increase as the database struggles to handle more concurrent queries.", verdict: "mastery" },
      { value: "c", label: "The API starts returning cached results instead of live data.", verdict: "developing" },
      { value: "d", label: "Nothing — databases auto-scale with traffic.", verdict: "gap" },
    ],
  },
  {
    id: "sd_2",
    skill: SKILL_IDS.SYSTEM_DESIGN,
    type: "diagnose",
    title: "Users report that after liking a post, the like count sometimes shows the old value if they refresh immediately. What design decision caused this?",
    options: [
      { value: "a", label: "The frontend has a bug in the like counter.", verdict: "developing" },
      { value: "b", label: "The system has eventual consistency — writes go to one node and reads may hit a replica that hasn't synced yet.", verdict: "mastery" },
      { value: "c", label: "The cache was not invalidated after the write.", verdict: "developing" },
      { value: "d", label: "The database is offline.", verdict: "gap" },
    ],
  },
  {
    id: "sd_3",
    skill: SKILL_IDS.SYSTEM_DESIGN,
    type: "tradeoff",
    title: "Your team suggests adding a message queue between your API and the email service. When does this NOT make sense?",
    options: [
      { value: "a", label: "When the email service is fast, reliable, and the API doesn't need to respond before the email is sent — the queue adds latency and complexity for no gain.", verdict: "mastery" },
      { value: "b", label: "When you want emails to be retried automatically on failure.", verdict: "gap" },
      { value: "c", label: "When the email volume is very high.", verdict: "gap" },
      { value: "d", label: "Message queues always improve performance, so they always make sense.", verdict: "gap" },
    ],
  },
];

// Group by skill for easy access
export const QUESTIONS_BY_SKILL = SKILL_ORDER.reduce((acc, skillId) => {
  acc[skillId] = FREE_PATH_QUESTIONS.filter((q) => q.skill === skillId);
  return acc;
}, {});
