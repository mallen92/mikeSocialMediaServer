import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getFriends(user) {
  const command = new GetCommand({
    TableName: "user",
    Key: { user_id: user },
    ProjectionExpression: "user_friends",
  });

  return await docClient.send(command);
}

export async function addFriend(user, userToAdd) {
  const command = new UpdateCommand({
    TableName: "user",
    Key: { user_id: user },
    UpdateExpression: "SET user_friends = list_append(user_friends, :user)",
    ExpressionAttributeValues: {
      ":user": [userToAdd],
    },
  });

  return await docClient.send(command);
}

export async function deleteFriend(user, index) {
  const command = new UpdateCommand({
    TableName: "user",
    Key: { user_id: user },
    UpdateExpression: `REMOVE user_friends[${index}]`,
  });

  return await docClient.send(command);
}
