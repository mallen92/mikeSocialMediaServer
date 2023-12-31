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
  if (existingUser) throw new Error("userAlreadyExists");

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  const userKey = UniqueString().substring(0, 10);
  const picFilename = process.env.DEFAULT_PROF_PIC;

  const newUser = {
    firstName,
    lastName,
    picFilename,
    username: userKey,
    email,
    password: hashedPassword,
    birthDate: formatDate(birthDate),
    signupDate: formatDate(moment()),
  };
  await createUser(userKey, newUser);
  let { user, sessionKey } = await getUserAccount(userKey);
  const tokens = getTokens(userKey, sessionKey);
  user.accessToken = tokens.accessToken;

  return {
    data: user,
    refreshToken: tokens.refreshToken,
  };
}

async function logInUser(loginFormData) {
  const { email, password } = loginFormData;
  const existingAcctCreds = await getLogin(email);
  if (!existingAcctCreds) throw new Error("userDoesntExist");

  const passwordsMatch = await bcrypt.compare(
    password,
    existingAcctCreds.acctPassword
  );
  if (!passwordsMatch) throw new Error("incorrectCredentials");

  const userKey = existingAcctCreds.PK.split("#")[1];
  let { user, sessionKey } = await getUserAccount(userKey);
  const tokens = getTokens(userKey, sessionKey);
  user.accessToken = tokens.accessToken;

  return {
    data: user,
    refreshToken: tokens.refreshToken,
  };
}

async function getSessionFromCache(key) {
  let user = await getSession(key);
  user.picUrl = await getUserPic(user.picFilename);
  return user;
}

async function clearSessionFromCache(key) {
  await clearSession(key);
}

/*--------------------------- HELPER FUNCTIONS ---------------------------*/

function formatDate(date) {
  const month = moment(date).month() + 1;
  const day = moment(date).date();
  const year = moment(date).year();

  return `${month}/${day}/${year}`;
}

function getTokens(userKey, sessionKey) {
  const accessToken = jwt.sign({ userKey }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
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

/*------------------------ END HELPER FUNCTIONS ------------------------*/

module.exports = {
  signUpUser,
  logInUser,
  getSessionFromCache,
  clearSessionFromCache,
};
