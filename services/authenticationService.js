import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import * as userDao from "../repository/userDao.js";

export async function registerUser(userToRegister) {
  for (const property in userToRegister) {
    userToRegister[property] = userToRegister[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = userToRegister;

  const existingUser = await userDao.getUserByEmail(email);
  if (existingUser.Items.length === 0) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    userToRegister = {
      user_id: uuidv4(),
      user_email: email,
      user_password: hashedPassword,
      user_first_name: firstName,
      user_last_name: lastName,
      user_birth_date: formatDate(birthDate),
      user_registration_date: formatDate(moment()),
    };
    await userDao.putUser(userToRegister);

    return {
      message: "userRegistered",
      data: returnUserWithToken(userToRegister),
    };
  } else {
    return { message: "userAlreadyExists" };
  }
}

export async function logInUser(userToLogIn) {
  const { email, password } = userToLogIn;
  const data = await userDao.getUserByEmail(email);

  if (data.Items.length !== 0) {
    const registeredUser = data.Items[0];
    const passwordsMatch = await bcrypt.compare(
      password,
      registeredUser.user_password
    );

    if (passwordsMatch) {
      return {
        message: "userAuthenticated",
        data: returnUserWithToken(registeredUser),
      };
    } else {
      return { message: "incorrectCredentials" };
    }
  } else {
    return { message: "userDoesntExist" };
  }
}

/* HELPER FUNCTIONS */

function formatDate(date) {
  const month = moment(date).month() + 1;
  const day = moment(date).date();
  const year = moment(date).year();

  return `${month}/${day}/${year}`;
}

function returnUserWithToken(user) {
  const JWT_SECRET = fs.readFileSync("jwt.txt", {
    encoding: "utf8",
  });

  const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: "1d" });
  delete user.user_password;
  user.user_token = token;
  return user;
}

/* END HELPER FUNCTIONS */
