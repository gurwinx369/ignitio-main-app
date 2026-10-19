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
  DSA: "dsa",
});

export const SKILL_LABELS = Object.freeze({
  [SKILL_IDS.GIT]: "Git / GitHub",
  [SKILL_IDS.PYTHON]: "Python",
  [SKILL_IDS.PROMPT]: "Prompt Engineering",
  [SKILL_IDS.SYSTEM_DESIGN]: "System Design",
  [SKILL_IDS.DSA]: "Data Structures & Algorithms",
});

// Order matches active free path skills: Python → Git
// Prompt Engineering & System Design routed out for now (logic preserved for later use)
export const SKILL_ORDER = [
  SKILL_IDS.PYTHON,
  SKILL_IDS.GIT,
  // SKILL_IDS.PROMPT,
  // SKILL_IDS.SYSTEM_DESIGN,
];

export const FREE_PATH_QUESTIONS = [
  // ── Git / GitHub ────────────────────────────────────────────────────────────

  {
    id: "git_1",
    skill: SKILL_IDS.GIT,
    type: "predict",
    title:
      "What is the primary purpose of running `git add filename.py` before `git commit`?",
    options: [
      {
        value: "a",
        label:
          "It stages specific changes so you can review and select what to include in the next commit.",
        verdict: "mastery",
      },
      {
        value: "b",
        label: "It permanently pushes your code directly to GitHub.",
        verdict: "gap",
      },
      {
        value: "c",
        label: "It creates a brand new repository in the current folder.",
        verdict: "gap",
      },
      {
        value: "d",
        label: "It runs your automated test suite to ensure the code works.",
        verdict: "gap",
      },
    ],
  },
  {
    id: "git_2",
    skill: SKILL_IDS.GIT,
    type: "tradeoff",
    title:
      "Why do engineering teams create feature branches instead of committing directly to `main`?",
    options: [
      {
        value: "a",
        label:
          "To isolate changes so ongoing work doesn't destabilize the working production code on `main`.",
        verdict: "mastery",
      },
      {
        value: "b",
        label:
          "Because Git does not allow more than 10 commits on the `main` branch.",
        verdict: "gap",
      },
      {
        value: "c",
        label: "Branches make code compile and execute faster.",
        verdict: "gap",
      },
      {
        value: "d",
        label: "To prevent teammates from seeing the code until it is merged.",
        verdict: "developing",
      },
    ],
  },
  {
    id: "git_3",
    skill: SKILL_IDS.GIT,
    type: "diagnose",
    title:
      "You want to download the latest changes from your team's remote repository and integrate them into your current local branch. Which command should you run?",
    options: [
      {
        value: "a",
        label: "`git pull`",
        verdict: "mastery",
      },
      {
        value: "b",
        label: "`git push`",
        verdict: "gap",
      },
      {
        value: "c",
        label: "`git commit`",
        verdict: "gap",
      },
      {
        value: "d",
        label: "`git status`",
        verdict: "developing",
      },
    ],
  },

  // ── Python ───────────────────────────────────────────────────────────────────

  {
    id: "python_1",
    skill: SKILL_IDS.PYTHON,
    type: "predict",
    title: "What is the output of the following Python code?",
    code: `text = "Ignitio"
print(text[1:4])`,
    options: [
      { value: "a", label: '"gni"', verdict: "mastery" },
      { value: "b", label: '"ign"', verdict: "gap" },
      { value: "c", label: '"gnit"', verdict: "developing" },
      { value: "d", label: "IndexError", verdict: "gap" },
    ],
  },
  {
    id: "python_2",
    skill: SKILL_IDS.PYTHON,
    type: "diagnose",
    title:
      "Which of the following statements correctly describes a major difference between a `list` and a `tuple` in Python?",
    options: [
      {
        value: "a",
        label:
          "Lists are mutable (can be changed after creation), while tuples are immutable (cannot be changed).",
        verdict: "mastery",
      },
      {
        value: "b",
        label:
          "Lists can store numbers, while tuples can only store strings.",
        verdict: "gap",
      },
      {
        value: "c",
        label:
          "Tuples can change their elements, but lists have a fixed size.",
        verdict: "gap",
      },
      {
        value: "d",
        label:
          "Lists use parentheses (), while tuples use square brackets [].",
        verdict: "developing",
      },
    ],
  },
  {
    id: "python_3",
    skill: SKILL_IDS.PYTHON,
    type: "tradeoff",
    title: "What is the output of the following code?",
    code: `scores = {"Alice": 95, "Bob": 80}
print(scores.get("Charlie", 0))`,
    options: [
      { value: "a", label: "0", verdict: "mastery" },
      { value: "b", label: "KeyError: 'Charlie'", verdict: "developing" },
      { value: "c", label: "None", verdict: "developing" },
      { value: "d", label: "False", verdict: "gap" },
    ],
  },

  // Prompt Engineering & System Design diagnostic questions routed out for now (logic preserved for later use)
  /*
  // ── Prompt Engineering ───────────────────────────────────────────────────────

  {
    id: "prompt_1",
    skill: SKILL_IDS.PROMPT,
    type: "predict",
    title:
      "You send an LLM this prompt: 'Summarise this article. Article: {article}'. The model outputs 'I'm unable to find the article.' What happens next time you actually fill in {article}?",
    options: [
      {
        value: "a",
        label:
          "The model will still fail because it cached the earlier response.",
        verdict: "gap",
      },
      {
        value: "b",
        label:
          "The model will summarise correctly — the first failure was because the placeholder was never substituted.",
        verdict: "mastery",
      },
      {
        value: "c",
        label:
          "The model will refuse — it learned from the first call that there's no article.",
        verdict: "gap",
      },
      {
        value: "d",
        label: "It depends on the temperature setting.",
        verdict: "developing",
      },
    ],
  },
  {
    id: "prompt_2",
    skill: SKILL_IDS.PROMPT,
    type: "diagnose",
    title:
      "Your production chatbot sometimes returns JSON, sometimes plain text, and sometimes refuses to answer at all. Same prompt, different runs. What's the most likely cause?",
    options: [
      { value: "a", label: "The server is overloaded.", verdict: "gap" },
      {
        value: "b",
        label:
          "The prompt doesn't constrain output format, so the model chooses randomly based on sampling.",
        verdict: "mastery",
      },
      {
        value: "c",
        label: "You're calling a different model version each time.",
        verdict: "developing",
      },
      {
        value: "d",
        label: "JSON parsing in the app is broken.",
        verdict: "gap",
      },
    ],
  },
  {
    id: "prompt_3",
    skill: SKILL_IDS.PROMPT,
    type: "tradeoff",
    title:
      "When would you use few-shot examples in a prompt instead of just a clear instruction?",
    options: [
      {
        value: "a",
        label:
          "Always — more tokens in the prompt always improves output quality.",
        verdict: "gap",
      },
      {
        value: "b",
        label:
          "When the task has a nuanced output pattern that's easier to demonstrate than describe (e.g. a specific tone, structured format, or edge-case handling).",
        verdict: "mastery",
      },
      {
        value: "c",
        label: "Only when the model has never seen the task before.",
        verdict: "developing",
      },
      {
        value: "d",
        label: "Never — instructions are always clearer than examples.",
        verdict: "gap",
      },
    ],
  },

  // ── System Design ────────────────────────────────────────────────────────────

  {
    id: "sd_1",
    skill: SKILL_IDS.SYSTEM_DESIGN,
    type: "predict",
    title:
      "Your API reads user data from a single database on every request. Traffic doubles. What's the first observable symptom?",
    options: [
      {
        value: "a",
        label: "The database silently drops records to keep up.",
        verdict: "gap",
      },
      {
        value: "b",
        label:
          "Response times increase as the database struggles to handle more concurrent queries.",
        verdict: "mastery",
      },
      {
        value: "c",
        label: "The API starts returning cached results instead of live data.",
        verdict: "developing",
      },
      {
        value: "d",
        label: "Nothing — databases auto-scale with traffic.",
        verdict: "gap",
      },
    ],
  },
  {
    id: "sd_2",
    skill: SKILL_IDS.SYSTEM_DESIGN,
    type: "diagnose",
    title:
      "Users report that after liking a post, the like count sometimes shows the old value if they refresh immediately. What design decision caused this?",
    options: [
      {
        value: "a",
        label: "The frontend has a bug in the like counter.",
        verdict: "developing",
      },
      {
        value: "b",
        label:
          "The system has eventual consistency — writes go to one node and reads may hit a replica that hasn't synced yet.",
        verdict: "mastery",
      },
      {
        value: "c",
        label: "The cache was not invalidated after the write.",
        verdict: "developing",
      },
      { value: "d", label: "The database is offline.", verdict: "gap" },
    ],
  },
  {
    id: "sd_3",
    skill: SKILL_IDS.SYSTEM_DESIGN,
    type: "tradeoff",
    title:
      "Your team suggests adding a message queue between your API and the email service. When does this NOT make sense?",
    options: [
      {
        value: "a",
        label:
          "When the email service is fast, reliable, and the API doesn't need to respond before the email is sent — the queue adds latency and complexity for no gain.",
        verdict: "mastery",
      },
      {
        value: "b",
        label: "When you want emails to be retried automatically on failure.",
        verdict: "gap",
      },
      {
        value: "c",
        label: "When the email volume is very high.",
        verdict: "gap",
      },
      {
        value: "d",
        label:
          "Message queues always improve performance, so they always make sense.",
        verdict: "gap",
      },
    ],
  },
  */
];

// Group by skill for easy access
export const QUESTIONS_BY_SKILL = SKILL_ORDER.reduce((acc, skillId) => {
  acc[skillId] = FREE_PATH_QUESTIONS.filter((q) => q.skill === skillId);
  return acc;
}, {});
