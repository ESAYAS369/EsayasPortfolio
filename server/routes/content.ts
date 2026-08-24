import { Router } from "express";
import * as contentController from "../controllers/contentController";

const router = Router();

// Public read — the site renders this content for all visitors.
router.get("/:key", contentController.getContent);

// Admin write
router.put("/:key", contentController.updateContent);

export default router;
