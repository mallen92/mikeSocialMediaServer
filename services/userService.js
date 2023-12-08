import jwt from "jsonwebtoken";
import "dotenv/config";
import * as userDao from "../database/userDao.js";
import * as sessionCache from "../cache/sessionCache.js";
import * as imageService from "../services/imageService.js";

export async function createUser(user) {
  userDao.putUser(user);
}

export async function getLogin(acctEmail) {
  const output = await userDao.getLogin(acctEmail);
  return output.Items[0];
}

export async function getAuthUser(id) {
  const output = await userDao.getUser(id);
  const user = output.Item;

  delete user.PK;
  delete user.SK;

  user.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
  user.cacheKey = await sessionCache.setSession(user);
  user.picUrl = await imageService.getUserPic(user.picFilename);

  return user;
}

export async function getSession(key) {
  const user = await sessionCache.getSession(key);
  if (user) return { message: "Session found", data: user };
  else return { message: "Session not found" };
}
