import { Router } from "express";
import { createLogger, format, transports } from "winston";
import * as authenticationService from "../services/authenticationService.js";
import validateSignup from "../validation/validateSignup.js";

const router = Router();
const { combine, timestamp, prettyPrint } = format;
const logger = createLogger({
  format: combine(
    timestamp({ format: "MM/DD/YYYY hh:mm:ss A" }),
    prettyPrint()
  ),
  transports: [new transports.File({ filename: "error.log" })],
});

const validateLogin = (req, res, next) => {
  if (!req.body.email || req.body.email.trim() === "") {
    res.status(400).json({ message: "Please enter an email." });
  } else {
    if (!req.body.password || req.body.password.trim() === "") {
      res.status(400).json({ message: "Please enter a password." });
    } else {
      next();
    }
  }
};

router.post("/signup", validateSignup, async (req, res) => {
  try {
    const newUserObj = req.body;
    const response = await authenticationService.signUpUser(newUserObj);

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
    res.status(500).json({ message: "SERVER ERROR" });
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
    res.status(500).json({ message: "SERVER ERROR" });
    logger.error({ message: error });
  }
});

export default router;
