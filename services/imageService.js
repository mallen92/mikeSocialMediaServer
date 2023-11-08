import fs from "fs";
import crypto from "crypto";
import * as userDao from "../repository/userDao.js";
import * as imageBao from "../repository/imageBao.js";

export async function updateProfilePic(user, multerFile) {
  const hash = crypto.randomBytes(10).toString("hex");
  const filename = `${hash}.png`;
  const fileURL = `./uploads/${filename}`;
  const buffer = multerFile.buffer;
  fs.writeFileSync(fileURL, buffer);

  await userDao.updateUserProfilePicFilename(user, filename);
  await imageBao.uploadImage(fileURL, filename);

  // Delete image out of file system
  fs.unlinkSync(fileURL);

  // Retrieve image from S3
  const data = await getUserProfilePic(filename);

  return { message: "uploadSuccess", data };
}

export async function getUserProfilePic(filename) {
  const imgObj = await imageBao.getUserProfilePic(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");

  return `data:image/png;base64,${byte64}`;
}
