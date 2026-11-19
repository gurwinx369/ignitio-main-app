import axios from "axios";
import { projectRepository } from "../repositories/ProjectRepository";
import connectToDB from "@/dbConfig/dbConnection";
import { UserProfile } from "@/models/v2/user.profile.model";

// JDoodle API config for server-side sandbox test execution
const JDOODLE_CONFIG = {
  baseUrl: "https://api.jdoodle.com/v1/execute",
  clientId: process.env.JDOODLE_CLIENT_ID || process.env.NEXT_PUBLIC_JDOODLE_CLIENT_ID || "",
  clientSecret: process.env.JDOODLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_JDOODLE_CLIENT_SECRET || "",
};

const LANGUAGE_CONFIGS: Record<string, { lang: string; versionIndex: string }> = {
  python3: { lang: "python3", versionIndex: "3" },
  cpp: { lang: "cpp", versionIndex: "0" },
  c: { lang: "c", versionIndex: "4" },
  javascript: { lang: "nodejs", versionIndex: "4" },
};

export class ProjectService {
  /**
   * Retrieves the project catalog with user-specific progress state if authenticated
   */
  async getCatalog(
    filters: { track?: string; tier?: number; difficulty?: string },
    firebaseUID?: string
  ) {
    const projects = await projectRepository.findProjects(filters);

    if (!firebaseUID) {
      return projects.map((p) => ({
        ...p,
        progress: null,
      }));
    }

    const userProgresses = await projectRepository.findAllUserProgresses(firebaseUID);
    const progressMap = new Map<string, any>(userProgresses.map((prog: any) => [prog.projectSlug, prog]));

    return projects.map((project: any) => {
      const prog: any = progressMap.get(project.slug);
      const totalMilestones = project.milestones?.length || 1;
      const completedCount = prog?.completedMilestones?.length || 0;
      const percentComplete = Math.min(100, Math.round((completedCount / totalMilestones) * 100));

      return {
        ...project,
        progress: prog
          ? {
              currentMilestoneId: prog.currentMilestoneId,
              completedMilestones: prog.completedMilestones,
              percentComplete,
              isCompleted: prog.isCompleted,
              lastSavedAt: prog.lastSavedAt,
            }
          : {
              currentMilestoneId: 1,
              completedMilestones: [],
              percentComplete: 0,
              isCompleted: false,
              lastSavedAt: null,
            },
      };
    });
  }

  /**
   * Retrieves full workspace data for a project (starter files, milestones, existing progress)
   */
  async getWorkspace(slug: string, firebaseUID?: string) {
    const project = await projectRepository.findBySlug(slug);
    if (!project) {
      throw new Error("Project not found");
    }

    let progress = null;
    let workingFiles = project.starterFiles || [];

    if (firebaseUID) {
      progress = await projectRepository.findUserProgress(firebaseUID, slug);
      if (progress && progress.workingFiles && progress.workingFiles.length > 0) {
        workingFiles = progress.workingFiles;
      }
    }

    // Sanitize milestones: provide instructions & public test cases, strip hidden backend test harness
    const sanitizedMilestones = project.milestones.map((m: any) => ({
      milestoneId: m.milestoneId,
      title: m.title,
      brief: m.brief,
      instructions: m.instructions,
      starterSnippet: m.starterSnippet,
      reflectionPrompt: m.reflectionPrompt,
      testCases: (m.testCases || [])
        .filter((tc: any) => !tc.isHidden)
        .map((tc: any) => ({
          name: tc.name,
          description: tc.description,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
      hintsCount: m.hints?.length || 0,
    }));

    return {
      project: {
        slug: project.slug,
        title: project.title,
        track: project.track,
        language: project.language,
        tier: project.tier,
        difficulty: project.difficulty,
        description: project.description,
        estimatedMinutes: project.estimatedMinutes,
        xpReward: project.xpReward,
        milestones: sanitizedMilestones,
      },
      workspace: {
        workingFiles,
        currentMilestoneId: progress?.currentMilestoneId || 1,
        completedMilestones: progress?.completedMilestones || [],
        unlockedHints: progress?.unlockedHints || [],
        isCompleted: progress?.isCompleted || false,
        lastSavedAt: progress?.lastSavedAt || null,
      },
    };
  }

  /**
   * Saves debounced working file changes to the Projects cluster
   */
  async syncWorkingFiles(
    slug: string,
    firebaseUID: string,
    payload: {
      currentMilestoneId: number;
      workingFiles: Array<{ path: string; content: string }>;
    }
  ) {
    // Resolve user ObjectId from Main DB (or fallback to dummy ID if not yet queried)
    await connectToDB();
    const userProfile = await (UserProfile as any).findOne({ firebaseUID }).select("_id").lean();
    const userId = userProfile?._id || null;

    if (!userId) {
      throw new Error("User profile not found");
    }

    return projectRepository.saveWorkingFiles(
      firebaseUID,
      userId.toString(),
      slug,
      payload.currentMilestoneId,
      payload.workingFiles
    );
  }

  /**
   * Executes user code in sandbox against milestone tests
   */
  async executeMilestoneCode(
    slug: string,
    firebaseUID: string,
    payload: {
      milestoneId: number;
      code: string;
      language?: string;
      stdin?: string;
    }
  ) {
    const project = await projectRepository.findBySlug(slug);
    if (!project) {
      throw new Error("Project not found");
    }

    const milestone = project.milestones.find((m: any) => m.milestoneId === payload.milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${payload.milestoneId} not found`);
    }

    const targetLang = payload.language || project.language || "python3";
    const langConfig = LANGUAGE_CONFIGS[targetLang] || LANGUAGE_CONFIGS.python3;

    // Execute user code via JDoodle sandbox
    let executionOutput = "";
    let statusCode = 200;
    let cpuTime = "0.00";
    let memory = "0";

    const effectiveStdin = payload.stdin || milestone.testCases?.[0]?.input || "";

    try {
      const response = await axios.post(
        JDOODLE_CONFIG.baseUrl,
        {
          clientId: JDOODLE_CONFIG.clientId,
          clientSecret: JDOODLE_CONFIG.clientSecret,
          script: payload.code,
          language: langConfig.lang,
          versionIndex: langConfig.versionIndex,
          stdin: effectiveStdin,
        },
        { timeout: 8000 }
      );

      executionOutput = response.data.output || "";
      statusCode = response.data.statusCode || 200;
      cpuTime = response.data.cpuTime || "0.00";
      memory = response.data.memory || "0";
    } catch (apiErr: any) {
      const isMissingCreds = !JDOODLE_CONFIG.clientId || !JDOODLE_CONFIG.clientSecret;
      const isAuthError =
        apiErr?.response?.status === 401 || apiErr?.response?.status === 403;

      if (isMissingCreds) {
        executionOutput = `[Config Error]: Sandbox not configured. JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET is missing.`;
      } else if (isAuthError) {
        executionOutput = `[Auth Error]: Sandbox rejected the request. Check JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in .env.`;
      } else {
        executionOutput = `[Sandbox Error]: ${apiErr.message || "Execution timed out or failed. Try again."}`;
      }
      console.error(
        "[ProjectService] JDoodle execution error:",
        apiErr?.response?.data || apiErr.message
      );
    }

    // Evaluate test case assertions
    const testResults = (milestone.testCases || []).map((tc: any) => {
      let passed = true;
      let reason = "";

      // 1. Syntax / Code Structure Check
      if (tc.requiredCodePattern) {
        try {
          const regex = new RegExp(tc.requiredCodePattern, "i");
          if (!regex.test(payload.code)) {
            passed = false;
            reason = tc.failureHint || `Missing required syntax (${tc.name})`;
          }
        } catch (e) {
          console.warn("[ProjectService] Invalid regex in testCase:", tc.requiredCodePattern);
        }
      }

      // 2. Output / Assertion Check
      if (passed && tc.expectedOutput) {
        const matches = executionOutput
          .toLowerCase()
          .includes(tc.expectedOutput.toLowerCase().trim());
        if (!matches) {
          passed = false;
          reason = tc.failureHint || `Expected output to include "${tc.expectedOutput}"`;
        }
      }

      return {
        name: tc.name,
        description: tc.description,
        passed,
        reason: reason || (passed ? "All checks passed" : "Assertion failed"),
        expected: tc.isHidden ? "[Hidden Test]" : tc.expectedOutput,
      };
    });

    // Require at least one test to have run — empty testCases must never auto-pass
    const allPassed = testResults.length > 0 && testResults.every((t: any) => t.passed);

    return {
      output: executionOutput,
      statusCode,
      cpuTime,
      memory,
      testResults,
      allPassed,
    };
  }

  /**
   * Unlocks a hint tier and returns the hint content
   */
  async unlockHint(
    slug: string,
    firebaseUID: string,
    milestoneId: number,
    hintLevel: number
  ) {
    const project = await projectRepository.findBySlug(slug);
    if (!project) throw new Error("Project not found");

    const milestone = project.milestones.find((m: any) => m.milestoneId === milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    const hint = milestone.hints.find((h: any) => h.level === hintLevel);
    if (!hint) throw new Error("Hint level not found");

    await connectToDB();
    const userProfile = await (UserProfile as any).findOne({ firebaseUID }).select("_id").lean();
    const userId = userProfile?._id?.toString() || "system";

    await projectRepository.recordHintUnlock(firebaseUID, userId, slug, milestoneId, hintLevel);

    return {
      milestoneId,
      hintLevel: hint.level,
      content: hint.content,
    };
  }

  /**
   * Completes a milestone, updates progress in Projects DB,
   * and tracks project mastery status.
   */
  async completeMilestone(
    slug: string,
    firebaseUID: string,
    payload: {
      milestoneId: number;
      reflectionAnswer?: string;
    }
  ) {
    const project = await projectRepository.findBySlug(slug);
    if (!project) throw new Error("Project not found");

    const totalMilestones = project.milestones.length;
    const isFinalMilestone = payload.milestoneId >= totalMilestones;

    await connectToDB();
    const userProfile = await (UserProfile as any).findOne({ firebaseUID }).select("_id").lean();
    if (!userProfile) throw new Error("User profile not found");
    const userId = userProfile._id.toString();

    // Step 1: Update in Projects Cluster (Volatile storage)
    const updatedProgress = await projectRepository.markMilestoneCompleted(
      firebaseUID,
      userId,
      slug,
      payload.milestoneId,
      payload.reflectionAnswer,
      isFinalMilestone
    );

    // Step 2: Mark status as SYNCED
    try {
      await projectRepository.updateSyncStatus(firebaseUID, slug, "SYNCED");
    } catch (syncErr: any) {
      console.warn("[ProjectService] Sync warning:", syncErr.message);
    }

    return {
      ok: true,
      milestoneId: payload.milestoneId,
      nextMilestoneId: isFinalMilestone ? null : payload.milestoneId + 1,
      isProjectCompleted: isFinalMilestone,
      progress: updatedProgress,
    };
  }
}

export const projectService = new ProjectService();
