import { Router } from "express";
import { logger } from "../logs/logger.js";
import * as userService from "../services/userService.js";

const router = Router();

router.get("/session", async (req, res) => {
  const cachedUserKey = req.query.key;

  try {
    const response = await userService.getUserSession(cachedUserKey);

    if (response.message === "Session found")
      res.status(200).json(response.data);
    else res.status(404).json({ message: "No session found" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

export default router;
