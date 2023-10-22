import bcrypt from "bcrypt";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import fs from "fs";
import * as userDao from "../repository/userDao.js";

export async function registerUser(userToRegister) {
  for (let property in userToRegister) {
    userToRegister[property] = userToRegister[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = userToRegister;
  const existingUser = await userDao.getUser(email);

  if (existingUser.Items[0]) {
    return { message: "userAlreadyExists" };
  } else {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const registrationDate = formatDate(moment());

    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      birthDate: formatDate(birthDate),
      registrationDate,
    };
    await userDao.putUser(newUser);

    const newUserLoginCreds = {
      email,
      password: hashedPassword,
    };
    return { message: "userSuccessfullyRegistered", data: newUserLoginCreds };
  }
}

export async function loginUser(userToLogIn) {
  const { email, password } = userToLogIn;
  const data = await userDao.getUser(email);

  if (data.Items[0]) {
    const registeredUser = data.Items[0];
    const registeredUserPass = registeredUser.user_password;
    const passwordsMatch = await bcrypt.compare(password, registeredUserPass);

    if (passwordsMatch) {
      const JWT_SECRET = fs.readFileSync("jwt.txt", {
        encoding: "utf8",
        flag: "r",
      });
      const token = jwt.sign({ id: registeredUser.user_id }, JWT_SECRET);

      delete registeredUser.user_password;
      registeredUser.token = token;
      return { message: "userAuthenticated", data: registeredUser };
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

/* END HELPER FUNCTIONS */
