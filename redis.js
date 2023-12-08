import { createClient } from "redis";

export const client = createClient();

export async function redisConnect() {
  return client.connect();
}
