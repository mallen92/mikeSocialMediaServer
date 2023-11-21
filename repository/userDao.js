import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getUser(email) {
  const command = new QueryCommand({
    TableName: "users",
    IndexName: "email-index",
    ExpressionAttributeValues: {
      ":email": email,
    },
    KeyConditionExpression: "email = :email",
  });

  return await docClient.send(command);
}

export async function putUser(user) {
  const {
    id,
    email,
    password,
    full_name,
    birth_date,
    signup_date,
    pic_filename,
    friends,
    friend_requests_out,
    friend_requests_in,
  } = user;

  const command = new PutCommand({
    TableName: "users",
    Item: {
      id,
      email,
      password,
      full_name,
      birth_date,
      signup_date,
      pic_filename,
      friends,
      friend_requests_out,
      friend_requests_in,
    },
  });

  return await docClient.send(command);
}

export async function updatePicFilename(userId, filename) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: userId },
    UpdateExpression: "SET pic_filename = :filename",
    ExpressionAttributeValues: {
      ":filename": filename,
    },
    ReturnValues: "UPDATED_OLD",
  });

  return await docClient.send(command);
}

export async function getUserIntroInfo(Keys) {
  const command = new BatchGetCommand({
    RequestItems: {
      users: {
        Keys,
        ProjectionExpression: "id, #name, profile_pic",
        ExpressionAttributeNames: {
          "#name": "name",
        },
      },
    },
  });

  return await docClient.send(command);
}
