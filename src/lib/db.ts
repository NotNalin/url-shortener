import mongoose from "mongoose";

let isConnected = false;

/**
 * Logger function that provides consistent logging with potential for
 * environment-specific behaviors (development vs production)
 */
export const logger = {
  info: (message: string): void => {
    // In production, this could be replaced with a proper logging service
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${message}`);
    }
  },
  error: (message: string, error?: unknown): void => {
    // Always log errors, but in production this could go to a monitoring service
    console.error(`[ERROR] ${message}`, error || "");
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB URI is not defined");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for operations
    });

    isConnected = true;
    logger.info("Connected to MongoDB");

    // Handle application shutdown gracefully
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
};

/**
 * Gracefully closes the MongoDB connection when the application shuts down
 */
async function cleanup() {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    logger.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
}
