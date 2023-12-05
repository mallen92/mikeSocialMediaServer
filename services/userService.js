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

export async function createFriendRequest(reqInfo) {
  await userDao.createFriendRequest(reqInfo);
  return { message: "Request created", status: "sent request to" };
}

export async function deleteFriendRequest(userOut, userIn) {
  await userDao.deleteFriendRequest(userOut, userIn);
  return { message: "Request deleted", status: "not a friend" };
}

export async function acceptFriendRequest(reqInfo) {
  await userDao.acceptFriendRequest(reqInfo);
  return { message: "Request accepted", status: "friend" };
}

export async function removeFriend(userId, userToRemove) {
  await userDao.removeFriend(userId, userToRemove);
  return { message: "Friend removed", status: "not a friend" };
}

export async function getFriends(reqUserId, limit = null) {
  let lastKey;
  const output = await userDao.getFriends(reqUserId, limit);
  lastKey = output.LastEvaluatedKey;
  const friends = await packageFriendsInfo(output.Items);
  return { message: "Friends retrieved", friends, lastKey };
}

export async function searchFriends(reqUserId, keyword) {
  const output = await userDao.getFriendsByKeyword(reqUserId, keyword);
  const friends = await packageFriendsInfo(output.Items);
  return { message: "Results retrieved", friends };
}

/*---------------------- HELPER FUNCTION ----------------------*/

async function packageFriendsInfo(friends) {
  for (let i = 0; i < friends.length; i++) {
    const friend = friends[i];

    friend.id = friend.SK.split("#")[1];
    friend.resultId = i + 1;
    friend.pic_url = await imageService.getUserPic(friend.pic_filename);
    delete friend.PK;
    delete friend.SK;
    delete friend.pic_filename;
    delete friend.name_search;
  }

  return friends;
}

/*---------------------- END HELPER FUNCTION ----------------------*/
