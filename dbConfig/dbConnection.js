import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Module-level promise cache — survives across warm serverless invocations.
// Prevents parallel cold-start calls from each triggering mongoose.connect()
// (the double-connection race when readyState === 2 / "connecting").
let connectionPromise = null;

const connectDB = async () => {
  // Validate env at call time — dotenv should be configured at app entry point, not here
  const uri = process.env.MONGO_URI?.trim().replace(/\r/g, "");
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  // readyState 1 = connected — fast path, no work needed
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // readyState 2 = connecting — another call already holds the promise,
  // await it instead of calling mongoose.connect() a second time
  if (connectionPromise) {
    return connectionPromise;
  }

  const attempt = async () => {
    for (let i = 1; i <= MAX_RETRIES; i++) {
      try {
        const connection = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
          maxPoolSize: 10,
          minPoolSize: 1,
          socketTimeoutMS: 45000,
        });

        // Register listeners only once — avoid duplicate handlers on reconnect
        if (!mongoose.connection.listenerCount("disconnected")) {
          mongoose.connection.on("disconnected", () => {
            console.warn("[DB] MongoDB disconnected");
            connectionPromise = null; // allow reconnect on next call
          });
        }
        if (!mongoose.connection.listenerCount("error")) {
          mongoose.connection.on("error", (err) => {
            console.error("[DB] MongoDB error:", err.message);
          });
        }

        return connection;
      } catch (error) {
        console.error(`[DB] Attempt ${i}/${MAX_RETRIES} failed: ${error.message}`);

        if (i < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * i);
        } else {
          connectionPromise = null; // clear so next request can retry
          // Throw instead of process.exit() — lets the caller (route handler) decide what to do
          throw new Error(
            `MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`,
          );
        }
      }
    }
  };

  connectionPromise = attempt();
  return connectionPromise;
};

export default connectDB;
