/*--------------- 3RD PARTY MODULES ----------------*/
const redis = require("redis");
const { UniqueNumber } = require("unique-string-generator");

/*----------------- CONFIG MODULES ------------------*/
const redisClient = require("../redisClient");

/*--------------- CACHE CONFIGURATIONS ----------------*/
const client = redisClient;

async function setSession(obj) {
  const key = UniqueNumber();

  await client.hSet(key, obj);
  await client.expire(key, 86400);
  return key;
}

async function getSession(key) {
  let user;
  const keyExists = await client.exists(key);

  if (keyExists) user = await client.hGetAll(key);
  return user;
}

async function clearSession(key) {
  const result = await client.del(key);
  return result;
}

module.exports = { setSession, getSession, clearSession };
