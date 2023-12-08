import "dotenv/config";
import bcrypt from "bcrypt";
import moment from "moment";
import { UniqueString } from "unique-string-generator";
import * as userService from "../services/userService.js";

export async function signUpUser(signupFormData) {
  for (const property in signupFormData) {
    signupFormData[property] = signupFormData[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = signupFormData;

  const existingUser = await userService.getLogin(email);
  if (!existingUser) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = UniqueString();

    const newUser = {
      id,
      firstName,
      lastName,
      picFilename: process.env.DEFAULT_PROF_PIC,
      email,
      password: hashedPassword,
      birthDate: formatDate(birthDate),
      signupDate: formatDate(moment()),
    };
    await userService.createUser(newUser);

    return {
      message: "userRegistered",
      data: await userService.getAuthUser(id),
    };
  } else return { message: "userAlreadyExists" };
}

export async function logInUser(loginFormData) {
  const { email, password } = loginFormData;
  const existingAcctCreds = await userService.getLogin(email);

  if (existingAcctCreds) {
    const passwordsMatch = await bcrypt.compare(
      password,
      existingAcctCreds.acctPassword
    );

    if (passwordsMatch) {
      const userId = existingAcctCreds.PK.split("#")[1];

      return {
        message: "userAuthenticated",
        data: await userService.getAuthUser(userId),
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
