import { Response } from "express";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { AuthRequest } from "../middleware/auth";

// GET /api/admin/stats
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalBooks] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
    ]);
    res.status(200).json({ totalUsers, totalBooks });
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch admin stats.", error: error.message });
  }
};

// GET /api/admin/books - every listing on the platform, any seller
export const getAllBooksAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json({ books });
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch listings.", error: error.message });
  }
};

// GET /api/admin/users - every registered user (no password field)
export const getAllUsersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch users.", error: error.message });
  }
};

// DELETE /api/admin/books/:id - admin can remove ANY listing, not just their own
export const adminDeleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Listing not found." });
    }
    await book.deleteOne();
    res.status(200).json({ message: "Listing removed by admin." });
  } catch (error: any) {
    res.status(500).json({ message: "Could not delete listing.", error: error.message });
  }
};
