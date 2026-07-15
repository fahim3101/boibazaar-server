import { Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth";
import { getFirebaseAdmin } from "../config/firebaseAdmin";

const toUserPayload = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  university: user.university,
  authProvider: user.authProvider,
  photoUrl: user.photoUrl,
  role: user.role,
});

export const registerUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, university, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      university: university || "",
      phone: phone || "",
      authProvider: "local",
    });

    const token = generateToken(String(user._id));

    res.status(201).json({ token, user: toUserPayload(user) });
  } catch (error: any) {
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

export const loginUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.authProvider !== "local" || !user.password) {
      return res.status(400).json({
        message: `This account was created with ${user.authProvider === "google" ? "Google" : "Facebook"} sign-in. Please use that button to log in instead.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(String(user._id));

    res.status(200).json({ token, user: toUserPayload(user) });
  } catch (error: any) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

// POST /api/auth/social - handles both Google and Facebook sign-in.
// The client authenticates with Firebase directly, then sends us the
// resulting Firebase ID token. We verify it server-side (never trusting
// anything the client claims about itself) and find-or-create a local user.
export const socialLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing Firebase ID token." });
    }

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);

    const email = decoded.email;
    if (!email) {
      return res.status(400).json({ message: "This account has no email address on file." });
    }

    const provider = decoded.firebase?.sign_in_provider === "facebook.com" ? "facebook" : "google";

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: decoded.name || email.split("@")[0],
        email: email.toLowerCase(),
        authProvider: provider,
        photoUrl: decoded.picture || "",
      });
    } else if (user.authProvider === "local") {
      // An account with this email already exists via email/password signup.
      return res.status(409).json({
        message: "An account with this email already exists. Please log in with your password instead.",
      });
    }

    const token = generateToken(String(user._id));

    res.status(200).json({ token, user: toUserPayload(user) });
  } catch (error: any) {
    res.status(401).json({ message: "Social sign-in failed. Please try again.", error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch user.", error: error.message });
  }
};
