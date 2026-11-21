import { connectProjectsDB } from "@/dbConfig/projectsDbConnection";
import { getProjectModel } from "@/models/v2/project.model";
import { getProjectProgressModel } from "@/models/v2/project.progress.model";
import { INITIAL_PROJECTS } from "../data/seedProjects";

// In-process cache flag to avoid hitting MongoDB countDocuments on every request
let isCatalogSeeded = false;

export class ProjectRepository {
  private async getModels() {
    const connection = await connectProjectsDB();
    const Project: any = getProjectModel(connection);
    const ProjectProgress: any = getProjectProgressModel(connection);
    return { Project, ProjectProgress };
  }

  /**
   * Automatically seed initial catalog if the collection is empty (run at most once per process).
   */
  async ensureSeeded(): Promise<void> {
    if (isCatalogSeeded) return;

    try {
      const { Project } = await this.getModels();
      const count = await Project.countDocuments();

      if (count === 0) {
        console.log("[ProjectRepository] Seeding initial projects into Projects Cluster...");
        for (const proj of INITIAL_PROJECTS) {
          await Project.findOneAndUpdate(
            { slug: proj.slug },
            { $set: proj },
            { upsert: true, returnDocument: "after" }
          );
        }
      }

      isCatalogSeeded = true;
    } catch (err) {
      console.error("[ProjectRepository] Seed check warning:", err.message);
    }
  }

  /**
   * Force re-seeds all projects unconditionally (dev/admin use only).
   */
  async forceReseed(): Promise<void> {
    try {
      const { Project } = await this.getModels();
      for (const proj of INITIAL_PROJECTS) {
        await Project.findOneAndUpdate(
          { slug: proj.slug },
          { $set: proj },
          { upsert: true, returnDocument: "after" }
        );
      }
      isCatalogSeeded = true;
    } catch (err) {
      console.error("[ProjectRepository] Force reseed warning:", err.message);
      throw err;
    }
  }

  async findProjects(filter: { track?: string; tier?: number; difficulty?: string }) {
    await this.ensureSeeded();
    const { Project } = await this.getModels();
    const query: Record<string, any> = { isPublished: true };

    if (filter.track) query.track = filter.track;
    if (filter.tier) query.tier = filter.tier;
    if (filter.difficulty) query.difficulty = filter.difficulty;

    return Project.find(query)
      .select("-milestones.testHarness") // Strip hidden server test harness from catalog response
      .sort({ tier: 1, createdAt: 1 })
      .lean();
  }

  async findBySlug(slug: string) {
    await this.ensureSeeded();
    const { Project } = await this.getModels();
    return Project.findOne({ slug: slug.toLowerCase().trim(), isPublished: true }).lean();
  }

  async findUserProgress(firebaseUID: string, projectSlug: string) {
    const { ProjectProgress } = await this.getModels();
    return ProjectProgress.findOne({
      firebaseUID,
      projectSlug: projectSlug.toLowerCase().trim(),
    }).lean();
  }

  async findAllUserProgresses(firebaseUID: string) {
    const { ProjectProgress } = await this.getModels();
    return ProjectProgress.find({ firebaseUID }).lean();
  }

  async saveWorkingFiles(
    firebaseUID: string,
    userId: string,
    projectSlug: string,
    currentMilestoneId: number,
    workingFiles: Array<{ path: string; content: string }>
  ) {
    const { ProjectProgress } = await this.getModels();
    return ProjectProgress.findOneAndUpdate(
      { firebaseUID, projectSlug: projectSlug.toLowerCase().trim() },
      {
        $set: {
          userId,
          currentMilestoneId,
          workingFiles,
          lastSavedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).lean();
  }

  async markMilestoneCompleted(
    firebaseUID: string,
    userId: string,
    projectSlug: string,
    milestoneId: number,
    reflectionAnswer?: string,
    isFinalMilestone = false
  ) {
    const { ProjectProgress } = await this.getModels();
    const updateOps: Record<string, any> = {
      $addToSet: { completedMilestones: milestoneId },
      $set: {
        userId,
        lastSavedAt: new Date(),
        syncStatus: "PENDING_XP_SYNC",
      },
    };

    if (reflectionAnswer) {
      updateOps.$addToSet.reflectionAnswers = {
        milestoneId,
        answer: reflectionAnswer,
        answeredAt: new Date(),
      };
    }

    if (isFinalMilestone) {
      updateOps.$set.isCompleted = true;
      updateOps.$set.completedAt = new Date();
    } else {
      updateOps.$set.currentMilestoneId = milestoneId + 1;
    }

    return ProjectProgress.findOneAndUpdate(
      { firebaseUID, projectSlug: projectSlug.toLowerCase().trim() },
      updateOps,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).lean();
  }

  async recordHintUnlock(
    firebaseUID: string,
    userId: string,
    projectSlug: string,
    milestoneId: number,
    hintLevel: number
  ) {
    const { ProjectProgress } = await this.getModels();
    return ProjectProgress.findOneAndUpdate(
      { firebaseUID, projectSlug: projectSlug.toLowerCase().trim() },
      {
        $set: { userId, lastSavedAt: new Date() },
        $addToSet: {
          unlockedHints: {
            milestoneId,
            hintLevel,
            unlockedAt: new Date(),
          },
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).lean();
  }

  async updateSyncStatus(
    firebaseUID: string,
    projectSlug: string,
    status: "SYNCED" | "FAILED"
  ) {
    const { ProjectProgress } = await this.getModels();
    return ProjectProgress.updateOne(
      { firebaseUID, projectSlug: projectSlug.toLowerCase().trim() },
      { $set: { syncStatus: status } }
    );
  }
}

export const projectRepository = new ProjectRepository();
