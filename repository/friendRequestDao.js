import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getFriendRequestsOut(id) {
  const command = new GetCommand({
    TableName: "users",
    Key: { id },
    ProjectionExpression: "friend_requests_out",
  });

  return await docClient.send(command);
}

export async function getFriendRequestsIn(id) {
  const command = new GetCommand({
    TableName: "users",
    Key: { id },
    ProjectionExpression: "friend_requests_in",
  });

  return await docClient.send(command);
}

export async function addFriendRequestOut(user, userToAdd) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: user },
    UpdateExpression:
      "SET friend_requests_out = list_append(friend_requests_out, :user)",
    ExpressionAttributeValues: {
      ":user": [userToAdd],
    },
  });

  return await docClient.send(command);
}

export async function addFriendRequestIn(user, userToAdd) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: user },
    UpdateExpression:
      "SET friend_requests_in = list_append(friend_requests_in, :user)",
    ExpressionAttributeValues: {
      ":user": [userToAdd],
    },
  });

  return await docClient.send(command);
}

export async function deleteFriendRequestOut(user, index) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: user },
    UpdateExpression: `REMOVE friend_requests_out[${index}]`,
  });

  return await docClient.send(command);
}

export async function deleteFriendRequestIn(user, index) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: user },
    UpdateExpression: `REMOVE friend_requests_in[${index}]`,
  });

  return await docClient.send(command);
}
