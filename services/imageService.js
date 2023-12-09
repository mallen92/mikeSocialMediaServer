import "dotenv/config";
import fs from "fs";
import { UniqueString } from "unique-string-generator";
import * as imageBao from "../database/imageBao.js";
import * as appDao from "../database/userDao.js";

const defaultPicFilename = process.env.DEFAULT_PROF_PIC;

export async function getUserPic(filename) {
  const imgObj = await imageBao.getImage(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");
  return `data:image/png;base64,${byte64}`;
}
