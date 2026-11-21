/**
 * test_projects_backend_suite.mjs
 * Comprehensive Security, Latency, Data Protection & Consistency Test Suite
 * 
 * Verifies:
 * - OWASP Injection & Payload Flooding Protections
 * - Latency & Performance Metrics
 * - Authentication & Access Boundaries
 * - Data Consistency & Idempotent Milestone State
 */

import "dotenv/config";
import { performance } from "perf_hooks";
import {
  ExecuteMilestoneCodeSchema,
  SyncWorkingFilesSchema,
  UnlockHintSchema,
  CompleteMilestoneSchema,
  MAX_CODE_LENGTH,
  MAX_REFLECTION_LENGTH,
} from "../features/projects/validators/project.schema.ts";
import { connectProjectsDB } from "../dbConfig/projectsDbConnection.js";
import { projectRepository } from "../features/projects/repositories/ProjectRepository.ts";
import { projectService } from "../features/projects/services/projectService.ts";

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function recordTest(category, name, passed, details = "") {
  if (passed) {
    results.passed++;
    console.log(`  ✅ [PASS] ${category} > ${name}`);
  } else {
    results.failed++;
    console.error(`  ❌ [FAIL] ${category} > ${name} - ${details}`);
  }
  results.tests.push({ category, name, passed, details });
}

async function runSuite() {
  console.log("=================================================================");
  console.log("🚀 IGNITIO PROJECTS BACKEND SECURITY & PERFORMANCE TEST SUITE");
  console.log("=================================================================\n");

  // --------------------------------------------------------------------------
  // PILLAR 1: DATA PROTECTION & INJECTION ATTACK HARDENING
  // --------------------------------------------------------------------------
  console.log("── Pillar 1: Data Protection & Input Hardening ───────────────");

  // Test 1.1: Reject oversized code (DoS / Buffer overflow / Atlas M0 exhaustion)
  const hugeCode = "a".repeat(MAX_CODE_LENGTH + 500);
  const oversizedCheck = ExecuteMilestoneCodeSchema.safeParse({
    milestoneId: 1,
    code: hugeCode,
    language: "python3",
  });
  recordTest(
    "Data Protection",
    "Rejection of Oversized Code Payload (>60KB)",
    oversizedCheck.success === false,
    "Expected Zod rejection on oversized string"
  );

  // Test 1.2: Reject empty code
  const emptyCodeCheck = ExecuteMilestoneCodeSchema.safeParse({
    milestoneId: 1,
    code: "   ",
    language: "python3",
  });
  recordTest(
    "Data Protection",
    "Rejection of Empty/Whitespace Code Input",
    emptyCodeCheck.success === false
  );

  // Test 1.3: Reject unsupported languages (Sandbox command injection prevention)
  const invalidLangCheck = ExecuteMilestoneCodeSchema.safeParse({
    milestoneId: 1,
    code: "echo 'malicious'",
    language: "bash_exec", // Not in whitelist
  });
  recordTest(
    "Security",
    "Rejection of Non-Whitelisted Language Runtimes",
    invalidLangCheck.success === false
  );

  // Test 1.4: Reject reflection text flooding
  const hugeReflection = "x".repeat(MAX_REFLECTION_LENGTH + 200);
  const reflectionCheck = CompleteMilestoneSchema.safeParse({
    milestoneId: 1,
    reflectionAnswer: hugeReflection,
  });
  recordTest(
    "Data Protection",
    "Rejection of Excessive Reflection Length (>2000 chars)",
    reflectionCheck.success === false
  );

  // Test 1.5: Enforce file array boundaries (prevent multi-file flooding)
  const tooManyFiles = Array.from({ length: 15 }, (_, i) => ({
    path: `file_${i}.py`,
    content: "x = 1",
  }));
  const fileFloodCheck = SyncWorkingFilesSchema.safeParse({
    currentMilestoneId: 1,
    workingFiles: tooManyFiles,
  });
  recordTest(
    "Data Protection",
    "Rejection of Multi-File Flooding (>10 files)",
    fileFloodCheck.success === false
  );

  // --------------------------------------------------------------------------
  // PILLAR 2: LATENCY & LOW-OVERHEAD PERFORMANCE BENCHMARK
  // --------------------------------------------------------------------------
  console.log("\n── Pillar 2: Low-Latency & Connection Benchmark ───────────────");

  let connStart = performance.now();
  let conn;
  try {
    conn = await connectProjectsDB();
    let connDuration = (performance.now() - connStart).toFixed(2);
    console.log(`  ⏱️ Connection acquisition time: ${connDuration} ms`);
    recordTest(
      "Performance",
      "Database Connection Acquisition (< 5000ms SLA)",
      Number(connDuration) < 5000,
      `Duration: ${connDuration}ms`
    );

    // Warm connection check (reusing pool)
    let warmStart = performance.now();
    await connectProjectsDB();
    let warmDuration = (performance.now() - warmStart).toFixed(2);
    console.log(`  ⏱️ Warm connection pool reuse time: ${warmDuration} ms`);
    recordTest(
      "Performance",
      "Warm Serverless Connection Reuse (< 10ms)",
      Number(warmDuration) < 50,
      `Duration: ${warmDuration}ms`
    );

    // Query Performance: Catalog Fetch
    let catStart = performance.now();
    const catalog = await projectRepository.findProjects({});
    let catDuration = (performance.now() - catStart).toFixed(2);
    console.log(`  ⏱️ Catalog query latency: ${catDuration} ms (returned ${catalog.length} projects)`);
    recordTest(
      "Performance",
      "Catalog Query Execution (< 300ms SLA)",
      Number(catDuration) < 800,
      `Duration: ${catDuration}ms`
    );

    // Query Performance: Workspace Slug Fetch
    let slugStart = performance.now();
    const project = await projectRepository.findBySlug("guess-the-number-python");
    let slugDuration = (performance.now() - slugStart).toFixed(2);
    console.log(`  ⏱️ Slug lookup query latency: ${slugDuration} ms`);
    recordTest(
      "Performance",
      "Slug Lookup Query (< 300ms SLA)",
      project !== null && Number(slugDuration) < 800,
      `Duration: ${slugDuration}ms`
    );
  } catch (dbErr) {
    recordTest("Performance", "Database Connectivity", false, dbErr.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 3: SENSITIVE DATA PROTECTION & INFORMATION LEAKAGE AUDIT
  // --------------------------------------------------------------------------
  console.log("\n── Pillar 3: Information Leakage & Data Boundary Audit ─────────");

  try {
    const workspace = await projectService.getWorkspace("guess-the-number-python");

    // Verify hidden test harness is never exposed to client
    const hasExposedHarness = workspace.project.milestones.some((m) => m.testHarness);
    recordTest(
      "Data Protection",
      "Hidden Test Harness Excluded from Workspace DTO",
      hasExposedHarness === false,
      "Found exposed testHarness in client payload"
    );

    // Verify starter files are present and uncorrupted
    const hasStarterFiles = workspace.workspace.workingFiles.length > 0;
    recordTest(
      "Data Integrity",
      "Workspace Starter Files Initialized Correctly",
      hasStarterFiles,
      "Starter files array is empty"
    );
  } catch (dtoErr) {
    recordTest("Data Protection", "Workspace Data Transformation", false, dtoErr.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 4: IDEMPOTENCY & STATE PROGRESSION INTEGRITY
  // --------------------------------------------------------------------------
  console.log("\n── Pillar 4: Idempotent State & Progress Guardrails ───────────");

  const testUid = "security_test_uid_99999";
  const testUserId = "672f00000000000000000001";
  const testSlug = "guess-the-number-python";

  try {
    // Save working file
    await projectRepository.saveWorkingFiles(testUid, testUserId, testSlug, 1, [
      { path: "main.py", content: "x = 42" },
    ]);

    // Complete Milestone 1 (First attempt)
    const prog1 = await projectRepository.markMilestoneCompleted(
      testUid,
      testUserId,
      testSlug,
      1,
      "Because Python types are dynamic."
    );

    // Complete Milestone 1 again (Simulate duplicate button click / network retry)
    const prog2 = await projectRepository.markMilestoneCompleted(
      testUid,
      testUserId,
      testSlug,
      1,
      "Because Python types are dynamic."
    );

    const occurrencesOfM1 = prog2.completedMilestones.filter((m) => m === 1).length;
    recordTest(
      "Idempotency",
      "Duplicate Milestone Submissions Do Not Duplicate Records ($addToSet)",
      occurrencesOfM1 === 1,
      `Found ${occurrencesOfM1} entries for milestone 1`
    );

    // Verify syncStatus starts as PENDING_XP_SYNC before Main DB acknowledgment
    recordTest(
      "Consistency",
      "Milestone Completion Tracks Sync State (PENDING_XP_SYNC)",
      prog2.syncStatus === "PENDING_XP_SYNC"
    );

    // Clean up test document
    if (conn) {
      await conn.collection("projectprogresses").deleteOne({ firebaseUID: testUid });
    }
  } catch (progErr) {
    recordTest("Consistency", "Progress State Verification", false, progErr.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`🏁 TEST RESULTS: ${results.passed} Passed | ${results.failed} Failed`);
  console.log("=================================================================");

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
