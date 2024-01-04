/*--------------- 3RD PARTY MODULES ----------------*/
const express = require("express");

/*----------------- CONFIG MODULES ------------------*/
const logger = require("../logs/logger");

/*--------------- SERVICE MODULES ----------------*/
const userService = require("../services/userService");

/*----------------- HANDLER CONFIGURATIONS ------------------*/
const router = express.Router();

router.get("/", async (req, res) => {
  const cachedProfileKey = req.query.ck;
  const requestedUser = req.query.u;
  const requestingUser = req.get("requesting-user");

  try {
    const data = await userService.getUserProfile(
      requestedUser,
      requestingUser,
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

router.post("/search", async (req, res) => {
  const usernameSearch = req.body.username;
  const fNameSearch = req.body.fName;
  const lNameSearch = req.body.lName;

  try {
    const data = await userService.searchUsers(
      usernameSearch,
      fNameSearch,
      lNameSearch
    );
    res.status(200).json(data);
  } catch (error) {
    if (error.message === "invalidKeyword")
      res.status(400).json({
        message: "Search keywords must contain at least 2 characters.",
      });
    else {
      res
        .status(500)
        .json({ message: "Server error. Please contact user support." });
      logger.error({ message: error });
    }
  }
});

module.exports = router;
