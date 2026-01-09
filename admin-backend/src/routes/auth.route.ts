import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/me", requireAuth, me);

// Super admin only
router.post("/register", requireAuth, requireSuperAdmin, register);

export default router;

