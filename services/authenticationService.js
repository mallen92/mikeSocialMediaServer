import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import { UniqueString } from "unique-string-generator";
import { createUser, getLogin, getUser } from "./userService.js";
import { getUserPic } from "./imageService.js";
import { getSession, clearSession } from "../cache/sessionCache.js";

export async function signUpUser(signupFormData) {
  for (const property in signupFormData) {
    signupFormData[property] = signupFormData[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = signupFormData;

  const existingUser = await getLogin(email);
  if (!existingUser) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = UniqueString();
    const picFilename = process.env.DEFAULT_PROF_PIC;

    const newUser = {
      id,
      firstName,
      lastName,
      picFilename,
      email,
      password: hashedPassword,
      birthDate: formatDate(birthDate),
      signupDate: formatDate(moment()),
    };
    await createUser(newUser);
    let { user, sessionKey } = await getUser(id);
    const tokens = getTokens(id, sessionKey);
    user.accessToken = tokens.accessToken;

    return {
      message: "userRegistered",
      data: user,
      refreshToken: tokens.refreshToken,
    };
  } else return { message: "userAlreadyExists" };
}

export async function logInUser(loginFormData) {
  const { email, password } = loginFormData;
  const existingAcctCreds = await getLogin(email);

  if (existingAcctCreds) {
    const passwordsMatch = await bcrypt.compare(
      password,
      existingAcctCreds.acctPassword
    );

    if (passwordsMatch) {
      const userId = existingAcctCreds.PK.split("#")[1];
      let { user, sessionKey } = await getUser(userId);
      const tokens = getTokens(userId, sessionKey);
      user.accessToken = tokens.accessToken;

      return {
        message: "userAuthenticated",
        data: user,
        refreshToken: tokens.refreshToken,
      };
    } else return { message: "incorrectCredentials" };
  } else return { message: "userDoesntExist" };
}

export async function getSessionFromCache(key) {
  let user = await getSession(key);
  user.picUrl = await getUserPic(user.picFilename);
  return user;
}

export async function clearSessionFromCache(key) {
  const response = await clearSession(key);
  if (!response) throw new Error("Error: Session was not removed from cache");
  return response;
}

/* HELPER FUNCTIONS */

function formatDate(date) {
  const month = moment(date).month() + 1;
  const day = moment(date).date();
  const year = moment(date).year();

  return `${month}/${day}/${year}`;
}

function getTokens(id, sessionKey) {
  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
  const refreshToken = jwt.sign(
    { sessionKey },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
  return { accessToken, refreshToken };
}

/* END HELPER FUNCTIONS */
