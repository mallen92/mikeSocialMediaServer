import { Router } from "express";
import * as userService from "../services/userService.js";
import { logger } from "../logging/logger.js";

const router = Router();

router.get("/", async (req, res) => {
  const userId = req.query.id;

  try {
    const response = await userService.getUser(userId);
    if (response.message === "User retrieved")
      res.status(200).json(response.data);
    else
      res.status(400).json({ message: "The requested user does not exist." });
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
    logger.error({ message: error });
  }
});

export default router;
