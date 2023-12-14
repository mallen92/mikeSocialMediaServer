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

module.exports = { setUser, getUser };
