import { Router, raw, json } from "express";
import * as uploadController from "../controllers/uploadController";

const router = Router();

// All admin-only. The raw parser accepts any content type so the file body
// arrives as a Buffer; type/size validation happens in the controller.
router.post(
  "/",
  raw({ type: () => true, limit: "100mb" }),
  uploadController.uploadFile,
);
router.get("/", uploadController.listMedia);
router.put("/:id", json(), uploadController.updateMedia);
router.delete("/:id", uploadController.deleteMedia);

export default router;
