import AWS from "aws-sdk";

AWS.config.update({
  region: "us-west-1",
});

const docClient = new AWS.DynamoDB.DocumentClient();

export async function getUser(email) {
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
  const params = {
    TableName: "user",
    Item: {
      user_id: user.id,
      user_email: user.email,
      user_password: user.password,
      user_first_name: user.firstName,
      user_last_name: user.lastName,
      user_birth_date: user.birthDate,
      user_registration_date: user.registrationDate,
    },
  };

  return docClient.put(params).promise();
}
