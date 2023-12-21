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
      return res.status(401).json({ message: "Unauthorized" });
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

      res.status(200).json({
        picUrl: response.newPicUrl,
        picFilename: response.newPicFilename,
      });
    } catch (error) {
      switch (error.message) {
        case "jwt expired": {
          res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          });
          res.status(403).json({ message: "Please log in." });
          break;
        }
        default: {
          res
            .status(500)
            .json({ message: "Server error. Please contact user support." });
          logger.error({ message: error });
        }
      }
    }
  }
);

router.delete("/", verifyAccessToken, async (req, res) => {
  const userId = req.user;
  const profileCacheKey = req.get("profile-cache-key");
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const sessionCacheKey = verified.sessionKey;

    const response = await imageService.deleteUserPic(
      userId,
      sessionCacheKey,
      profileCacheKey
    );

    res.status(200).json({
      picUrl: response.newPicUrl,
      picFilename: response.newPicFilename,
    });
  } catch (error) {
    switch (error.message) {
      case "deleteError": {
        res.status(400).json({ message: "Cannot delete default profile pic" });
        break;
      }
      case "jwt expired": {
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(403).json({ message: "Please log in." });
        break;
      }
      default: {
        res
          .status(500)
          .json({ message: "Server error. Please contact user support." });
        logger.error({ message: error });
      }
    }
  }
});

module.exports = router;
