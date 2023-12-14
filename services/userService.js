/*--------------- 3RD PARTY MODULES ----------------*/
require("dotenv").config();

/*--------------- SERVICE MODULES ----------------*/
const imageService = require("../services/imageService");

/*--------------- DATABASE MODULES ----------------*/
const userDao = require("../database/userDao");
const connectDao = require("../database/connectDao");

/*--------------- CACHE MODULES ----------------*/
const sessionCache = require("../cache/sessionCache");
const userCache = require("../cache/userCache");

async function createUser(user) {
  userDao.putUser(user);
}

async function getLogin(acctEmail) {
  const output = await userDao.getLogin(acctEmail);
  return output.Items[0];
}

async function getUserAccount(id) {
  const output = await userDao.getUser(id);
  const user = output.Item;

  delete user.PK;
  delete user.SK;

  const sessionKey = await sessionCache.setSession(user);
  user.picUrl = await imageService.getUserPic(user.picFilename);
  return { user, sessionKey };
}

async function getUserProfile(
  requestedUserId,
  requestingUserId = null,
  cachedProfileKey = null
) {
  let user;
  if (cachedProfileKey) user = await userCache.getUser(cachedProfileKey);

  if (!cachedProfileKey || !user) {
    const output = await userDao.getUser(requestedUserId);
    user = output.Item;
    if (!user) return;

    delete user.SK;
    delete user.PK;

    if (requestingUserId) {
      user.friend_status = await getFriendStatus(
        requestedUserId,
        requestingUserId
      );
    }

    user.cacheKey = await userCache.setUser(user);
  }

  user.picUrl = await imageService.getUserPic(user.picFilename);
  return user;
}

/*---------------------- HELPER FUNCTIONS ----------------------*/

async function getFriendStatus(requestedId, requestingId) {
  const output = await connectDao.getStatus(requestedId, requestingId);

  if (output.Responses.TheSocial.length === 0) return "not a friend";
  else {
    const result = output.Responses.TheSocial[0].PK.split("#")[2];

    switch (result) {
      case "friends":
        return "friend";
      case "requests_in":
        return "received request from";
      case "requests_out":
        return "sent request to";
    }
  }
}

/*---------------------- END HELPER FUNCTIONS ----------------------*/

module.exports = { createUser, getLogin, getUserAccount, getUserProfile };
