import { UniqueNumber } from "unique-string-generator";
import { client } from "../redis.js";

export async function setUserSession(obj) {
  const key = UniqueNumber();

  await client.hSet(key, obj);
  await client.expire(key, 43200);
  return key;
}

export async function getUserSession(key) {
  let account;
  const keyExists = await client.exists(key);

  if (keyExists) account = await client.hGetAll(key);
  return account;
}
