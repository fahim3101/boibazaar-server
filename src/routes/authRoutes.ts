import { Router } from "express";
import { registerUser, loginUser, socialLogin, getMe } from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/social", socialLogin);
router.get("/me", protect, getMe);

export default router;
