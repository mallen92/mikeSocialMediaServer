/*--------------- 3RD PARTY MODULES ----------------*/
const express = require("express");

/*----------------- CONFIG MODULES ------------------*/
const logger = require("../logs/logger");

/*--------------- MIDDLEWARE MODULES ----------------*/
const verifyAccessToken = require("../middleware/verifyAccessToken");

/*--------------- SERVICE MODULES ----------------*/
const connectService = require("../services/connectService");

/*----------------- HANDLER CONFIGURATIONS ------------------*/
const router = express.Router();

router.post("/send", verifyAccessToken, async (req, res) => {
  const reqInfo = {
    recipId: req.query.id,
    senderId: req.userKey,
  };
  const recipCacheKey = req.get("profile-cache-key");

  try {
    const response = await connectService.createFriendRequest(
      reqInfo,
      recipCacheKey
    );
    res.status(200).json({ status: response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.post("/cancel", verifyAccessToken, async (req, res) => {
  const userOut = req.userKey;
  const userIn = req.query.id;
  const recipCacheKey = req.get("profile-cache-key");

  try {
    const response = await connectService.deleteFriendRequest(
      userOut,
      userIn,
      recipCacheKey
    );
    res.status(200).json({ status: response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.post("/reject", verifyAccessToken, async (req, res) => {
  const userOut = req.query.id;
  const userIn = req.userKey;
  const recipCacheKey = req.get("profile-cache-key");

  try {
    const response = await connectService.deleteFriendRequest(
      userOut,
      userIn,
      recipCacheKey
    );
    res.status(200).json({ status: response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.post("/accept", verifyAccessToken, async (req, res) => {
  const reqInfo = {
    recipId: req.userKey,
    senderId: req.query.id,
  };
  const recipCacheKey = req.get("profile-cache-key");

  try {
    const response = await connectService.acceptFriendRequest(
      reqInfo,
      recipCacheKey
    );
    res.status(200).json({ status: response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.post("/removeFriend", verifyAccessToken, async (req, res) => {
  const userKey = req.userKey;
  const userToRemove = req.query.id;
  const recipCacheKey = req.get("profile-cache-key");

  try {
    const response = await connectService.removeFriend(
      userKey,
      userToRemove,
      recipCacheKey
    );
    res.status(200).json({ status: response });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

module.exports = router;
