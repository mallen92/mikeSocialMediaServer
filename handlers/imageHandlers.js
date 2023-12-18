/*--------------- 3RD PARTY MODULES ----------------*/
const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");

/*----------------- CONFIG MODULES ------------------*/
const logger = require("../logs/logger");

/*----------------- MIDDLEWARE MODULES ------------------*/
const verifyAccessToken = require("../middleware/verifyAccessToken");

/*--------------- SERVICE MODULES ----------------*/
const imageService = require("../services/imageService");

/*----------------- HANDLER CONFIGURATIONS ------------------*/
const router = express.Router();
const upload = multer();

router.post(
  "/",
  verifyAccessToken,
  upload.single("image"),
  async (req, res) => {
    const multerFile = req.file;
    const userId = req.user;
    const profileCacheKey = req.get("profile-cache-key");

    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) {
      logger.error({ message: "No refresh token was sent" });
      return res.status(401).json({ message: "401 Unauthorized" });
    }

    try {
      const verified = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const sessionCacheKey = verified.sessionKey;

      const response = await imageService.updateUserPic(
        multerFile,
        userId,
        sessionCacheKey,
        profileCacheKey
      );

      if (response.message === "uploadSuccess") {
        res.status(200).json({
          picUrl: response.newPicUrl,
          picFilename: response.newPicFilename,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error. Please contact user support." });
      logger.error({ message: error });
    }
  }
);

router.delete("/", verifyAccessToken, async (req, res) => {
  const userId = req.user;
  const profileCacheKey = req.get("profile-cache-key");

  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) {
    logger.error({ message: "No refresh token was sent" });
    return res.status(401).json({ message: "401 Unauthorized" });
  }

  try {
    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const sessionCacheKey = verified.sessionKey;

    const response = await imageService.deleteUserPic(
      userId,
      sessionCacheKey,
      profileCacheKey
    );

    if (response.message === "deleteSuccess")
      res.status(200).json({
        picUrl: response.newPicUrl,
        picFilename: response.newPicFilename,
      });
    if (response.message === "deleteError")
      res.status(400).json({ message: "Cannot delete default profile pic" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

module.exports = router;
