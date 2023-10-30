import moment from "moment";

export default function validateRegistration(req, res, next) {
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
        if (userPassword.includes(" ")) {
          res.status(400).json({ message: "Passwords cannot contain spaces." });
        } else {
          const userFirstName = req.body.firstName;

          if (!userFirstName || userFirstName.trim() === "") {
            res.status(400).json({ message: "Please enter a first name." });
          } else {
            if (!isNameFormatValid(userFirstName)) {
              res.status(400).json({
                message:
                  "Name can only contain letters, spaces, and dashes (-)",
              });
            } else {
              const userLastName = req.body.lastName;

              if (!userLastName || userLastName.trim() === "") {
                res.status(400).json({ message: "Please enter a last name." });
              } else {
                if (!isNameFormatValid(userLastName)) {
                  res.status(400).json({
                    message:
                      "Name can only contain letters, spaces, and dashes (-)",
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

/* HELPER FUNCTIONS */

function isEmailFormatValid(email) {
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (pattern.test(email.trim())) return true;
  else return false;
}

function isNameFormatValid(name) {
  const pattern = /^[a-zA-Z\s-]+$/;

  if (pattern.test(name.trim())) return true;
  else return false;
}

/* END HELPER FUNCTIONS */
