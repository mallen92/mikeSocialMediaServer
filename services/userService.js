import jwt from "jsonwebtoken";
import "dotenv/config";
import * as appDao from "../database/appDao.js";
import * as appCache from "../database/appCache.js";
import * as imageService from "../services/imageService.js";

export async function createAccount(user) {
  appDao.putUser(user);
}

export async function getAccountLogin(acctEmail) {
  const output = await appDao.getAccountLogin(acctEmail);
  return output.Items[0];
}

export async function getAccountUser(id) {
  const output = await appDao.getUser(id);
  const user = output.Item;

  delete user.PK;
  delete user.SK;

  user.token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
  user.cacheKey = await appCache.setUserSession(user);
  user.picUrl = await imageService.getUserPic(user.picFilename);

  return user;
}

export async function getUserSession(key) {
  const user = await appCache.getUserSession(key);
  if (user) return { message: "Session found", data: user };
  else return { message: "Session not found" };
}
