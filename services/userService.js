import jwt from "jsonwebtoken";
import "dotenv/config";
import * as userDao from "../repository/userDao.js";
import * as imageService from "../services/imageService.js";

export async function getExistingUser(email) {
  const output = await userDao.getUserByEmail(email);
  return output.Items[0];
}

export async function signUpUser(user) {
  userDao.putUser(user);
}

export async function logInUser(user) {
  user.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  user.pic_url = await imageService.getUserPic(user.pic_filename);

  delete user.password;
  delete user.PK;
  delete user.SK;
  delete user.birth_date;
  delete user.signup_date;
  delete user.email;

  return user;
}

export async function getRequestedUser(requestedUserId, requestingUserId) {
  let friendStatus = "";

  if (requestingUserId) {
    const output = await userDao.getFriendOrRequest(
      requestedUserId,
      requestingUserId
    );

    if (output.Responses.TheSocial.length === 0) friendStatus = "not a friend";
    else {
      const result = output.Responses.TheSocial[0].PK.split("#")[2];

      switch (result) {
        case "friends":
          friendStatus = "friend";
          break;
        case "requests_in":
          friendStatus = "received request from";
          break;
        case "requests_out":
          friendStatus = "sent request to";
          break;
      }
    }
  }

  const output = await userDao.getUserById(requestedUserId);
  const user = output.Item;

  if (friendStatus) user.friend_status = friendStatus;
  user.pic_url = await imageService.getUserPic(user.pic_filename);

  delete user.password;
  delete user.PK;
  delete user.SK;

  return { message: "User retrieved", user };
}

export async function createFriendRequest(recipUserId, senderUserId) {
  await userDao.createFriendRequest(recipUserId, senderUserId);
  return { message: "Request created", status: "sent request to" };
}

export async function deleteFriendRequest(userOut, userIn) {
  await userDao.deleteFriendRequest(userOut, userIn);
  return { message: "Request deleted", status: "not a friend" };
}

export async function acceptFriendRequest(recipUserId, senderUserId) {
  await userDao.acceptFriendRequest(recipUserId, senderUserId);
  return { message: "Request accepted", status: "friend" };
}

export async function removeFriend(userId, userToRemove) {
  await userDao.removeFriend(userId, userToRemove);
  return { message: "Friend removed", status: "not a friend" };
}

export async function getFriends(reqUserId, page) {
  let users = [];
  let lastKey;
  let pageTracker = 0;

  do {
    const friendsOutput = await userDao.getFriends(reqUserId, lastKey);

    if (pageTracker === page - 1) {
      for (let i = 0; i < friendsOutput.Items.length; i++) {
        const user = friendsOutput.Items[i].SK.split("#")[1];
        users.push(user);
      }
    }

    lastKey = friendsOutput.LastEvaluatedKey;
    pageTracker++;
  } while (pageTracker < page);

  /* Send back message if user has no friends */
  if (users.length === 0) return { message: "No friends", data: [] };

  /* Gets the friends' info */
  for (let i = 0; i < users.length; i++) {
    users[i] = { PK: `u#${users[i]}`, SK: `u#${users[i]}` };
  }

  const infoOutput = await userDao.getFriendsBasicInfo(users);
  let data = infoOutput.Responses.TheSocial;

  /* Convert each pic filename to a data URL */
  for (let i = 0; i < data.length; i++) {
    data[i].pic_url = await imageService.getUserPic(data[i].pic_filename);
    data[i].resultId = i + 1;
    delete data[i].pic_filename;
  }

  return { message: "Friends retrieved", data, lastKey };
}
