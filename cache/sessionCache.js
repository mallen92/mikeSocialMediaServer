import { UniqueNumber } from "unique-string-generator";
import { client } from "../redis.js";

export async function setSession(obj) {
  const key = UniqueNumber();

  await client.hSet(key, obj);
  await client.expire(key, 43200);
  return key;
}

export async function getSession(key) {
  let account;
  const keyExists = await client.exists(key);

  if (keyExists) account = await client.hGetAll(key);
  return account;
}
