import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchWriteCommand,
  GetCommand,
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
const IndexName = process.env.DDB_INDEX_NAME;

export async function getAccountLogin(acctEmail) {
  const command = new QueryCommand({
    TableName,
    IndexName,
    KeyConditionExpression: "acctEmail = :val",
    ExpressionAttributeValues: {
      ":val": acctEmail,
    },
  });

  return await docClient.send(command);
}

export async function putUser(user) {
  const {
    id,
    firstName,
    lastName,
    email,
    password,
    birthDate,
    signupDate,
    picFilename,
  } = user;

  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          PutRequest: {
            Item: {
              PK: `u#${id}`,
              SK: `u#${id}#login`,
              acctEmail: email,
              acctPassword: password,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${id}`,
              SK: `u#${id}#user`,
              id,
              firstName,
              lastName,
              picFilename,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${id}`,
              SK: `u#${id}#about`,
              birthDate,
              signupDate,
              contactEmail: email,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

export async function getUser(id) {
  const command = new GetCommand({
    TableName,
    Key: { PK: `u#${id}`, SK: `u#${id}#user` },
  });

  return await docClient.send(command);
}
