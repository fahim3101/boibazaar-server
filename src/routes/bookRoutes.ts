import { Router } from "express";
import {
  getBooks,
  getMyBooks,
  getBookById,
  createBook,
  deleteBook,
  addReview,
} from "../controllers/bookController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getBooks);
router.get("/mine", protect, getMyBooks);
router.get("/:id", getBookById);
router.post("/", protect, createBook);
router.delete("/:id", protect, deleteBook);
router.post("/:id/reviews", protect, addReview);

export default router;
