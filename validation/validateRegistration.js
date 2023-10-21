import moment from "moment";

export default function validateRegistration(req, res, next) {
  /* We cannot use the trim() method here because if
  the email is null, then trim() will throw an error.*/
  const userEmail = req.body.email;

  if (!userEmail || userEmail.trim() === "") {
    res.status(400).json({ error: "No email address was sent." });
  } else {
    /* An email was sent, so validate that it is correctly formatted. */
    if (!isEmailFormatValid(userEmail)) {
      res.status(400).json({ error: "Email address has invalid format." });
    } else {
      const userPassword = req.body.password;

      if (!userPassword || userPassword.trim() === "") {
        res.status(400).json({ error: "No password was sent." });
      } else {
        if (userPassword.includes(" ")) {
          res.status(400).json({ error: "Passwords cannot contain spaces." });
        } else {
          const userFirstName = req.body.firstName;

          if (!userFirstName || userFirstName.trim() === "") {
            res.status(400).json({ error: "User's first name was not sent." });
          } else {
            const userLastName = req.body.lastName;

            if (!userLastName || userLastName.trim() === "") {
              res.status(400).json({ error: "User's last name was not sent." });
            } else {
              const userBirthDate = req.body.birthDate;

              if (!userBirthDate || userBirthDate.trim() === "") {
                res
                  .status(400)
                  .json({ error: "User's birth date was not sent." });
              } else {
                if (!moment(userBirthDate).isValid()) {
                  res
                    .status(400)
                    .json({ error: "User's birth date is not a valid date." });
                } else {
                  const today = moment();
                  const duration = moment.duration(
                    today.diff(moment(userBirthDate))
                  );
                  const age = duration._data.years;

                  if (age < 13) {
                    res
                      .status(400)
                      .json({ error: "User is not at least 13 years of age." });
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

/* HELPER FUNCTIONS */

function isEmailFormatValid(email) {
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (pattern.test(email.trim())) return true;
  else return false;
}

/* END HELPER FUNCTIONS */
