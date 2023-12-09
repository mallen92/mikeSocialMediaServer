import { UniqueNumber } from "unique-string-generator";
import { client } from "../redis.js";

export async function setSession(obj) {
  const key = UniqueNumber();

  await client.hSet(key, obj);
  await client.expire(key, 86400);
  return key;
}

export async function getSession(key) {
  let user;
  const keyExists = await client.exists(key);

  if (keyExists) user = await client.hGetAll(key);
  return user;
}

export async function clearSession(key) {
  const result = await client.del(key);
  return result;
}
