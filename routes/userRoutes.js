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

router.get("/friends", async (req, res) => {
  const reqUserId = req.query.id;

  try {
    const response = await userService.getFriends(reqUserId);
    if (response.message === "Friends retrieved")
      res.status(200).json({
        reqUserName: response.reqUserName,
        reqUserFriends: response.reqUserFriends,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.post("/friends", verifyToken, async (req, res) => {
  const userId = req.user;
  const reqUserId = req.query.id;

  try {
    const response = await userService.addFriend(userId, reqUserId);
    if (response.message === "Friend added")
      res.status(200).json({ deletedRequestIndex: response.index });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.delete("/friends", verifyToken, async (req, res) => {
  const userId = req.user;
  const reqUserId = req.query.id;

  try {
    const response = await userService.removeFriend(userId, reqUserId);
    if (response.message === "Friend removed")
      res.status(200).json({ removedFriendIndex: response.index });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

export default router;
