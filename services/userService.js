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

export async function logInUser(email) {
  const user = await getExistingUser(email);

  user.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  user.pic_url = await imageService.getUserPic(user.pic_filename);

  delete user.password;
  delete user.birth_date;
  delete user.signup_date;
  delete user.email;

  return user;
}

export async function getRequestedUser(id) {
  const output = await userDao.getUserById(id);
  const user = output.Item;

  user.pic_url = await imageService.getUserPic(user.pic_filename);

  delete user.password;
  delete user.friends;
  delete user.friend_requests_in;
  delete user.friend_requests_out;

  return { message: "User retrieved", user };
}
