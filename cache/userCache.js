/*--------------- 3RD PARTY MODULES ----------------*/
const redis = require("redis");
const { UniqueNumber } = require("unique-string-generator");

/*----------------- CONFIG MODULES ------------------*/
const redisClient = require("../redisClient");

/*--------------- CACHE CONFIGURATIONS ----------------*/
const client = redisClient;

async function setUser(obj) {
  const key = UniqueNumber();

  await client.hSet(key, obj);
  await client.expire(key, 600);
  return key;
}

async function getUser(key) {
  let user;
  const keyExists = await client.exists(key);

  if (keyExists) user = await client.hGetAll(key);
  return user;
}

async function updatePicFilenameInCache(sessionKey, profileKey, filename) {
  const reply1 = await client.hSet(sessionKey, "picFilename", filename);
  const profileKeyExists = await client.exists(profileKey);
  let reply2 = 0;

  if (profileKeyExists)
    reply2 = await client.hSet(profileKey, "picFilename", filename);

  if (reply1 > 0 || reply2 > 0)
    throw new Error("User pic was not properly updated in cache.");
}

module.exports = { setUser, getUser, updatePicFilenameInCache };
