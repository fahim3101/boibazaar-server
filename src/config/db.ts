import mongoose from "mongoose";
import dns from "dns";

// Some ISPs/routers (common issue in Bangladesh) fail to resolve the SRV/TXT
// DNS records that "mongodb+srv://" connection strings depend on, causing
// "querySrv ENOTFOUND" errors. Forcing Node's resolver to use Google's public
// DNS fixes this without needing any system-level network changes.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
