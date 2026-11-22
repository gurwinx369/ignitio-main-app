import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cached connection and promise for serverless warm execution reuse
let projectsConnection = null;
let projectsConnectionPromise = null;

/**
 * Connect to the dedicated Projects MongoDB cluster.
 * Falls back gracefully to primary MONGO_URI if PROJECTS_MONGO_URI is absent or invalid.
 */
export const connectProjectsDB = async () => {
  // If already connected, return existing connection
  if (projectsConnection && projectsConnection.readyState === 1) {
    return projectsConnection;
  }

  // If a connection is in-flight, await it to prevent duplicate connection races
  if (projectsConnectionPromise) {
    return projectsConnectionPromise;
  }

  const rawProjectsUri = process.env.PROJECTS_MONGO_URI?.trim().replace(/\r/g, "");
  const mainUri = process.env.MONGO_URI?.trim().replace(/\r/g, "");

  // Use PROJECTS_MONGO_URI only if defined and not a placeholder
  const isInvalidProjectsUri = !rawProjectsUri ||
    rawProjectsUri.includes("<db_username>") || 
    rawProjectsUri.includes("<db_password>") ||
    rawProjectsUri.includes("YOUR_USER");

  let targetUri = (!isInvalidProjectsUri && rawProjectsUri) ? rawProjectsUri : mainUri;

  if (!targetUri) {
    throw new Error("[ProjectsDB] Neither PROJECTS_MONGO_URI nor MONGO_URI is defined.");
  }

  const attempt = async () => {
    for (let i = 1; i <= MAX_RETRIES; i++) {
      let conn = null;
      try {
        // Use createConnection so projects cluster has an isolated pool
        conn = mongoose.createConnection(targetUri, {
          dbName: "ignitio_projects",
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 8000,
          maxPoolSize: 5, // Strict low pool for free-tier Atlas M0 (500 conn limit)
          minPoolSize: 1,
          socketTimeoutMS: 30000,
        });

        // Intercept error events immediately to avoid unhandled event crashes
        conn.on("error", (err) => {
          console.error("[ProjectsDB] Connection error:", err.message);
        });

        conn.on("disconnected", () => {
          console.warn("[ProjectsDB] Disconnected from Projects cluster");
          projectsConnectionPromise = null;
          projectsConnection = null;
        });

        await conn.asPromise();

        projectsConnection = conn;
        return projectsConnection;
      } catch (error) {
        console.error(`[ProjectsDB] Attempt ${i}/${MAX_RETRIES} failed: ${error.message}`);

        // Safely close dangling sockets from failed attempt before retry
        if (conn) {
          await conn.close().catch(() => {});
          conn = null;
        }
        projectsConnection = null;

        // If connecting to PROJECTS_MONGO_URI failed and we haven't tried mainUri yet, fallback to mainUri
        if (targetUri !== mainUri && mainUri) {
          console.warn("[ProjectsDB] Falling back to primary MONGO_URI...");
          targetUri = mainUri;
        }

        if (i < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * i);
        } else {
          projectsConnectionPromise = null;
          projectsConnection = null;
          throw new Error(`[ProjectsDB] Connection failed after ${MAX_RETRIES} attempts: ${error.message}`);
        }
      }
    }
  };

  projectsConnectionPromise = attempt().catch((err) => {
    projectsConnectionPromise = null;
    projectsConnection = null;
    throw err;
  });
  return projectsConnectionPromise;
};

export default connectProjectsDB;
