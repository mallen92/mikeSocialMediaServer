require("dotenv").config();
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  BatchGetCommand,
  BatchWriteCommand,
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

async function getStatus(requestedUserId, requestingUserId) {
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

async function createFriendRequest(reqInfo) {
  const { recipId, senderId } = reqInfo;

  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          PutRequest: {
            Item: {
              PK: `u#${senderId}#requests_out`,
              SK: `u#${recipId}`,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${recipId}#requests_in`,
              SK: `u#${senderId}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

async function deleteFriendRequest(userOut, userIn) {
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

async function acceptFriendRequest(reqInfo) {
  const { recipId, senderId } = reqInfo;

  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          DeleteRequest: {
            Key: {
              PK: `u#${senderId}#requests_out`,
              SK: `u#${recipId}`,
            },
          },
        },
        {
          DeleteRequest: {
            Key: {
              PK: `u#${recipId}#requests_in`,
              SK: `u#${senderId}`,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${senderId}#friends`,
              SK: `u#${recipId}`,
            },
          },
        },
        {
          PutRequest: {
            Item: {
              PK: `u#${recipId}#friends`,
              SK: `u#${senderId}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

async function removeFriend(userKey, userToRemove) {
  const command = new BatchWriteCommand({
    RequestItems: {
      TheSocial: [
        {
          DeleteRequest: {
            Key: {
              PK: `u#${userKey}#friends`,
              SK: `u#${userToRemove}`,
            },
          },
        },
        {
          DeleteRequest: {
            Key: {
              PK: `u#${userToRemove}#friends`,
              SK: `u#${userKey}`,
            },
          },
        },
      ],
    },
  });

  return await docClient.send(command);
}

module.exports = {
  getStatus,
  createFriendRequest,
  deleteFriendRequest,
  acceptFriendRequest,
  removeFriend,
};
