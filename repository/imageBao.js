import "dotenv/config";
import fs from "fs";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const client = new S3Client({
  region,
  accessKeyId,
  secretAccessKey,
});

export async function uploadImage(fileURL, filename) {
  const fileStream = fs.createReadStream(fileURL);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Body: fileStream,
    Key: filename,
  });

  return await client.send(command);
}

export async function getUserProfilePic(Key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key,
  });

  return await client.send(command);
}
