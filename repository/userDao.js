import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getUserByEmail(email) {
  const command = new QueryCommand({
    TableName: "TheSocial",
    IndexName: "user-email",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  });

  return await docClient.send(command);
}

export async function getUserById(id) {
  const command = new GetCommand({
    TableName: "TheSocial",
    Key: { PK: `u#${id}`, SK: `u#${id}` },
  });

  return await docClient.send(command);
}

export async function putUser(user) {
  const {
    PK,
    SK,
    id,
    full_name,
    email,
    password,
    birth_date,
    signup_date,
    pic_filename,
  } = user;

  const command = new PutCommand({
    TableName: "TheSocial",
    Item: {
      PK,
      SK,
      id,
      full_name,
      email,
      password,
      birth_date,
      signup_date,
      pic_filename,
    },
  });

  return await docClient.send(command);
}

export async function updatePicFilename(userId, filename) {
  const command = new UpdateCommand({
    TableName: "TheSocial",
    Key: { PK: `u#${userId}`, SK: `u#${userId}` },
    UpdateExpression: "SET pic_filename = :filename",
    ExpressionAttributeValues: {
      ":filename": filename,
    },
    ReturnValues: "UPDATED_OLD",
  });

  return await docClient.send(command);
}

export async function getFriendsAndRequests(requestedUserId, requestingUserId) {
  const command = new BatchGetCommand({
    RequestItems: {
      TheSocial: {
        Keys: [
          { PK: `u#${requestingUserId}#friends`, SK: `u#${requestedUserId}` },
          {
            PK: `u#${requestingUserId}#requests_in`,
            SK: `u#${requestedUserId}`,
          },
          {
            PK: `u#${requestingUserId}#requests_out`,
            SK: `u#${requestedUserId}`,
          },
        ],
      },
    },
  });

  return await docClient.send(command);
}
