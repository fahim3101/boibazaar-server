import mongoose, { Schema, Document } from "mongoose";

export type AuthProvider = "local" | "google" | "facebook";
export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  university?: string;
  phone?: string;
  authProvider: AuthProvider;
  photoUrl?: string;
  role: UserRole;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required at the schema level because social-login accounts have no password.
    password: { type: String },
    university: { type: String, default: "" },
    phone: { type: String, default: "" },
    authProvider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    photoUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
