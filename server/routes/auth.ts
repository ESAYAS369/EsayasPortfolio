import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { login, verifySession, logout } from "../controllers/authController";

const router = Router();

// Strict rate limit on login attempts to guard against brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 attempts per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait 15 minutes before trying again." },
});

router.post("/login", loginLimiter, login);
router.get("/verify", verifySession);
router.post("/logout", logout);

export default router;
