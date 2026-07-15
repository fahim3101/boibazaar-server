import { Router } from "express";
import { protect } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getAdminStats,
  getAllBooksAdmin,
  getAllUsersAdmin,
  adminDeleteBook,
} from "../controllers/adminController";

const router = Router();

router.use(protect, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/books", getAllBooksAdmin);
router.get("/users", getAllUsersAdmin);
router.delete("/books/:id", adminDeleteBook);

export default router;
