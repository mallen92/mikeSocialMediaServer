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

export async function getUser(id) {
  const output = await userDao.getUser(id);
  const user = output.Item;

  delete user.PK;
  delete user.SK;

  const sessionKey = await sessionCache.setSession(user);
  user.picUrl = await imageService.getUserPic(user.picFilename);
  return { user, sessionKey };
}
