import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { User } from "../models/User";

// Must run AFTER `protect`, since it relies on req.userId being set.
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only." });
    }
    next();
  } catch (error: unknown) {
    console.error("requireAdmin failed:", error);
    res.status(500).json({ message: "Could not verify admin access." });
  }
};
