import mongoose from "mongoose";
import dns from "dns";

// Some ISPs/routers (common issue in Bangladesh) fail to resolve the SRV/TXT
// DNS records that "mongodb+srv://" connection strings depend on, causing
// "querySrv ENOTFOUND" errors. Forcing Node's resolver to use Google's public
// DNS fixes this without needing any system-level network changes.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  // Vercel serverless functions can reuse a "warm" instance between
  // requests, so avoid reconnecting (and avoid crashing the whole function)
  // if we're already connected.
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    // IMPORTANT: never call process.exit() here. In a serverless function,
    // that kills the entire function invocation and turns every request
    // (even unrelated ones like GET /) into a 500 FUNCTION_INVOCATION_FAILED.
    // Instead we just log clearly and let requests that need the DB fail
    // individually with a normal error response.
    console.error("MONGO_URI is not defined in environment variables.");
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // Same reasoning as above — log, don't crash the process.
  }
};