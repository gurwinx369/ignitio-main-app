import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/features/common/controllers/BaseController";
import { projectService, ProjectService } from "../services/projectService";
import {
  GetProjectsCatalogSchema,
  SyncWorkingFilesSchema,
  ExecuteMilestoneCodeSchema,
  UnlockHintSchema,
  CompleteMilestoneSchema,
} from "../validators/project.schema";

export class ProjectController extends BaseController {
  constructor(private readonly service: ProjectService = projectService) {
    super();
  }

  async listProjects(request: NextRequest, firebaseUID?: string): Promise<NextResponse> {
    try {
      const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
      const query = GetProjectsCatalogSchema.parse(searchParams);

      const catalog = await this.service.getCatalog(query, firebaseUID);
      return this.handleSuccess(catalog);
    } catch (error) {
      return this.handleError(error, "ProjectController.listProjects");
    }
  }

  async getWorkspace(slug: string, firebaseUID?: string): Promise<NextResponse> {
    try {
      if (!slug) {
        return NextResponse.json({ ok: false, error: "Project slug is required" }, { status: 400 });
      }

      const workspace = await this.service.getWorkspace(slug, firebaseUID);
      return this.handleSuccess(workspace);
    } catch (error) {
      return this.handleError(error, "ProjectController.getWorkspace");
    }
  }

  async syncProgress(request: NextRequest, slug: string, firebaseUID: string): Promise<NextResponse> {
    try {
      const rawBody = await request.json().catch(() => ({}));
      const payload = SyncWorkingFilesSchema.parse(rawBody);

      const updated = await this.service.syncWorkingFiles(slug, firebaseUID, payload);
      return this.handleSuccess({ synced: true, lastSavedAt: updated?.lastSavedAt });
    } catch (error) {
      return this.handleError(error, "ProjectController.syncProgress");
    }
  }

  async executeCode(request: NextRequest, slug: string, firebaseUID: string): Promise<NextResponse> {
    try {
      const rawBody = await request.json().catch(() => ({}));
      const payload = ExecuteMilestoneCodeSchema.parse(rawBody);

      const result = await this.service.executeMilestoneCode(slug, firebaseUID, payload);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error, "ProjectController.executeCode");
    }
  }

  async unlockHint(request: NextRequest, slug: string, firebaseUID: string): Promise<NextResponse> {
    try {
      const rawBody = await request.json().catch(() => ({}));
      const payload = UnlockHintSchema.parse(rawBody);

      const hint = await this.service.unlockHint(
        slug,
        firebaseUID,
        payload.milestoneId,
        payload.hintLevel
      );
      return this.handleSuccess(hint);
    } catch (error) {
      return this.handleError(error, "ProjectController.unlockHint");
    }
  }

  async completeMilestone(
    request: NextRequest,
    slug: string,
    firebaseUID: string
  ): Promise<NextResponse> {
    try {
      const rawBody = await request.json().catch(() => ({}));
      const payload = CompleteMilestoneSchema.parse(rawBody);

      const result = await this.service.completeMilestone(slug, firebaseUID, payload);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error, "ProjectController.completeMilestone");
    }
  }
}

export const projectController = new ProjectController();
