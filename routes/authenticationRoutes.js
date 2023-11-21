import { Router } from "express";
import { logger } from "../logging/logger.js";
import * as authenticationService from "../services/authenticationService.js";
import validateSignup from "../middleware/validateSignup.js";
import validateLogin from "../middleware/validateLogin.js";

const router = Router();

router.post("/signup", validateSignup, async (req, res) => {
  try {
    const signupFormData = req.body;
    const response = await authenticationService.signUpUser(signupFormData);

    switch (response.message) {
      case "userRegistered":
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
        res.status(200).json(response.data);
        break;
      case "incorrectCredentials":
        res.status(400).json({ message: "Incorrect email or password." });
        break;
      case "userDoesntExist":
        res
          .status(400)
          .json({ message: "A user with that email address does not exist." });
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

export default router;
