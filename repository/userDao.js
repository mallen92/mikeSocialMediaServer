import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  BatchGetCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const client = new DynamoDBClient({
  region,
  accessKeyId,
  secretAccessKey,
});
const docClient = DynamoDBDocumentClient.from(client);

const TableName = process.env.DDB_TABLE_NAME;

export async function getUserByEmail(email) {
  const command = new QueryCommand({
    TableName,
    IndexName: "user-email",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
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
    TableName,
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

export async function getUserById(id) {
  const command = new GetCommand({
    TableName,
    Key: { PK: `u#${id}`, SK: `u#${id}` },
  });

  return await docClient.send(command);
}

export async function updatePicFilename(userId, filename) {
  const command = new UpdateCommand({
    TableName,
    Key: { PK: `u#${userId}`, SK: `u#${userId}` },
    UpdateExpression: "SET pic_filename = :filename",
    ExpressionAttributeValues: {
      ":filename": filename,
    },
    ReturnValues: "UPDATED_OLD",
  });

  return await docClient.send(command);
}

export async function getFriendOrRequest(requestedUserId, requestingUserId) {
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

export async function createFriendRequest(recipUserId, senderUserId) {
  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          PutRequest: {
            Item: {
              PK: `u#${senderUserId}#requests_out`,
              SK: `u#${recipUserId}`,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${recipUserId}#requests_in`,
              SK: `u#${senderUserId}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

export async function deleteFriendRequest(userOut, userIn) {
  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          DeleteRequest: {
            Key: {
              PK: `u#${userOut}#requests_out`,
              SK: `u#${userIn}`,
            },
          },
        },
        {
          DeleteRequest: {
            Key: {
              PK: `u#${userIn}#requests_in`,
              SK: `u#${userOut}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

export async function acceptFriendRequest(recipUserId, senderUserId) {
  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          DeleteRequest: {
            Key: {
              PK: `u#${senderUserId}#requests_out`,
              SK: `u#${recipUserId}`,
            },
          },
        },
        {
          DeleteRequest: {
            Key: {
              PK: `u#${recipUserId}#requests_in`,
              SK: `u#${senderUserId}`,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${senderUserId}#friends`,
              SK: `u#${recipUserId}`,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${recipUserId}#friends`,
              SK: `u#${senderUserId}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

export async function removeFriend(userId, userToRemove) {
  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          DeleteRequest: {
            Key: {
              PK: `u#${userId}#friends`,
              SK: `u#${userToRemove}`,
            },
          },
        },
        {
          DeleteRequest: {
            Key: {
              PK: `u#${userToRemove}#friends`,
              SK: `u#${userId}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}
