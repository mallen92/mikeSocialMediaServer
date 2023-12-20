/*--------------- 3RD PARTY MODULES ----------------*/
const express = require("express");
const jwt = require("jsonwebtoken");

/*----------------- CONFIG MODULES ------------------*/
const logger = require("../logs/logger");

/*----------------- MIDDLEWARE MODULES ------------------*/
const validateSignup = require("../middleware/validateSignup");
const validateLogin = require("../middleware/validateLogin");

/*--------------- SERVICE MODULES ----------------*/
const authService = require("../services/authService");

/*----------------- HANDLER CONFIGURATIONS ------------------*/
const router = express.Router();

router.post("/signup", validateSignup, async (req, res) => {
  try {
    const signupFormData = req.body;
    const response = await authService.signUpUser(signupFormData);

    switch (response.message) {
      case "userRegistered":
        res.cookie("jwt", response.refreshToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });

        res.status(200).json(response.data);
        break;
      case "userAlreadyExists":
        res
          .status(400)
          .json({ error: "A user with that email already exists." });
        break;
      default:
        const error = "The server encountered a problem.";
        res.status(500).json({ message: error });
        logger.error({ message: error });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  try {
    const loginCreds = req.body;
    const response = await authService.logInUser(loginCreds);

    switch (response.message) {
      case "userAuthenticated":
        res.cookie("jwt", response.refreshToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });

        res.status(200).json(response.data);
        break;
      case "incorrectCredentials":
        res.status(400).json({ message: "Incorrect email or password." });
        break;
      case "userDoesntExist":
        res.status(400).json({
          message: "A user with that email address does not exist.",
        });
        break;
      default:
        const error = "The server encountered a problem.";
        res.status(500).json({ message: error });
        logger.error({ message: error });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.get("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) {
      logger.error({ message: "No refresh token was sent" });
      return res.status(401).json({ message: "401 Unauthorized" });
    }

    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const foundUser = await authService.getSessionFromCache(
      verified.sessionKey
    );

    const accessToken = jwt.sign(
      { id: foundUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    foundUser.accessToken = accessToken;
    res.status(200).json(foundUser);
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
      default:
        res.status(401).json({ message: "An unrecognized token was sent" });
        logger.error({ message: error });
        break;
    }
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) {
      logger.error({ message: "No refresh token was sent to be cleared." });
      return res
        .status(400)
        .json({ message: "There was an error logging out the user." });
    }

    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    await authService.clearSessionFromCache(verified.sessionKey);

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.json({ message: "Cookie cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

module.exports = router;
