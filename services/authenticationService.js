import bcrypt from "bcrypt";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import * as userService from "../services/userService.js";

export async function signUpUser(signupFormData) {
  for (const property in signupFormData) {
    signupFormData[property] = signupFormData[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = signupFormData;

  const existingUser = await userService.getExistingUser(email);
  if (!existingUser) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      full_name: `${firstName} ${lastName}`,
      birth_date: formatDate(birthDate),
      signup_date: formatDate(moment()),
      pic_filename: process.env.DEFAULT_PROF_PIC,
      friends: [],
      friend_requests_in: [],
      friend_requests_out: [],
    };
    await userService.signUpUser(newUser);

    return {
      message: "userRegistered",
      data: await userService.logInUser(newUser.email),
    };
  } else return { message: "userAlreadyExists" };
}

export async function logInUser(loginFormData) {
  const { email, password } = loginFormData;
  const existingUser = await userService.getExistingUser(email);

  if (existingUser) {
    const passwordsMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (passwordsMatch) {
      return {
        message: "userAuthenticated",
        data: await userService.logInUser(existingUser.email),
      };
    } else return { message: "incorrectCredentials" };
  } else return { message: "userDoesntExist" };
}

/* HELPER FUNCTIONS */

function formatDate(date) {
  const month = moment(date).month() + 1;
  const day = moment(date).date();
  const year = moment(date).year();

  return `${month}/${day}/${year}`;
}

/* END HELPER FUNCTIONS */
