import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({});

export async function getUserProfilePic(Key) {
  const command = new GetObjectCommand({
    Bucket: "thesocial-assets",
    Key,
  });

  return await client.send(command);
}
