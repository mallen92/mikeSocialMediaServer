/*--------------- 3RD PARTY MODULES ----------------*/
const express = require("express");

/*----------------- CONFIG MODULES ------------------*/
const logger = require("../logs/logger");

/*--------------- SERVICE MODULES ----------------*/
const userService = require("../services/userService");

/*----------------- HANDLER CONFIGURATIONS ------------------*/
const router = express.Router();

router.get("/", async (req, res) => {
  const requestedUserId = req.query.id;
  const cachedProfileKey = req.query.key;
  const requestingUserId = req.get("requesting-user-id");

  try {
    const data = await userService.getUserProfile(
      requestedUserId,
      requestingUserId,
      cachedProfileKey
    );

    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

module.exports = router;
