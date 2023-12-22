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

async function putUser(user) {
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

  let userName = `${firstName} ${lastName}`.toLowerCase();

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
              userSearchKey: "user",
              userName,
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

async function getUser(id) {
  const command = new GetCommand({
    TableName,
    Key: { PK: `u#${id}`, SK: `u#${id}#user` },
    ProjectionExpression: "id, firstName, lastName, picFilename",
  });

  return await docClient.send(command);
}

async function updatePicFilenameInDB(userId, filename) {
  const command = new UpdateCommand({
    TableName,
    Key: { PK: `u#${userId}`, SK: `u#${userId}#user` },
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
    ProjectionExpression: "id, firstName, lastName, picFilename",
  });

  return await docClient.send(command);
}

module.exports = {
  getLogin,
  putUser,
  getUser,
  updatePicFilenameInDB,
  getUsers,
};
