import { Router } from "express";
import * as userService from "../services/userService.js";
import { logger } from "../logging/logger.js";
import verifyToken from "../middleware/verifyToken.js";

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
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.put("/request", verifyToken, async (req, res) => {
  const userId = req.user;
  const reqUserId = req.query.id;

  try {
    const response = await userService.addFriendRequest(userId, reqUserId);
    if (response.message === "Request added")
      res.status(200).json({ message: "Friend request sent!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.delete("/request/:action", verifyToken, async (req, res) => {
  const userId = req.user;
  const reqUserId = req.query.id;
  const action = req.params.action;

  try {
    if (action === "revoke") {
      const response = await userService.deleteFriendRequest(userId, reqUserId);
      if (response.message === "Request deleted") {
        res.status(200).json({
          message: "Friend request cancelled",
          index: response.index,
        });
      }
    } else if (action === "reject") {
      const response = await userService.deleteFriendRequest(reqUserId, userId);
      if (response.message === "Request deleted") {
        res.status(200).json({
          message: "Friend request rejected",
          index: response.index,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

export default router;
