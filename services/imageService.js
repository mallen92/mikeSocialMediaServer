import fs from "fs";
import crypto from "crypto";
import "dotenv/config";
import * as userDao from "../repository/userDao.js";
import * as imageBao from "../repository/imageBao.js";

const defaultPicFilename = process.env.DEFAULT_PROF_PIC;

export async function updateUserPic(userId, multerFile) {
  const hash = crypto.randomBytes(10).toString("hex");
  const newPicFilename = `${hash}.jpg`;
  const fileURL = `./tmp/${filename}`;
  const buffer = multerFile.buffer;
  fs.writeFileSync(fileURL, buffer);
  await imageBao.uploadImage(fileURL, newPicFilename);
  fs.unlinkSync(fileURL);

  const output = await userDao.updateUserPic(userId, newPicFilename);
  const oldPicFilename = output.Attributes.pic_filename;
  if (oldPicFilename !== defaultPicFilename)
    await imageBao.deleteImage(oldPicFilename);

  const newPicUrl = await getUserPic(newPicFilename);
  return { message: "uploadSuccess", newPicUrl, newPicFilename };
}

export async function deleteUserPic(userId) {
  const output = await userDao.updatePicFilename(userId, defaultPicFilename);

  if (output.Attributes.pic_filename === defaultPicFilename)
    return { message: "deleteError" };

  await imageBao.deleteImage(output.Attributes.pic_filename);
  const newPicUrl = await getUserPic(defaultPicFilename);

  return {
    message: "deleteSuccess",
    newPicUrl,
    newPicFilename: defaultPicFilename,
  };
}

/* HELPER FUNCTIONS */

export async function getUserPic(filename) {
  const imgObj = await imageBao.getImage(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");
  return `data:image/png;base64,${byte64}`;
}

/* END HELPER FUNCTIONS */
