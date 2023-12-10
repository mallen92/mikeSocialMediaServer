require("dotenv").config();
const { getImage } = require("../database/imageBao");

const defaultPicFilename = process.env.DEFAULT_PROF_PIC;

async function getUserPic(filename) {
  const imgObj = await getImage(filename);
  const byteArray = await imgObj.Body.transformToByteArray();
  const byte64 = Buffer.from(byteArray).toString("base64");
  return `data:image/png;base64,${byte64}`;
}

module.exports = { getUserPic };
