import { Router } from "express";
import multer from "multer";
import verifyToken from "../middleware/verifyToken.js";
import { logger } from "../logging/logger.js";
import * as imageService from "../services/imageService.js";

const router = Router();
const upload = multer();

router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const multerFile = req.file;
    const user = req.user;
    const response = await imageService.updateProfilePic(user, multerFile);

    if (response.message === "uploadSuccess") {
      res.status(200).send(response.data);
    }
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
    logger.error({ message: error });
  }
});

export default router;
