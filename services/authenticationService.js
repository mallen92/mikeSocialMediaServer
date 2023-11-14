import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import * as userDao from "../repository/userDao.js";
import * as imageService from "../services/imageService.js";

export async function signUpUser(userToSignUp) {
  for (const property in userToSignUp) {
    userToSignUp[property] = userToSignUp[property].trim();
  }

  const { email, password, firstName, lastName, birthDate } = userToSignUp;

  const existingUser = await userDao.getUserByEmail(email);
  if (existingUser.Items.length === 0) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    userToSignUp = {
      user_id: uuidv4(),
      user_email: email,
      user_password: hashedPassword,
      user_first_name: firstName,
      user_last_name: lastName,
      user_birth_date: formatDate(birthDate),
      user_profile_pic: process.env.DEFAULT_PROF_PIC,
      user_friends: [],
      user_registration_date: formatDate(moment()),
    };
    await userDao.putUser(userToSignUp);

    return {
      message: "userRegistered",
      data: await returnUser(userToSignUp),
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
        data: await returnUser(registeredUser),
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

async function returnUser(user) {
  const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  user.user_token = token;

  delete user.user_password;
  delete user.user_birth_date;
  delete user.user_registration_date;
  delete user.user_email;

  user.user_profile_pic = await imageService.getUserProfilePic(
    user.user_profile_pic
  );

  return user;
}

/* END HELPER FUNCTIONS */
