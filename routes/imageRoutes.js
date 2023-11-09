import { Router } from "express";
import multer from "multer";
import verifyToken from "../middleware/verifyToken.js";
import * as imageService from "../services/imageService.js";
import { logger } from "../logging/logger.js";

const router = Router();
const upload = multer();

router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const multerFile = req.file;
    const user = req.user;
    const response = await imageService.updateUserProfilePic(user, multerFile);

    if (response.message === "uploadSuccess") {
      res.status(200).json(response.data);
    }
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
    logger.error({ message: error });
  }
});

router.delete("/", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const response = await imageService.deleteUserProfilePic(user);

    if (response.message === "deleteSuccess") {
      res.status(200).json(response.data);
    }
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
    logger.error({ message: error });
  }
});

export default router;
