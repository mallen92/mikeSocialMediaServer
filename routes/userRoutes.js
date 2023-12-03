import { Router } from "express";
import * as userService from "../services/userService.js";
import { logger } from "../logging/logger.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", async (req, res) => {
  const requestedUserId = req.query.id;
  const requestingUserId = req.get("requesting-user-id");

  try {
    const response = await userService.getRequestedUser(
      requestedUserId,
      requestingUserId
    );
    if (response.message === "User retrieved")
      res.status(200).json(response.user);
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
  const recipUserId = req.query.id;
  const senderUserId = req.user;

  try {
    const response = await userService.createFriendRequest(
      recipUserId,
      senderUserId
    );
    if (response.message === "Request created")
      res.status(200).json(response.status);
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
    if (action === "cancel") {
      const response = await userService.deleteFriendRequest(userId, reqUserId);
      if (response.message === "Request deleted")
        res.status(200).json(response.status);
    } else if (action === "reject") {
      const response = await userService.deleteFriendRequest(reqUserId, userId);
      if (response.message === "Request deleted")
        res.status(200).json(response.status);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.put("/friend", verifyToken, async (req, res) => {
  const recipUserId = req.user;
  const senderUserId = req.query.id;

  try {
    const response = await userService.acceptFriendRequest(
      recipUserId,
      senderUserId
    );
    if (response.message === "Request accepted")
      res.status(200).json(response.status);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.delete("/friend", verifyToken, async (req, res) => {
  const userId = req.user;
  const userToRemove = req.query.id;

  try {
    const response = await userService.removeFriend(userId, userToRemove);
    if (response.message === "Friend removed")
      res.status(200).json(response.status);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.get("/friends", async (req, res) => {
  const reqUserId = req.query.id;
  const page = req.query.page;

  try {
    const response = await userService.getFriends(reqUserId, page);
    if (response.message === "Friends retrieved")
      res.status(200).json({
        friends: response.data,
        lastKey: response.lastKey,
      });
    else if (response.message === "No friends")
      res.status(404).json({ data: response.data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

export default router;
