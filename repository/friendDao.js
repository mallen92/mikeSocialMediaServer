import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getFriends(id) {
  const command = new GetCommand({
    TableName: "users",
    Key: { id },
    ProjectionExpression: "#name, friends",
    ExpressionAttributeNames: {
      "#name": "name",
    },
  });

  return await docClient.send(command);
}

export async function addFriend(user, userToAdd) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: user },
    UpdateExpression: "SET friends = list_append(friends, :user)",
    ExpressionAttributeValues: {
      ":user": [userToAdd],
    },
  });

  return await docClient.send(command);
}

export async function deleteFriend(user, index) {
  const command = new UpdateCommand({
    TableName: "users",
    Key: { id: user },
    UpdateExpression: `REMOVE friends[${index}]`,
  });

  return await docClient.send(command);
}
