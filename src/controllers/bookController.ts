import { Response } from "express";
import { Book } from "../models/Book";
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

    const query: any = {};

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

    let sortOption: any = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    if (sort === "price_high") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { avgRating: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
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
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch books.", error: error.message });
  }
};

// GET /api/books/mine - protected
export const getMyBooks = async (req: AuthRequest, res: Response) => {
  try {
    const books = await Book.find({ sellerId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ books });
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch your listings.", error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ message: "Could not fetch book details.", error: error.message });
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

    const book = await Book.create({
      title,
      author,
      subject,
      edition: edition || "1st",
      condition,
      price,
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
  } catch (error: any) {
    res.status(500).json({ message: "Could not create listing.", error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ message: "Could not delete listing.", error: error.message });
  }
};

// POST /api/books/:id/reviews - protected
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, userName } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book listing not found." });
    }

    book.reviews.push({
      userId: req.userId as any,
      userName: userName || "Anonymous",
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    });

    const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
    book.avgRating = totalRating / book.reviews.length;

    await book.save();
    res.status(201).json({ book });
  } catch (error: any) {
    res.status(500).json({ message: "Could not add review.", error: error.message });
  }
};
