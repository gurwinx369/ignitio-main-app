import connectToDB from "../../dbConfig/dbConnection.js";
import { UserProfile } from "../../models/v2/user.profile.model.js";
import { OnboardingResponseModel } from "../../models/v2/onboarding.model.js";
import { RoadmapTemplate } from "../../models/v2/roadmap.templates.model.js";
import { RoadmapPersonalization } from "../../models/v2/roadmap.personalized.model.js";
import { RoadmapProgress } from "../../models/v2/roadmap.progress.model.js";
import { isOnboardingComplete } from "./onboarding-route.js";
import { buildRouting, compileRoadmap } from "./roadmapCompiler.js";
import {
  reconstructDiagnostics,
  mapGoalToMotivation,
  mapScheduleWindows,
} from "./activation.shared.js";
import {
  validateSchedulePreference,
  isValidIanaTimezone,
} from "./activation.validation.js";
import { classifyV4Diagnostic } from "./diagnostic-evaluation.js";

// Canonical slug for the Premium GenAI roadmap -- never derived from client input.
const GENAI_SLUG = "gen-ai-internship";

// ------ Schedule helpers -------------------------------------------------------

/**
 * Validates and maps a schedulePreference to the persisted ScheduleSchema shape.
 *
 * Handles the legacy-default-schedule case explicitly for the upgrade service:
 *   { timezone: "Asia/Kolkata", windows: [], isDefault: true }
 *
 * A default schedule is valid when:
 *   - schedulePreference exists
 *   - isDefault === true
 *   - timezone is a valid IANA timezone
 *   - windows is an empty array
 *
 * Does NOT weaken validateSchedulePreference() globally.
 *
 * @param {object} schedulePref
 * @returns {{ ok: true, schedule: object } | { ok: false, error: string }}
 */
function resolveUpgradeSchedule(schedulePref) {
  if (!schedulePref) {
    return {
      ok: false,
      error: "Schedule preference is missing",
    };
  }

  // Legacy default schedule path -- bypass window validation for upgrade only
  if (
    schedulePref.isDefault === true &&
    Array.isArray(schedulePref.windows) &&
    schedulePref.windows.length === 0
  ) {
    if (!isValidIanaTimezone(schedulePref.timezone)) {
      return {
        ok: false,
        error: `Invalid timezone: ${schedulePref.timezone}`,
      };
    }

    return {
      ok: true,
      schedule: {
        timezone: schedulePref.timezone,
        freeWindows: [],
        isDefault: true,
      },
    };
  }

  // Non-default / custom schedule -- full validation
  const validation =
    validateSchedulePreference(schedulePref);

  if (!validation.valid) {
    return {
      ok: false,
      error: validation.error,
    };
  }

  return {
    ok: true,
    schedule: {
      timezone: schedulePref.timezone,
      freeWindows: mapScheduleWindows(
        schedulePref.windows,
      ),
      isDefault: false,
    },
  };
}

// ------ Diagnostics array builder ---------------------------------------------
//
// Mirrors the same construction used in activatePremium inside activation.service.js.

function buildDiagnosticsArray(diagnostics) {
  const now = new Date();

  return Object.entries(diagnostics).map(
    ([qId, d]) => ({
      questionId: qId.toUpperCase(),
      passed: d.passed,
      rawAnswer:
        d.value === null || d.value === undefined
          ? ""
          : typeof d.value === "string"
            ? d.value
            : Array.isArray(d.value) ||
              typeof d.value === "object"
              ? JSON.stringify(d.value)
              : String(d.value),
      routedAction:
        qId === "q1" ||
          d.notAssessed ||
          d.skipped
          ? "keep"
          : d.passed
            ? "skip_week"
            : d.partial
              ? "optional"
              : "keep",
      answeredAt: now,
    }),
  );
}

// ------ Window sort comparator ------------------------------------------------

function windowComparator(a, b) {
  const ka =
    `${a.startMinute}-${a.endMinute}`;

  const kb =
    `${b.startMinute}-${b.endMinute}`;

  return ka < kb
    ? -1
    : ka > kb
      ? 1
      : 0;
}

// ------ Pure personalization equivalence -------------------------------------
//
// Compares curriculum-driving fields only.
// Ignores: _id, createdAt, updatedAt, __v, answeredAt.
// Normalizes arrays deterministically without changing business meaning.

/**
 * @param {object} existing - existing active personalization document
 * @param {object} desired - desired compiled personalization object
 * @returns {boolean}
 */
export function isPersonalizationEquivalent(
  existing,
  desired,
) {
  if (
    existing.roadmapSlug !==
    desired.roadmapSlug
  ) {
    return false;
  }

  if (
    existing.motivation !==
    desired.motivation
  ) {
    return false;
  }

  if (
    existing.totalLevels !==
    desired.totalLevels
  ) {
    return false;
  }

  // templateSnapshotAt -- compare as ISO strings, tolerating Date vs string
  const existingSnap =
    existing.templateSnapshotAt
      ? new Date(
        existing.templateSnapshotAt,
      ).toISOString()
      : null;

  const desiredSnap =
    desired.templateSnapshotAt
      ? new Date(
        desired.templateSnapshotAt,
      ).toISOString()
      : null;

  if (existingSnap !== desiredSnap) {
    return false;
  }

  // Day ID arrays -- sorted, stringified
  const sortStr = (arr) =>
    JSON.stringify(
      [...(arr || [])].sort(),
    );

  if (
    sortStr(existing.includedDayIds) !==
    sortStr(desired.includedDayIds)
  ) {
    return false;
  }

  if (
    sortStr(existing.optionalDayIds) !==
    sortStr(desired.optionalDayIds)
  ) {
    return false;
  }

  if (
    sortStr(existing.skippedDayIds) !==
    sortStr(desired.skippedDayIds)
  ) {
    return false;
  }

  // Schedule
  const es = existing.schedule || {};
  const ds = desired.schedule || {};

  if (es.timezone !== ds.timezone) {
    return false;
  }

  if (
    Boolean(es.isDefault) !==
    Boolean(ds.isDefault)
  ) {
    return false;
  }

  const sortedExFw = [
    ...(es.freeWindows || []),
  ].sort(windowComparator);

  const sortedDsFw = [
    ...(ds.freeWindows || []),
  ].sort(windowComparator);

  if (
    JSON.stringify(sortedExFw) !==
    JSON.stringify(sortedDsFw)
  ) {
    return false;
  }

  // Diagnostics -- compare deterministic fields only.
  // answeredAt is intentionally ignored.
  const normDiag = (arr) =>
    [...(arr || [])]
      .map((d) => ({
        questionId: String(
          d.questionId || "",
        ),
        passed: Boolean(
          d.passed,
        ),
        rawAnswer: String(
          d.rawAnswer || "",
        ),
        routedAction: String(
          d.routedAction || "",
        ),
      }))
      .sort((a, b) =>
        a.questionId.localeCompare(
          b.questionId,
        ),
      );

  if (
    JSON.stringify(
      normDiag(existing.diagnostics),
    ) !==
    JSON.stringify(
      normDiag(desired.diagnostics),
    )
  ) {
    return false;
  }

  return true;
}

// ------ Version calculation ---------------------------------------------------
//
// Determines next version number from ALL personalizations (active + inactive).
// Treats missing/invalid version as 1.

function computeNextVersion(
  allPersonalizations,
) {
  let maxVersion = 1;

  for (
    const p of allPersonalizations
  ) {
    const v =
      Number.isInteger(p.version)
        ? p.version
        : 1;

    if (v > maxVersion) {
      maxVersion = v;
    }
  }

  return maxVersion + 1;
}

// ------ ensurePremiumGenAiUpgrade -- public entry point ----------------------
//
// POST-onboarding only.
// Does NOT run onboarding.
// Does NOT call activateRoadmap.

/**
 * Ensure a completed Premium user has GenAI roadmap artifacts.
 *
 * @param {string} firebaseUID
 * @returns {Promise<object>} Controlled result object.
 */
export async function ensurePremiumGenAiUpgrade(
  firebaseUID,
) {
  await connectToDB();

  // 1. Load user
  const user =
    await UserProfile.findOne({
      firebaseUID,
    });

  if (!user) {
    return {
      status: 404,
      success: false,
      error:
        "User profile not found",
    };
  }

  // 2. Require completed onboarding
  if (!isOnboardingComplete(user)) {
    return {
      status: 409,
      success: false,
      upgradeStatus: "incomplete_onboarding",
      error:
        "Onboarding must be completed before upgrading",
    };
  }

  // 3. Require Premium entitlement -- server/payment owned, never client-derived
  if (
    user.entitlements?.roadmaps
      ?.genAi !== true
  ) {
    return {
      status: 403,
      success: false,
      upgradeStatus:
        "not_entitled",
      error:
        "Premium GenAI entitlement required",
    };
  }

  // 4. Load canonical V4 diagnostic
  const onboardingResponse =
    await OnboardingResponseModel.findOne(
      {
        firebaseUID,
        onboardingVersion: "v4",
      },
    );

  // 5. Classify -- must be reusable, not merely present
  const classification =
    classifyV4Diagnostic(
      onboardingResponse,
    );

  if (
    classification.reusable !==
    true
  ) {
    return {
      status: 409,
      success: false,
      upgradeStatus:
        "calibration_required",
      error:
        "Reusable V4 diagnostic required",
    };
  }

  // 6. Validate goal
  const goal =
    onboardingResponse
      .primaryGoalSnapshot;

  if (!goal) {
    return {
      status: 422,
      success: false,
      upgradeStatus:
        "missing_goal",
      error:
        "Primary goal is required",
    };
  }

  const motivation =
    mapGoalToMotivation(goal);

  if (!motivation) {
    return {
      status: 422,
      success: false,
      upgradeStatus:
        "invalid_goal",
      error:
        "Invalid goal mapping",
    };
  }

  // 7. Resolve schedule
  const scheduleResult =
    resolveUpgradeSchedule(
      user.schedulePreference,
    );

  if (!scheduleResult.ok) {
    return {
      status: 422,
      success: false,
      upgradeStatus:
        "invalid_schedule",
      error:
        scheduleResult.error,
    };
  }

  const resolvedSchedule =
    scheduleResult.schedule;

  // 8. Load roadmap template
  const template =
    await RoadmapTemplate.findBySlug(
      GENAI_SLUG,
    );

  if (!template) {
    return {
      status: 500,
      success: false,
      upgradeStatus:
        "template_missing",
      error:
        `Roadmap template '${GENAI_SLUG}' not found`,
    };
  }

  // 9. Reconstruct diagnostics and compile roadmap
  let diagnostics;

  try {
    diagnostics =
      reconstructDiagnostics(
        onboardingResponse.responses,
        onboardingResponse.entryPoint,
      );
  } catch (err) {
    return {
      status: 422,
      success: false,
      upgradeStatus:
        "diagnostic_reconstruction_failed",
      error: err.message,
    };
  }

  const routing =
    buildRouting(diagnostics);

  const compiled =
    compileRoadmap(
      template,
      routing,
    );

  const {
    includedDayIds,
    optionalDayIds,
    skippedDayIds,
    totalLevels,
  } = compiled;

  const diagnosticsArray =
    buildDiagnosticsArray(
      diagnostics,
    );

  // 10. Build desired personalization shape
  const desiredPersonalization =
  {
    userId: user._id,
    firebaseUID,
    roadmapSlug:
      GENAI_SLUG,
    includedDayIds,
    optionalDayIds,
    skippedDayIds,
    totalLevels,
    schedule:
      resolvedSchedule,
    motivation,
    diagnostics:
      diagnosticsArray,
    templateSnapshotAt:
      template.updatedAt ||
      new Date(),
    isActive: true,
  };

  // 11. Execute with rollback safety
  return _executeUpgrade(
    user,
    template,
    desiredPersonalization,
    totalLevels,
  );
}

// ------ _executeUpgrade -------------------------------------------------------
//
// Tracks created/archived artifacts for rollback.
//
// Invariant after any controlled failure:
//   - either the original personalization is still active, OR
//   - the new personalization is active and canonical
//   - never silently leaves both inactive

async function _executeUpgrade(
  user,
  template,
  desiredPersonalization,
  totalLevels,
) {
  const { firebaseUID } =
    user;

  const roadmapSlug =
    GENAI_SLUG;

  // Rollback tracking -- only artifacts created or archived by THIS call
  let createdPersonalizationId =
    null;

  let archivedPersonalizationId =
    null;

  let createdProgressId =
    null;

  try {
    /*
     * Preflight progress cardinality before any
     * personalization mutation.
     *
     * RoadmapProgress is uniquely owned by
     * firebaseUID + roadmapSlug. More than one
     * document is a structural conflict and must
     * fail before we archive/create anything.
     */
    const progressDocs =
      await RoadmapProgress.find({
        firebaseUID,
        roadmapSlug,
      });

    if (
      progressDocs.length > 1
    ) {
      const err =
        new Error(
          "Multiple roadmap progress documents found. Conflict.",
        );

      err.status = 422;

      throw err;
    }

    // ---- A. Personalization handling -----------------------------------------

    const activePersonalizations =
      await RoadmapPersonalization.find(
        {
          firebaseUID,
          roadmapSlug,
          isActive: true,
        },
      );

    if (
      activePersonalizations.length >
      1
    ) {
      const err =
        new Error(
          "Multiple active personalizations found. Conflict.",
        );

      err.status = 422;

      throw err;
    }

    let finalPersonalizationId;

    let alreadyUpgraded =
      false;

    if (
      activePersonalizations.length ===
      0
    ) {
      // CASE A -- No active personalization exists
      const createResult =
        await _createPersonalization(
          desiredPersonalization,
          1,
        );

      if (
        createResult.__isConflict
      ) {
        /*
         * Fresh creation lost the unique-index race.
         * There was no previous personalization, so
         * there is nothing to restore.
         *
         * Reload the active winner and reuse it only
         * when it is equivalent to the desired state.
         */
        const winner =
          await RoadmapPersonalization.findOne(
            {
              firebaseUID,
              roadmapSlug,
              isActive: true,
            },
          );

        if (
          winner &&
          isPersonalizationEquivalent(
            winner,
            desiredPersonalization,
          )
        ) {
          finalPersonalizationId =
            winner._id;

          alreadyUpgraded =
            true;
        } else {
          const err =
            new Error(
              "Concurrent personalization conflict during fresh creation.",
            );

          err.status = 409;

          throw err;
        }
      } else {
        createdPersonalizationId =
          createResult.id;

        finalPersonalizationId =
          createResult.id;
      }
    } else {
      // CASE B or C -- One active personalization exists
      const existing =
        activePersonalizations[0];

      if (
        isPersonalizationEquivalent(
          existing,
          desiredPersonalization,
        )
      ) {
        // CASE B -- Equivalent; reuse
        finalPersonalizationId =
          existing._id;

        alreadyUpgraded =
          true;
      } else {
        // CASE C -- Stale; archive and create new version

        // Load ALL personalizations (active + inactive) for version calculation
        const allPersonalizations =
          await RoadmapPersonalization.find(
            {
              firebaseUID,
              roadmapSlug,
            },
          );

        const nextVersion =
          computeNextVersion(
            allPersonalizations,
          );

        // Concurrency-safe archive: guard against _id AND current isActive
        const archiveResult =
          await RoadmapPersonalization.updateOne(
            {
              _id: existing._id,
              isActive: true,
            },
            {
              $set: {
                isActive: false,
              },
            },
          );

        if (
          archiveResult.matchedCount ===
          0
        ) {
          /*
           * Concurrent change beat us.
           * Reload the active owner and accept it
           * only when it is equivalent.
           */
          const reloaded =
            await RoadmapPersonalization.findOne(
              {
                firebaseUID,
                roadmapSlug,
                isActive: true,
              },
            );

          if (
            reloaded &&
            isPersonalizationEquivalent(
              reloaded,
              desiredPersonalization,
            )
          ) {
            finalPersonalizationId =
              reloaded._id;

            alreadyUpgraded =
              true;
          } else {
            const err =
              new Error(
                "Concurrent personalization change detected during archive. Retry.",
              );

            err.status = 409;

            throw err;
          }
        } else {
          // Archive succeeded -- record for rollback
          archivedPersonalizationId =
            existing._id;

          const createResult =
            await _createPersonalization(
              desiredPersonalization,
              nextVersion,
            );

          if (
            createResult.__isConflict
          ) {
            /*
             * Another request may have acquired the
             * unique active-personalization slot.
             *
             * Inspect the current active owner BEFORE
             * attempting to restore the personalization
             * archived by this invocation.
             */
            const winner =
              await RoadmapPersonalization.findOne(
                {
                  firebaseUID,
                  roadmapSlug,
                  isActive: true,
                },
              );

            if (winner) {
              /*
               * Another document owns the active slot.
               *
               * Never reactivate the archived document
               * beside it because that would violate
               * the single-active-personalization
               * invariant.
               */
              archivedPersonalizationId =
                null;

              if (
                isPersonalizationEquivalent(
                  winner,
                  desiredPersonalization,
                )
              ) {
                finalPersonalizationId =
                  winner._id;

                alreadyUpgraded =
                  true;
              } else {
                const err =
                  new Error(
                    "Concurrent personalization state changed during versioned creation.",
                  );

                err.status = 409;

                throw err;
              }
            } else {
              /*
               * The replacement create conflicted,
               * but there is no active winner now.
               *
               * Restore the exact personalization
               * archived by this invocation.
               */
              const restoreResult =
                await _safeRestorePersonalization(
                  archivedPersonalizationId,
                );

              if (
                restoreResult.restored
              ) {
                archivedPersonalizationId =
                  null;

                const err =
                  new Error(
                    "Concurrent personalization conflict detected. Previous personalization restored; retry.",
                  );

                err.status = 409;

                throw err;
              }

              /*
               * State may have changed between the
               * active-winner lookup and the restore.
               * Re-read the active slot once.
               */
              const latestActive =
                await RoadmapPersonalization.findOne(
                  {
                    firebaseUID,
                    roadmapSlug,
                    isActive: true,
                  },
                );

              if (latestActive) {
                /*
                 * Another active owner appeared.
                 * Never allow the outer rollback to
                 * reactivate the archived document
                 * beside this active owner.
                 */
                archivedPersonalizationId =
                  null;

                if (
                  isPersonalizationEquivalent(
                    latestActive,
                    desiredPersonalization,
                  )
                ) {
                  finalPersonalizationId =
                    latestActive._id;

                  alreadyUpgraded =
                    true;
                } else {
                  const err =
                    new Error(
                      "Concurrent personalization state changed during recovery.",
                    );

                  err.status = 409;

                  throw err;
                }
              } else {
                /*
                 * No active winner exists and the
                 * direct restore was not applied.
                 *
                 * Keep archivedPersonalizationId
                 * tracked so outer rollback gets
                 * one final restoration attempt.
                 */
                const err =
                  new Error(
                    "Unable to restore a canonical active personalization after concurrent modification.",
                  );

                err.status = 500;

                throw err;
              }
            }
          } else {
            createdPersonalizationId =
              createResult.id;

            finalPersonalizationId =
              createResult.id;
          }
        }
      }
    }

    // ---- B. Progress handling ------------------------------------------------
    //
    // Existing progress is reused exactly as read during preflight.
    // No write is issued against an existing progress document.

    let finalProgressId;

    if (
      progressDocs.length === 1
    ) {
      finalProgressId =
        progressDocs[0]._id;
    } else {
      // No progress -- create with the same initial contract as Premium activation
      const createResult =
        await _createProgress(
          user,
          template,
          totalLevels,
          roadmapSlug,
          firebaseUID,
        );

      if (
        createResult.__isConflict
      ) {
        // Concurrent winner -- reload and reuse
        const winner =
          await RoadmapProgress.findOne(
            {
              firebaseUID,
              roadmapSlug,
            },
          );

        if (!winner) {
          const err =
            new Error(
              "Progress creation conflict but winner not found.",
            );

          err.status = 409;

          throw err;
        }

        finalProgressId =
          winner._id;
      } else {
        createdProgressId =
          createResult._id;

        finalProgressId =
          createResult._id;
      }
    }

    if (
      !finalPersonalizationId ||
      !finalProgressId
    ) {
      throw new Error(
        "Failed to secure canonical personalization and progress documents.",
      );
    }

    // ---- C. Profile reference update ----------------------------------------
    //
    // Guard: only matches a fully-completed Premium user.
    // Sets ONLY roadmapPersonalizationRef and roadmap_name.
    // Does NOT set onboardingComplete, onboardingState, completedAt, entitlements.

    const updateResult =
      await UserProfile.updateOne(
        {
          _id: user._id,
          onboardingComplete: true,
          "entitlements.roadmaps.genAi":
            true,
          $or: [
            {
              onboardingVersion: {
                $ne: "v4",
              },
            },
            {
              onboardingVersion: "v4",
              "onboardingState.step":
                "completed",
            },
          ],
        },
        {
          $set: {
            roadmapPersonalizationRef:
              finalPersonalizationId,
            roadmap_name:
              template.title,
          },
        },
        {
          timestamps: false,
        },
      );

    if (
      updateResult.matchedCount ===
      0 &&
      updateResult.modifiedCount ===
      0
    ) {
      const err =
        new Error(
          "User entitlement or onboarding state changed during upgrade",
        );

      err.status = 409;

      throw err;
    }

    // ---- D. Determine alreadyUpgraded flag ----------------------------------

    const profileRefMatch =
      user.roadmapPersonalizationRef?.toString() ===
      finalPersonalizationId?.toString();

    const nothingCreated =
      !createdPersonalizationId &&
      !createdProgressId &&
      !archivedPersonalizationId;

    const computedAlreadyUpgraded =
      alreadyUpgraded &&
      profileRefMatch &&
      nothingCreated;

    return {
      status: 200,
      success: true,
      upgradeStatus: "ready",
      alreadyUpgraded:
        computedAlreadyUpgraded,
      personalizationId:
        String(
          finalPersonalizationId,
        ),
      progressId:
        String(finalProgressId),
    };
  } catch (err) {
    console.error(
      "[ensurePremiumGenAiUpgrade] Upgrade failed. Rolling back...",
      err.message,
    );

    // Rollback: only delete/restore artifacts created or archived by THIS call.
    // Pre-existing progress is NEVER touched during rollback.

    if (
      createdPersonalizationId
    ) {
      await RoadmapPersonalization.deleteOne(
        {
          _id:
            createdPersonalizationId,
        },
      ).catch((deleteError) => {
        console.error(
          "[upgrade rollback] personalization delete failed:",
          deleteError.message,
        );
      });
    }

    if (
      archivedPersonalizationId
    ) {
      try {
        const restoreResult =
          await _safeRestorePersonalization(
            archivedPersonalizationId,
          );

        if (
          !restoreResult.restored
        ) {
          console.error(
            "[upgrade rollback] personalization restore was not applied:",
            restoreResult.reason,
          );
        }
      } catch (restoreError) {
        console.error(
          "[upgrade rollback] personalization restore failed:",
          restoreError.message,
        );
      }
    }

    if (createdProgressId) {
      await RoadmapProgress.deleteOne(
        {
          _id: createdProgressId,
        },
      ).catch((deleteError) => {
        console.error(
          "[upgrade rollback] progress delete failed:",
          deleteError.message,
        );
      });
    }

    const isSafeClientError =
      err.status === 403 ||
      err.status === 404 ||
      err.status === 409 ||
      err.status === 422;

    return {
      status:
        err.status || 500,
      success: false,
      upgradeStatus:
        isSafeClientError
          ? err.upgradeStatus ||
          "conflict"
          : "internal_error",
      error:
        isSafeClientError
          ? err.message
          : "Upgrade failed safely",
    };
  }
}

// ------ Internal helpers ------------------------------------------------------

/**
 * Creates a new RoadmapPersonalization.
 *
 * Returns:
 *   { id, __isConflict: false } on success
 *   { __isConflict: true } on duplicate-key (11000)
 */
async function _createPersonalization(
  desiredPersonalization,
  version,
) {
  try {
    const doc =
      await RoadmapPersonalization.create(
        {
          ...desiredPersonalization,
          version,
          isActive: true,
        },
      );

    return {
      id: doc._id,
      __isConflict: false,
    };
  } catch (err) {
    if (err.code === 11000) {
      return {
        __isConflict: true,
      };
    }

    throw err;
  }
}

/**
 * Creates a new RoadmapProgress with the same
 * initial contract as Premium activation.
 *
 * Returns the created document on success.
 * Returns { __isConflict: true } on duplicate-key (11000).
 */
async function _createProgress(
  user,
  template,
  totalLevels,
  roadmapSlug,
  firebaseUID,
) {
  try {
    return await RoadmapProgress.create(
      {
        userId: user._id,
        firebaseUID,
        roadmapSlug,
        roadmapTitle:
          template.title,
        role: user.role,
        status:
          "not_started",
        completedLevels: [],
        totalLevels,
        completedDays: [],
        passedAssignments: [],
        startedAt: null,
        completedAt: null,
        lastLearningActiveAt:
          null,
      },
    );
  } catch (err) {
    if (err.code === 11000) {
      return {
        __isConflict: true,
      };
    }

    throw err;
  }
}

/**
 * Guardedly restores an archived personalization
 * to the active state.
 *
 * Returns a structured result for expected
 * restore conflicts and rethrows unexpected
 * persistence failures.
 */
async function _safeRestorePersonalization(
  personalizationId,
) {
  try {
    const result =
      await RoadmapPersonalization.updateOne(
        {
          _id:
            personalizationId,
          isActive: false,
        },
        {
          $set: {
            isActive: true,
          },
        },
      );

    if (
      result.matchedCount === 0
    ) {
      return {
        restored: false,
        reason:
          "not_inactive",
      };
    }

    return {
      restored: true,
      reason: null,
    };
  } catch (error) {
    /*
     * Another active personalization may have won
     * the unique-index race before restoration.
     */
    if (
      error?.code === 11000
    ) {
      return {
        restored: false,
        reason:
          "active_conflict",
      };
    }

    throw error;
  }
}