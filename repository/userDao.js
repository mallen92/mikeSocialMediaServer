import AWS from "aws-sdk";

AWS.config.update({
  region: "us-west-1",
});

const docClient = new AWS.DynamoDB.DocumentClient();

export async function getUserByEmail(email) {
  const params = {
    TableName: "user",
    IndexName: "user_email_index",
    KeyConditionExpression: "user_email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  return docClient.query(params).promise();
}

export async function putUser(user) {
  const {
    user_id,
    user_email,
    user_password,
    user_first_name,
    user_last_name,
    user_birth_date,
    user_registration_date,
  } = user;

  const params = {
    TableName: "user",
    Item: {
      user_id,
      user_email,
      user_password,
      user_first_name,
      user_last_name,
      user_birth_date,
      user_registration_date,
    },
  };

  return docClient.put(params).promise();
}
