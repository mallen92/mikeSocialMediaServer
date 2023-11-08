import moment from "moment";

export default function validateSignup(req, res, next) {
  const userEmail = req.body.email;

  if (!userEmail || userEmail.trim() === "") {
    res.status(400).json({ message: "Please enter an email." });
  } else {
    if (!isEmailFormatValid(userEmail)) {
      res.status(400).json({ message: "Email address has invalid format." });
    } else {
      const userPassword = req.body.password;

      if (!userPassword || userPassword.trim() === "") {
        res.status(400).json({ message: "Please enter a password." });
      } else {
        if (!isPasswordFormatValid(userPassword)) {
          res.status(400).json({ message: "Password has invalid format." });
        } else {
          const userFirstName = req.body.firstName;

          if (!userFirstName || userFirstName.trim() === "") {
            res.status(400).json({ message: "Please enter a first name." });
          } else {
            if (!isNameFormatValid(userFirstName)) {
              res.status(400).json({
                message: "Name has invalid format.",
              });
            } else {
              const userLastName = req.body.lastName;

              if (!userLastName || userLastName.trim() === "") {
                res.status(400).json({ message: "Please enter a last name." });
              } else {
                if (!isNameFormatValid(userLastName)) {
                  res.status(400).json({
                    message: "Name has invalid format.",
                  });
                } else {
                  const userBirthDate = req.body.birthDate;

                  if (!userBirthDate || userBirthDate.trim() === "") {
                    res
                      .status(400)
                      .json({ message: "Please enter your date of birth." });
                  } else {
                    if (!moment(userBirthDate).isValid()) {
                      res.status(400).json({
                        message: "Birth date is not a valid date.",
                      });
                    } else {
                      const today = moment();
                      const duration = moment.duration(
                        today.diff(moment(userBirthDate))
                      );
                      const age = duration._data.years;

                      if (age < 13) {
                        res.status(400).json({
                          message:
                            "You must be at least 13 years of age to sign up.",
                        });
                      } else {
                        next();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/* FORMAT VALIDATORS */

function isEmailFormatValid(email) {
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (pattern.test(email.trim())) return true;
  else return false;
}

function isPasswordFormatValid(password) {
  const pattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?!.*\s)(?!.*\s$).{10,}$/;

  if (pattern.test(password.trim())) return true;
  else return false;
}

function isNameFormatValid(name) {
  const pattern = /^[a-zA-Z][a-zA-Z -]{1,}$/;

  if (pattern.test(name.trim())) return true;
  else return false;
}

/* END FORMAT VALIDATORS */
