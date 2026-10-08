import { CodeXml, GitBranch, Rocket, Trophy } from "lucide-react";

export const STAGES = [
  {
    id: "git",
    kind: "stage",
    number: "01",
    weekLabel: "Week 1",
    days: "Days 1–7",
    title: "Git & GitHub",
    concepts: ["Commits", "Branching", "Pull Requests", "Remote Repos"],
    outcome: "Push your first repo live",
    accent: "#5eead4",
    icon: GitBranch,
    startHere: true,
  },
  {
    id: "python",
    kind: "stage",
    number: "02",
    weekLabel: "Weeks 2–3",
    days: "Days 8–21",
    title: "Python",
    concepts: ["Variables & Types", "Functions", "Lists & Dicts", "File I/O"],
    outcome: "Write 3 working scripts",
    accent: "#a5b4fc",
    icon: CodeXml,
  },
  {
    id: "ship",
    kind: "stage",
    number: "03",
    weekLabel: "Week 4",
    days: "Days 22–28",
    title: "Ship It",
    concepts: ["Project structure", "README", "GitHub Pages", "Live deploy"],
    outcome: "Ship a live project to GitHub",
    accent: "#fdba74",
    icon: Rocket,
  },
  {
    id: "live",
    kind: "finish",
    weekLabel: "Day 30",
    days: "The finish line",
    title: "You're live on GitHub",
    concepts: [],
    outcome:
      "A real repo, a real README, and a link you can share with anyone.",
    accent: "#5cc8ff",
    icon: Trophy,
  },
];

export const CARD_W = 296;
export const COL_GAP = 96;
export const PAD_X = 20;
export const LABEL_H = 40;
export const STEP_Y = 120;
export const CARD_H = 84;
export const STAGE_H = 196;
export const FINISH_H = 216;
export const ANCHOR_Y = CARD_H / 2;
export const TRACK_PAD_BOTTOM = 32;
export const STEP_X = CARD_W + COL_GAP;

export const stageX = (index) => PAD_X + index * STEP_X;
export const cardTop = (index) => index * STEP_Y + LABEL_H;
export const cardHeight = (stage) =>
  stage.kind === "finish" ? FINISH_H : STAGE_H;

export const INTRO_MS = 1600;
export const HEADER_MS = 900;
export const STAGE_MS = 1500;
export const PILL_BASE_MS = 420;
export const PILL_STEP_MS = 80;
export const checkDelay = (conceptCount) =>
  PILL_BASE_MS + conceptCount * PILL_STEP_MS + 40;

export const TRACK_WIDTH = stageX(STAGES.length - 1) + CARD_W + PAD_X;
export const TRACK_HEIGHT =
  cardTop(STAGES.length - 1) +
  cardHeight(STAGES[STAGES.length - 1]) +
  TRACK_PAD_BOTTOM;
