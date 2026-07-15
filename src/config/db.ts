import mongoose from "mongoose";
import dns from "dns";

// Some ISPs/routers (a known recurring issue in Bangladesh) fail to resolve
// the SRV/TXT DNS records that "mongodb+srv://" connection strings depend
// on, causing "querySrv ENOTFOUND" errors on LOCAL machines. Vercel's own
// infrastructure doesn't have this problem, and forcing an external DNS
// server there could be blocked by its sandboxed network, so this override
// only runs outside of Vercel.
if (!process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not defined in environment variables.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    isConnected = true;
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};