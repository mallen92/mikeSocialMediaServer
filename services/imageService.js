/*--------------- 3RD PARTY MODULES ----------------*/
require("dotenv").config();
const { UniqueString } = require("unique-string-generator");

/*--------------- NODE MODULES ----------------*/
const fs = require("fs");

/*--------------- DATABASE MODULES ----------------*/
const { getImage, uploadImage, deleteImage } = require("../database/imageBao");
const { updatePicFilenameInDB } = require("../database/userDao");

/*--------------- CACHE MODULES ----------------*/
const { updatePicFilenameInCache } = require("../cache/userCache");

/*----------------- SERVICE CONFIGURATIONS ------------------*/
const defaultPicFilename = process.env.DEFAULT_PROF_PIC;

async function getUserPic(filename) {
  const imgObj = await getImage(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");
  return `data:image/png;base64,${byte64}`;
}

async function updateUserPic(
  multerFile,
  userId,
  sessionCacheKey,
  profileCacheKey
) {
  const hash = UniqueString();
  const newPicFilename = `${hash}.jpg`;
  const fileURL = `./tmp/${newPicFilename}`;
  const buffer = multerFile.buffer;
  fs.writeFileSync(fileURL, buffer);
  await uploadImage(fileURL, newPicFilename);
  fs.unlinkSync(fileURL);

  await updatePicFilenameInCache(
    sessionCacheKey,
    profileCacheKey,
    newPicFilename
  );
  const output = await updatePicFilenameInDB(userId, newPicFilename);
  const oldPicFilename = output.Attributes.picFilename;
  if (oldPicFilename !== defaultPicFilename) await deleteImage(oldPicFilename);

  const newPicUrl = await getUserPic(newPicFilename);
  return { message: "uploadSuccess", newPicUrl, newPicFilename };
}

async function deleteUserPic(userId, sessionCacheKey, profileCacheKey) {
  const output = await updatePicFilenameInDB(userId, defaultPicFilename);

  if (output.Attributes.picFilename === defaultPicFilename)
    return { message: "deleteError" };

  await updatePicFilenameInCache(
    sessionCacheKey,
    profileCacheKey,
    defaultPicFilename
  );

  await deleteImage(output.Attributes.picFilename);
  const newPicUrl = await getUserPic(defaultPicFilename);

  return {
    message: "deleteSuccess",
    newPicUrl,
    newPicFilename: defaultPicFilename,
  };
}

module.exports = { getUserPic, updateUserPic, deleteUserPic };
