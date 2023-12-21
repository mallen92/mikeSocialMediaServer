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
  const signupFormData = req.body;

  try {
    const response = await authService.signUpUser(signupFormData);
    res.cookie("jwt", response.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json(response.data);
  } catch (error) {
    if (error.message === "userAlreadyExists")
      res
        .status(400)
        .json({ message: "A user with that email already exists." });
    else {
      res
        .status(500)
        .json({ message: "Server error. Please contact user support." });
      logger.error({ message: error });
    }
  }
});

router.post("/login", validateLogin, async (req, res) => {
  const loginCreds = req.body;

  try {
    const response = await authService.logInUser(loginCreds);
    res.cookie("jwt", response.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json(response.data);
  } catch (error) {
    switch (error.message) {
      case "userDoesntExist":
        res
          .status(400)
          .json({ message: "A user with that email address does not exist." });
        break;
      case "incorrectCredentials":
        res.status(400).json({ message: "Incorrect email or password." });
        break;
      default:
        res
          .status(500)
          .json({ message: "Server error. Please contact user support." });
        logger.error({ message: error });
    }
  }
});

router.get("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
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
      default: {
        res
          .status(500)
          .json({ message: "Server error. Please contact user support." });
        logger.error({ message: error });
      }
    }
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "There was an error logging out the user." });
  }

  try {
    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    await authService.clearSessionFromCache(verified.sessionKey);

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.status(200).json({ message: "Cookie cleared" });
  } catch (error) {
    switch (error.message) {
      case "jwt expired": {
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(200).json({ message: "Cookie cleared" });
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
