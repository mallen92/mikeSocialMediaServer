/*--------------- 3RD PARTY MODULES ----------------*/
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { UniqueString } = require("unique-string-generator");

/*--------------- SERVICE MODULES ----------------*/
const { createUser, getLogin, getUserAccount } = require("./userService");
const { getUserPic } = require("./imageService");

/*--------------- CACHE MODULES ----------------*/
const { getSession, clearSession } = require("../cache/sessionCache");

async function signUpUser(signupFormData) {
  for (const property in signupFormData) {
    signupFormData[property] = signupFormData[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = signupFormData;

  const existingUser = await getLogin(email);
  if (!existingUser) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = UniqueString().substring(15);
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
    let { user, sessionKey } = await getUserAccount(id);
    const tokens = getTokens(id, sessionKey);
    user.accessToken = tokens.accessToken;

    return {
      message: "userRegistered",
      data: user,
      refreshToken: tokens.refreshToken,
    };
  } else return { message: "userAlreadyExists" };
}

async function logInUser(loginFormData) {
  const { email, password } = loginFormData;
  const existingAcctCreds = await getLogin(email);

  if (existingAcctCreds) {
    const passwordsMatch = await bcrypt.compare(
      password,
      existingAcctCreds.acctPassword
    );

    if (passwordsMatch) {
      const userId = existingAcctCreds.PK.split("#")[1];
      let { user, sessionKey } = await getUserAccount(userId);
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

async function getSessionFromCache(key) {
  let user = await getSession(key);
  user.picUrl = await getUserPic(user.picFilename);
  return user;
}

async function clearSessionFromCache(key) {
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

module.exports = {
  signUpUser,
  logInUser,
  getSessionFromCache,
  clearSessionFromCache,
};
