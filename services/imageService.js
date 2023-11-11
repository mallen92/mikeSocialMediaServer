import fs from "fs";
import crypto from "crypto";
import * as userDao from "../repository/userDao.js";
import * as imageBao from "../repository/imageBao.js";

export async function updateUserProfilePic(user, multerFile) {
  const hash = crypto.randomBytes(10).toString("hex");
  const filename = `${hash}.jpg`;
  const fileURL = `./tmp/${filename}`;
  const buffer = multerFile.buffer;
  fs.writeFileSync(fileURL, buffer);

  await userDao.updateUserProfilePicFilename(user, filename);
  await imageBao.uploadImage(fileURL, filename);

  fs.unlinkSync(fileURL);

  const data = await getUserProfilePic(filename);
  return { message: "uploadSuccess", data };
}

export async function getUserProfilePic(filename) {
  const imgObj = await imageBao.getImage(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");

  return `data:image/png;base64,${byte64}`;
}

export async function deleteUserProfilePic(user) {
  const defaultPicFilename = process.env.DEFAULT_PROF_PIC;
  const response = await userDao.updateUserProfilePicFilename(
    user,
    defaultPicFilename
  );
  await imageBao.deleteImage(response.Attributes.user_profile_pic);
  const data = await getUserProfilePic(defaultPicFilename);

  return { message: "deleteSuccess", data };
}
