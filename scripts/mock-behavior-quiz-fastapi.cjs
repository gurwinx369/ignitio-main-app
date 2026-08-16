const http = require("node:http");
const { randomUUID } = require("node:crypto");

const port = Number(process.env.PORT || 8010);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let raw = "";

  for await (const chunk of request) {
    raw += chunk;
  }

  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(
  async (request, response) => {
    try {
      if (
        request.method === "POST" &&
        request.url ===
          "/api/v1/behavior/session/create"
      ) {
        const body = await readJson(request);

        const targets = Array.isArray(
          body.targetConcepts,
        )
          ? body.targetConcepts
          : [];

        return sendJson(response, 200, {
          sessionId: randomUUID(),
          quizItems: targets.map((target) => ({
            concept: target.concept,
            difficultyTier: "easy",
            question:
              `Mock question for ${target.concept}`,
            options: ["A", "B"],
            correctOption: "A",
            nOptions: 2,
            eiSnapshot: 10000,
            modelVersion: "v1",
          })),
        });
      }

      if (
        request.method === "POST" &&
        request.url ===
          "/api/v1/behavior/session/grade"
      ) {
        const body = await readJson(request);
        const attempts = Array.isArray(
          body.submittedAttempts,
        )
          ? body.submittedAttempts
          : [];

        // Keep both concurrent requests overlapping.
        await new Promise((resolve) =>
          setTimeout(resolve, 150),
        );

        const gradedAttempts = attempts.map(
          (attempt) => {
            const wasCorrect =
              attempt.selectedOption ===
              attempt.correctOption;

            return {
              concept: attempt.concept,
              difficultyTier:
                attempt.difficultyTier,
              question: attempt.question,
              wasCorrect,
              nOptions: attempt.nOptions,
              responseTimeMs:
                attempt.responseTimeMs,
              speedBucket: "MEDIUM",
              llrContribution: wasCorrect
                ? 0.5
                : -0.5,
              rgbFlag: false,
              modelVersion:
                attempt.modelVersion || "v1",
            };
          },
        );

        const updatedEiStats = {};
        const conceptVerdicts = {};

        for (const attempt of gradedAttempts) {
          const key =
            `${attempt.concept}::${attempt.difficultyTier}`;

          updatedEiStats[key] = {
            eiCurrent:
              attempt.responseTimeMs,
            sampleCount: 1,
          };

          conceptVerdicts[attempt.concept] = {
            llr_total:
              attempt.llrContribution,
            nAttempts: 1,
            verdict: "INSUFFICIENT_DATA",
            posterior: attempt.wasCorrect
              ? 0.6
              : 0.4,
          };
        }

        return sendJson(response, 200, {
          gradedAttempts,
          updatedEiStats,
          conceptVerdicts,
        });
      }

      return sendJson(response, 404, {
        error: "Mock endpoint not found",
      });
    } catch (error) {
      console.error(
        "[Mock Behavior API]",
        error,
      );

      return sendJson(response, 500, {
        error: "Mock server failure",
      });
    }
  },
);

server.listen(port, "127.0.0.1", () => {
  console.log(
    `Mock Behavior FastAPI running at http://127.0.0.1:${port}`,
  );
});