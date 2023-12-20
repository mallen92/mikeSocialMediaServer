const connectDao = require("../database/connectDao");
const userCache = require("../cache/userCache");

async function createFriendRequest(reqInfo, recipCacheKey) {
  await connectDao.createFriendRequest(reqInfo);
  const status = "sent request to";
  await userCache.updateFriendStatus(recipCacheKey, status);
  return status;
}

async function deleteFriendRequest(userOut, userIn, recipCacheKey) {
  await connectDao.deleteFriendRequest(userOut, userIn);
  const status = "not a friend";
  await userCache.updateFriendStatus(recipCacheKey, status);
  return status;
}

async function acceptFriendRequest(reqInfo, recipCacheKey) {
  await connectDao.acceptFriendRequest(reqInfo);
  const status = "friend";
  await userCache.updateFriendStatus(recipCacheKey, status);
  return status;
}

async function removeFriend(userId, userToRemove, recipCacheKey) {
  await connectDao.removeFriend(userId, userToRemove);
  const status = "not a friend";
  await userCache.updateFriendStatus(recipCacheKey, status);
  return status;
}

module.exports = {
  createFriendRequest,
  deleteFriendRequest,
  acceptFriendRequest,
  removeFriend,
};
