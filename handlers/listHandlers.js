/*--------------- 3RD PARTY MODULES ----------------*/
const express = require("express");

/*----------------- CONFIG MODULES ------------------*/
const logger = require("../logs/logger");

/*--------------- SERVICE MODULES ----------------*/
const userService = require("../services/userService");

/*----------------- HANDLER CONFIGURATIONS ------------------*/
const router = express.Router();

router.get("/friends", async (req, res) => {
  const requestedUserId = req.query.id;
  const keyword = req.query.keyword;
  const panel = req.query.panel;
  let data;

  try {
    if (!keyword) {
      if (!panel) data = await userService.getUserFriends(requestedUserId);
      else data = await userService.getUserFriends(requestedUserId, panel);
    } else data = await userService.getUserFriends(requestedUserId, keyword);
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "invalidKeyword")
      res
        .status(400)
        .json({ message: "Keyword must contain at least 3 characters." });
    else {
      res
        .status(500)
        .json({ message: "Server error. Please contact user support." });
      logger.error({ message: error });
    }
  }
});

module.exports = router;
