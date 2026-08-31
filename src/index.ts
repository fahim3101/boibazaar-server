import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import adminRoutes from "./routes/adminRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

dotenv.config();

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, mobile) with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development, be permissive for localhost:3000/3001
      if (origin.startsWith("http://localhost:")) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
// Analytics-friendly request logging - useful alongside Vercel Analytics
// Logs method, url, status and response time; disabled in test env
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}

// Attempt the MongoDB connection before every request (cheap no-op if
// already connected). This is more reliable in a serverless environment
// than a single fire-and-forget call at module load time.
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "BoiBazaar API is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`BoiBazaar server running on http://localhost:${PORT}`);
  });
}

export default app;
