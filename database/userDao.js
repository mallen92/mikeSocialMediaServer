require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchWriteCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

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

async function getLogin(acctEmail) {
  const command = new QueryCommand({
    TableName,
    IndexName: "TheSocialLogins",
    KeyConditionExpression: "acctEmail = :val",
    ExpressionAttributeValues: {
      ":val": acctEmail,
    },
  });

  return await docClient.send(command);
}

async function putUser(key, user) {
  const {
    firstName,
    lastName,
    picFilename,
    username,
    email,
    password,
    birthDate,
    signupDate,
  } = user;

  let userSearchName = `${firstName} ${lastName}`.toLowerCase();

  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          PutRequest: {
            Item: {
              PK: `u#${key}`,
              SK: `u#${key}#login`,
              acctEmail: email,
              acctPassword: password,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${key}`,
              SK: `u#${key}`,
              userPK: username,
              userSearchName,
              firstName,
              lastName,
              picFilename,
              username,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${key}`,
              SK: `u#${key}#about`,
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

async function getUserByKey(key) {
  const command = new GetCommand({
    TableName,
    Key: { PK: `u#${key}`, SK: `u#${key}` },
    ProjectionExpression: "username, firstName, lastName, picFilename",
  });

  return await docClient.send(command);
}

async function getUserByUsername(username) {
  const command = new QueryCommand({
    TableName,
    IndexName: "TheSocialUsers",
    KeyConditionExpression: "userPK = :val",
    ExpressionAttributeValues: {
      ":val": username,
    },
    ProjectionExpression: "username, firstName, lastName, picFilename",
  });

  return await docClient.send(command);
}

async function getUserKey(username) {
  const command = new QueryCommand({
    TableName,
    IndexName: "TheSocialUsers",
    KeyConditionExpression: "userPK = :val",
    ExpressionAttributeValues: {
      ":val": username,
    },
    ProjectionExpression: "PK",
  });

  return await docClient.send(command);
}

async function updatePicFilenameInDB(userKey, filename) {
  const command = new UpdateCommand({
    TableName,
    Key: { PK: `u#${userKey}`, SK: `u#${userKey}` },
    UpdateExpression: "SET picFilename = :filename",
    ExpressionAttributeValues: {
      ":filename": filename,
    },
    ReturnValues: "UPDATED_OLD",
  });

  return await docClient.send(command);
}

async function getUsers() {
  const command = new ScanCommand({
    TableName,
    IndexName: "TheSocialUsers",
    ProjectionExpression: "username, firstName, lastName, picFilename",
  });

  return await docClient.send(command);
}

module.exports = {
  getLogin,
  putUser,
  getUserByKey,
  getUserByUsername,
  getUserKey,
  updatePicFilenameInDB,
  getUsers,
};
