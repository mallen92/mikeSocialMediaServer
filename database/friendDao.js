require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchGetCommand,
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

async function getFriends(id, Limit) {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: "PK = :val",
    ExpressionAttributeValues: {
      ":val": `u#${id}#friends`,
    },
    ProjectionExpression: "SK",
    Limit,
  });

  return await docClient.send(command);
}

async function getFriendsInfo(Keys) {
  const command = new BatchGetCommand({
    RequestItems: {
      TheSocial: {
        Keys,
        ProjectionExpression: "id, userName, firstName, lastName, picFilename",
      },
    },
  });

  return await docClient.send(command);
}

module.exports = { getFriends, getFriendsInfo };
