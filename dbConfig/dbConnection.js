import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  // Validate env at call time — dotenv should be configured at app entry point, not here
  const uri = process.env.MONGO_URI_DEV?.trim().replace(/\r/g, "");
  if (!uri) {
    throw new Error("MONGO_URI_DEV is not defined in environment variables");
  }

  // Reuse existing connection — critical in Next.js due to hot reloading
  // creating hundreds of connections in development
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("[DB] MongoDB disconnected");
      });

      mongoose.connection.on("error", (err) => {
        console.error("[DB] MongoDB error:", err.message);
      });

      return connection;
    } catch (error) {
      console.error(
        `[DB] Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`,
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      } else {
        // Throw instead of process.exit() — lets the caller (route handler) decide what to do
        throw new Error(
          `MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`,
        );
      }
    }
  }
};

export default connectDB;
