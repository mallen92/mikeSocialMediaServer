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
  const reqInfo = {
    recipId: req.query.id,
    recipName: req.body.recipName,
    recipPicFile: req.body.recipPicFile,
    senderId: req.user,
    senderName: req.body.senderName,
    senderPicFile: req.body.senderPicFile,
  };

  try {
    const response = await userService.createFriendRequest(reqInfo);
    if (response.message === "Request created")
      res.status(200).json({ status: response.status });
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
        res.status(200).json({ status: response.status });
    } else if (action === "reject") {
      const response = await userService.deleteFriendRequest(reqUserId, userId);
      if (response.message === "Request deleted")
        res.status(200).json({ status: response.status });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.put("/friend", verifyToken, async (req, res) => {
  const reqInfo = {
    recipId: req.user,
    recipName: req.body.recipName,
    recipPicFile: req.body.recipPicFile,
    senderId: req.query.id,
    senderName: req.body.senderName,
    senderPicFile: req.body.senderPicFile,
  };

  try {
    const response = await userService.acceptFriendRequest(reqInfo);
    if (response.message === "Request accepted")
      res.status(200).json({ status: response.status });
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
      res.status(200).json({ status: response.status });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

router.get("/friends/:action", async (req, res) => {
  const reqUserId = req.query.id;
  const page = req.query.page;
  const keyword = req.query.keyword;
  const action = req.params.action;
  let response;

  try {
    if (action === "list") {
      response = await userService.getFriends(reqUserId, page);
    } else if (action === "search") {
      response = await userService.searchFriends(reqUserId, keyword);
    }

    res.status(200).json({
      friends: response.friends,
      lastKey: response.lastKey,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error. Please contact user support." });
    logger.error({ message: error });
  }
});

export default router;
