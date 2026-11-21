import { z } from "zod";

// Hard security ceilings
export const MAX_CODE_LENGTH = 60000; // 60 KB max per file (Atlas M0 safety)
export const MAX_REFLECTION_LENGTH = 2000;

export const SupportedLanguages = z.enum(["python3", "cpp", "c", "javascript"]);
export const SupportedTracks = z.enum([
  "python",
  "cpp",
  "c",
  "web",
  "dsa",
  "git-github",
  "prompt-engineering",
]);

/**
 * Validates request to list/filter projects catalog
 */
export const GetProjectsCatalogSchema = z.object({
  track: SupportedTracks.optional(),
  tier: z.coerce.number().int().min(1).max(4).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

/**
 * Validates a code execution / test verification request
 */
export const ExecuteMilestoneCodeSchema = z.object({
  milestoneId: z.coerce.number().int().positive(),
  code: z
    .string()
    .trim()
    .min(1, "Code content is required")
    .max(MAX_CODE_LENGTH, `Code exceeds maximum allowed size of ${MAX_CODE_LENGTH} characters`),
  language: SupportedLanguages.default("python3"),
  stdin: z.string().max(10000).optional().default(""),
});

/**
 * Validates debounced auto-save payload
 */
export const SyncWorkingFilesSchema = z.object({
  currentMilestoneId: z.coerce.number().int().positive(),
  workingFiles: z
    .array(
      z.object({
        path: z.string().trim().min(1).max(250),
        content: z.string().max(MAX_CODE_LENGTH),
      })
    )
    .min(1, "At least one file must be provided")
    .max(10, "A project cannot exceed 10 working files in starter tiers"),
});

/**
 * Validates hint unlock request
 */
export const UnlockHintSchema = z.object({
  milestoneId: z.coerce.number().int().positive(),
  hintLevel: z.coerce.number().int().min(1).max(3),
});

/**
 * Validates milestone completion & reflection submission
 */
export const CompleteMilestoneSchema = z.object({
  milestoneId: z.coerce.number().int().positive(),
  userCode: z.string().max(MAX_CODE_LENGTH).optional(),
  reflectionAnswer: z.string().trim().max(MAX_REFLECTION_LENGTH).optional(),
});
