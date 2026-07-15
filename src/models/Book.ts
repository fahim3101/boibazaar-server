import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview {
  userId: Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IBook extends Document {
  title: string;
  author: string;
  subject: string;
  edition: string;
  condition: "New" | "Like New" | "Good" | "Fair" | "Worn";
  price: number;
  shortDescription: string;
  fullDescription: string;
  imageUrl?: string;
  location: string;
  university: string;
  sellerId: Types.ObjectId;
  sellerName: string;
  sellerEmail: string;
  reviews: IReview[];
  avgRating: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    edition: { type: String, default: "1st" },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Worn"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    shortDescription: { type: String, required: true, maxlength: 160 },
    fullDescription: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    location: { type: String, required: true },
    university: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    reviews: { type: [ReviewSchema], default: [] },
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BookSchema.index({ title: "text", author: "text", subject: "text" });

export const Book = mongoose.model<IBook>("Book", BookSchema);
