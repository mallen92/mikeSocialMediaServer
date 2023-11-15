import * as userDao from "../repository/userDao.js";
import * as imageService from "../services/imageService.js";

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
  await userDao.addFriendRequestOut(userId, userToAddId);
  await userDao.addFriendRequestIn(userToAddId, userId);

  return {
    message: "Request added",
  };
}
