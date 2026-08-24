import { Router } from "express";
import * as chatController from "../controllers/chatController";

const router = Router();

// Public route — the Gemini API key stays on the server.
router.post("/", chatController.chat);

export default router;
