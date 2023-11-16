import * as userDao from "../repository/userDao.js";
import * as imageService from "../services/imageService.js";
import * as requestDao from "../repository/friendRequestDao.js";

export async function getUser(userId) {
  const response = await userDao.getUserById(userId);
  const user = response.Item;

  delete user.user_password;
  user.user_profile_pic = await imageService.getUserProfilePic(
    user.user_profile_pic
  );

  return { message: "User retrieved", data: user };
}

export async function addFriendRequest(userId, userToAddId) {
  await requestDao.addFriendRequestOut(userId, userToAddId);
  await requestDao.addFriendRequestIn(userToAddId, userId);

  return {
    message: "Request added",
  };
}

export async function deleteFriendRequest(userId, userToRemoveId) {
  const response1 = await requestDao.getFriendRequestsOut(userId);
  const sentRequests = response1.Item.friend_requests_out;
  const userToRemoveIndex = sentRequests.indexOf(userToRemoveId);
  await requestDao.deleteFriendRequestOut(userId, userToRemoveIndex);

  const response2 = await requestDao.getFriendRequestsIn(userToRemoveId);
  const receivedRequests = response2.Item.friend_requests_in;
  const userIdIndex = receivedRequests.indexOf(userId);
  await requestDao.deleteFriendRequestIn(userToRemoveId, userIdIndex);

  return {
    message: "Request deleted",
  };
}
