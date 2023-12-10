require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const client = new S3Client({
  region,
  accessKeyId,
  secretAccessKey,
});

const Bucket = process.env.S3_BUCKET;

async function getImage(Key) {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  return await client.send(command);
}

async function uploadImage(fileURL, Key) {
  const Body = fs.createReadStream(fileURL);

  const command = new PutObjectCommand({
    Bucket,
    Body,
    Key,
  });

  return await client.send(command);
}

async function deleteImage(Key) {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });

  return await client.send(command);
}

module.exports = { getImage, uploadImage, deleteImage };
