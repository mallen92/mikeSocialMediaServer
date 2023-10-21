import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerUser(userToRegister) {
  try {
    for (let property in userToRegister) {
      userToRegister[property] = userToRegister[property].trim();
    }

    /* Destructring the userToRegister object into its individual
    properties that I can access directly.  */
    const { email, password, firstName, lastName, birthDate } = userToRegister;

    /* Encrypting the password */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    /* Creating a new object that will be sent to the DAO to save
    the new user. */
    const createdUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      birthDate,
    };

    return createdUser;
  } catch (error) {
    console.log(error);
  }
}
