import fs from "fs";
import { UniqueString } from "unique-string-generator";
import "dotenv/config";
import * as appDao from "../database/appDao.js";
import * as imageBao from "../database/imageBao.js";

const defaultPicFilename = process.env.DEFAULT_PROF_PIC;

export async function getUserPic(filename) {
  const imgObj = await imageBao.getImage(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");
  return `data:image/png;base64,${byte64}`;
}
