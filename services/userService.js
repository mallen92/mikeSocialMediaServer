/*--------------- 3RD PARTY MODULES ----------------*/
require("dotenv").config();

/*--------------- SERVICE MODULES ----------------*/
const imageService = require("../services/imageService");

/*--------------- DATABASE MODULES ----------------*/
const userDao = require("../database/userDao");
const connectDao = require("../database/connectDao");
const friendDao = require("../database/friendDao");

/*--------------- CACHE MODULES ----------------*/
const sessionCache = require("../cache/sessionCache");
const userCache = require("../cache/userCache");

async function createUser(key, user) {
  userDao.putUser(key, user);
}

async function getLogin(acctEmail) {
  const output = await userDao.getLogin(acctEmail);
  return output.Items[0];
}

async function getUserAccount(userKey) {
  const output = await userDao.getUserByKey(userKey);
  let user = output.Item;
  user.userKey = userKey;
  const sessionKey = await sessionCache.setSession(user);

  delete user.userKey;
  user.picUrl = await imageService.getUserPic(user.picFilename);
  return { user, sessionKey };
}

async function getUserProfile(
  requestedUser,
  requestingUser = null,
  cachedProfileKey = null
) {
  let user;
  if (cachedProfileKey) user = await userCache.getUser(cachedProfileKey);

  if (!cachedProfileKey || !user) {
    const output = await userDao.getUserByUsername(requestedUser);
    user = output.Items[0];
    if (!user) return;

    if (requestingUser) {
      user.friendStatus = await getFriendStatus(requestedUser, requestingUser);
    }

    user.cacheKey = await userCache.setUser(user);
  }

  user.picUrl = await imageService.getUserPic(user.picFilename);
  return user;
}

async function getUserFriends(username, keyword = null, panel = false) {
  if (keyword?.length < 3) throw new Error("invalidKeyword");

  const getKeyResponse = await userDao.getUserKey(username);
  const userKey = getKeyResponse.Items[0].PK.split("#")[1];
  let output1;

  if (panel) output1 = await friendDao.getFriends(userKey, 6);
  else output1 = await friendDao.getFriends(userKey, 25);
  const friendsList = output1.Items;
  const lastEvaluatedKey = output1.LastEvaluatedKey;
  if (friendsList.length === 0) return { friends: friendsList };

  let infoKeys = [];
  for (let i = 0; i < friendsList.length; i++) {
    const batchGetPK = friendsList[i].SK;
    const key = {
      PK: batchGetPK,
      SK: batchGetPK,
    };
    infoKeys.push(key);
  }
  const output2 = await friendDao.getFriendsInfo(infoKeys);
  let friends = output2.Responses.TheSocial;

  if (keyword) {
    let filteredList = [];
    for (let i = 0; i < friends.length; i++) {
      const { userSearchName, username } = friends[i];

      if (
        userSearchName.includes(keyword.toLowerCase()) ||
        username.toLowerCase().includes(keyword.toLowerCase())
      )
        filteredList.push(friends[i]);
    }
    friends = filteredList;
  }

  friends = await packageUserList(friends);
  return {
    friends,
    moreFriendsKey: lastEvaluatedKey,
  };
}

async function searchUsers(
  usernameSearch = null,
  fNameSearch = null,
  lNameSearch = null
) {
  if (
    usernameSearch?.length < 2 ||
    fNameSearch?.length < 2 ||
    lNameSearch?.length < 2
  )
    throw new Error("invalidKeyword");

  let results = [];
  const output = await userDao.getUsers();
  const users = output.Items;

  for (let i = 0; i < users.length; i++) {
    const { username, firstName, lastName } = users[i];

    if (
      username.toLowerCase().includes(usernameSearch?.toLowerCase()) ||
      firstName.toLowerCase().includes(fNameSearch?.toLowerCase()) ||
      lastName.toLowerCase().includes(lNameSearch?.toLowerCase())
    ) {
      results.push(users[i]);
    }
  }

  results = await packageUserList(results);
  return { results };
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

async function packageUserList(list) {
  for (let i = 0; i < list.length; i++) {
    const info = list[i];
    info.resultId = i + 1;
    info.picUrl = await imageService.getUserPic(info.picFilename);
    delete info.picFilename;
  }
  return list;
}

/*---------------------- END HELPER FUNCTIONS ----------------------*/

module.exports = {
  createUser,
  getLogin,
  getUserAccount,
  getUserProfile,
  getUserFriends,
  searchUsers,
};
