import { BrainCircuit, CodeXml, Database, GitBranch, Layers, Rocket, Trophy } from "lucide-react";

export const STAGES = [
  {
    id: "python",
    kind: "stage",
    number: "01",
    weekLabel: "Weeks 1–2",
    days: "Days 1–14",
    title: "Python",
    concepts: ["Variables & Types", "Functions", "Lists & Dicts", "File I/O"],
    outcome: "Write 3 working scripts",
    accent: "#a5b4fc",
    icon: CodeXml,
    startHere: true,
  },
  {
    id: "git",
    kind: "stage",
    number: "02",
    weekLabel: "Week 3",
    days: "Days 15–21",
    title: "Git & GitHub",
    concepts: ["Commits", "Branching", "Pull Requests", "Remote Repos"],
    outcome: "Push your first repo live",
    accent: "#5eead4",
    icon: GitBranch,
  },
  {
    id: "dsa",
    kind: "stage",
    number: "03",
    weekLabel: "Weeks 4–5",
    days: "Days 22–35",
    title: "Data Structures & Algorithms",
    concepts: ["Big O & Sorting", "Arrays & Lists", "Trees & Graphs", "Dynamic Programming"],
    outcome: "Solve 20+ algorithmic interview problems",
    accent: "#38bdf8",
    icon: Database,
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
    id: "prompt",
    kind: "stage",
    number: "04",
    weekLabel: "Week 5",
    days: "Days 29–35",
    title: "Prompt Engineering",
    concepts: ["Output format", "Context windows", "Few-shot patterns", "Chain-of-thought"],
    outcome: "Build an AI-powered feature in your project",
    accent: "#c084fc",
    icon: BrainCircuit,
  },
  {
    id: "system_design",
    kind: "stage",
    number: "05",
    weekLabel: "Week 6",
    days: "Days 36–42",
    title: "System Design",
    concepts: ["Scalability", "Databases", "Caching", "API design"],
    outcome: "Design a system you can explain in an interview",
    accent: "#34d399",
    icon: Layers,
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

export const DSA_STAGES = [
  {
    id: "dsa_w1",
    kind: "stage",
    number: "01",
    weekLabel: "Week 1",
    days: "Days 1–7",
    title: "Foundations & Search Patterns",
    concepts: ["Flowcharts & Logic", "Arrays & 2D Search", "Binary Search", "Cycle & Insertion Sort"],
    outcome: "Master search patterns & 15+ array problems",
    accent: "#38bdf8",
    icon: CodeXml,
    startHere: true,
  },
  {
    id: "dsa_w2",
    kind: "stage",
    number: "02",
    weekLabel: "Week 2",
    days: "Days 8–14",
    title: "Recursion & Backtracking",
    concepts: ["Recursion Patterns", "Subsets & Dice Rolls", "Permutations", "Backtracking Logic"],
    outcome: "Solve 20+ recursive & subset problems",
    accent: "#818cf8",
    icon: BrainCircuit,
  },
  {
    id: "dsa_w3",
    kind: "stage",
    number: "03",
    weekLabel: "Week 3",
    days: "Days 15–21",
    title: "Trees, Heaps & Graphs",
    concepts: ["Linked Lists & Stacks", "Binary Search Trees", "Heaps & Segment Trees", "BFS & DFS Traversals"],
    outcome: "Implement & traverse trees, heaps, and lists",
    accent: "#34d399",
    icon: Database,
  },
  {
    id: "dsa_w4",
    kind: "stage",
    number: "04",
    weekLabel: "Week 4",
    days: "Days 22–24",
    title: "Advanced Graphs & FAANG Prep",
    concepts: ["Shortest Paths (Dijkstra)", "Minimum Spanning Trees", "Topological Sort", "FAANG Interview Problems"],
    outcome: "Tackle interview-level graph questions",
    accent: "#fb923c",
    icon: Layers,
  },
  {
    id: "dsa_finish",
    kind: "finish",
    weekLabel: "Day 24",
    days: "The finish line",
    title: "Interview & Placement Ready",
    concepts: [],
    outcome:
      "Solve top FAANG & product company coding interview questions with optimal algorithmic complexity.",
    badge: "leetcode.com/faang-ready",
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

export const INTRO_MS = 4200;
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
