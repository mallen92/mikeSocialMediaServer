import "dotenv/config";
import fs from "fs";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const Bucket = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const client = new S3Client({
  region,
  accessKeyId,
  secretAccessKey,
});

export async function getImage(Key) {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  return await client.send(command);
}

export async function uploadImage(fileURL, Key) {
  const Body = fs.createReadStream(fileURL);

  const command = new PutObjectCommand({
    Bucket,
    Body,
    Key,
  });

  return await client.send(command);
}

export async function deleteImage(Key) {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });

  return await client.send(command);
}
