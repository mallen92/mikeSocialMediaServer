import { Router } from "express";
import { logger } from "../logs/logger.js";
import validateSignup from "../middleware/validateSignup.js";
import validateLogin from "../middleware/validateLogin.js";
import * as authenticationService from "../services/authenticationService.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/signup", validateSignup, async (req, res) => {
  try {
    const signupFormData = req.body;
    const response = await authenticationService.signUpUser(signupFormData);

    switch (response.message) {
      case "userRegistered":
        res.cookie("jwt", response.refreshToken, {
          httpOnly: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
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
    const response = await authenticationService.logInUser(loginCreds);

    switch (response.message) {
      case "userAuthenticated":
        res.cookie("jwt", response.refreshToken, {
          httpOnly: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
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

    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const foundUser = await authenticationService.getSessionFromCache(
      verified.sessionKey
    );
    if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

    const foundUserId = foundUser.id;
    const accessToken = jwt.sign(
      { foundUserId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );
    foundUser.accessToken = accessToken;
    res.status(200).json(foundUser);
  } catch (error) {
    switch (error.message) {
      case "jwt expired":
        res
          .status(403)
          .json({ message: "Your session has expired. Please log in." });
        break;
      default:
        res.status(403).json({ message: "Access denied" });
        logger.error({ message: error });
        break;
    }
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.status(204);

    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    await authenticationService.clearSessionFromCache(verified.sessionKey);

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None" });
    res.json({ message: "Cookie cleared" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

export default router;
