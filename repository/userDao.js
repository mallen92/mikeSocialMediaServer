import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function getUserByEmail(email) {
  const command = new QueryCommand({
    TableName: "user",
    IndexName: "user_email_index",
    KeyConditionExpression: "user_email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  });

  return await docClient.send(command);
}

export async function putUser(user) {
  const {
    user_id,
    user_email,
    user_password,
    user_first_name,
    user_last_name,
    user_birth_date,
    user_profile_pic,
    user_registration_date,
  } = user;

  const command = new PutCommand({
    TableName: "user",
    Item: {
      user_id,
      user_email,
      user_password,
      user_first_name,
      user_last_name,
      user_birth_date,
      user_profile_pic,
      user_registration_date,
    },
  });

  return await docClient.send(command);
}

export async function updateUserProfilePicFilename(user, filename) {
  const command = new UpdateCommand({
    TableName: "user",
    Key: { user_id: user },
    UpdateExpression: "SET user_profile_pic = :file",
    ExpressionAttributeValues: {
      ":file": filename,
    },
    ReturnValues: "UPDATED_OLD",
  });

  return await docClient.send(command);
}

// export async function getUserProfilePicFilename(user) {
//   const command = new GetCommand({
//     TableName: "user",
//     Key: { user_id: user },
//     ProjectionExpression: "user_profile_pic",
//   });

//   return await docClient.send(command);
// }
