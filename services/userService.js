/*--------------- 3RD PARTY MODULES ----------------*/
require("dotenv").config();

/*--------------- SERVICE MODULES ----------------*/
const imageService = require("../services/imageService");

/*--------------- DATA STORAGE MODULES ----------------*/
const userDao = require("../database/userDao");
const sessionCache = require("../cache/sessionCache");

async function createUser(user) {
  userDao.putUser(user);
}

async function getLogin(acctEmail) {
  const output = await userDao.getLogin(acctEmail);
  return output.Items[0];
}

async function getUser(id) {
  const output = await userDao.getUser(id);
  const user = output.Item;

  delete user.PK;
  delete user.SK;

  const sessionKey = await sessionCache.setSession(user);
  user.picUrl = await imageService.getUserPic(user.picFilename);
  return { user, sessionKey };
}

module.exports = { createUser, getLogin, getUser };
