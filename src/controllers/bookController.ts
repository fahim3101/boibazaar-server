import { Response } from "express";
import { FilterQuery, Types } from "mongoose";
import { Book, IBook } from "../models/Book";
import { AuthRequest } from "../middleware/auth";

// GET /api/books - public, supports search, filter, sort, pagination
export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = "",
      subject = "",
      condition = "",
      minPrice,
      maxPrice,
      sort = "newest",
      page = "1",
      limit = "8",
    } = req.query as Record<string, string>;

    const query: FilterQuery<IBook> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    if (subject) query.subject = subject;
    if (condition) query.condition = condition;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { avgRating: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page) || 1);
    // Cap page size so ?limit=1000000 can't dump the collection at once.
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 8));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      books,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error: unknown) {
    console.error("getBooks failed:", error);
    res.status(500).json({ message: "Could not fetch books." });
  }
};

// GET /api/books/mine - protected
export const getMyBooks = async (req: AuthRequest, res: Response) => {
  try {
    const books = await Book.find({ sellerId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ books });
  } catch (error: unknown) {
    console.error("getMyBooks failed:", error);
    res.status(500).json({ message: "Could not fetch your listings." });
  }
};

// GET /api/books/:id - public, includes related books
export const getBookById = async (req: AuthRequest, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book listing not found." });
    }

    const related = await Book.find({
      subject: book.subject,
      _id: { $ne: book._id },
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.status(200).json({ book, related });
  } catch (error: unknown) {
    console.error("getBookById failed:", error);
    res.status(500).json({ message: "Could not fetch book details." });
  }
};

// POST /api/books - protected
export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      author,
      subject,
      edition,
      condition,
      price,
      shortDescription,
      fullDescription,
      imageUrl,
      location,
      university,
      sellerName,
      sellerEmail,
    } = req.body;

    if (
      !title ||
      !author ||
      !subject ||
      !condition ||
      price === undefined ||
      !shortDescription ||
      !fullDescription ||
      !location ||
      !university
    ) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: "Price must be a positive number." });
    }

    const validConditions = ["New", "Like New", "Good", "Fair", "Worn"];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ message: "Please choose a valid condition." });
    }

    const book = await Book.create({
      title,
      author,
      subject,
      edition: edition || "1st",
      condition,
      price: priceNum,
      shortDescription,
      fullDescription,
      imageUrl: imageUrl || "",
      location,
      university,
      sellerId: req.userId,
      sellerName,
      sellerEmail,
    });

    res.status(201).json({ book });
  } catch (error: unknown) {
    console.error("createBook failed:", error);
    res.status(500).json({ message: "Could not create listing." });
  }
};

// DELETE /api/books/:id - protected, owner only
export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book listing not found." });
    }

    if (String(book.sellerId) !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own listings." });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Listing deleted successfully." });
  } catch (error: unknown) {
    console.error("deleteBook failed:", error);
    res.status(500).json({ message: "Could not delete listing." });
  }
};

// POST /api/books/:id/reviews - protected
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, userName } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book listing not found." });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    if (book.reviews.some((r) => String(r.userId) === req.userId)) {
      return res.status(409).json({ message: "You have already reviewed this listing." });
    }

    book.reviews.push({
      userId: new Types.ObjectId(req.userId),
      userName: userName || "Anonymous",
      rating: ratingNum,
      comment,
      createdAt: new Date(),
    });

    const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
    book.avgRating = totalRating / book.reviews.length;

    await book.save();
    res.status(201).json({ book });
  } catch (error: unknown) {
    console.error("addReview failed:", error);
    res.status(500).json({ message: "Could not add review." });
  }
};
