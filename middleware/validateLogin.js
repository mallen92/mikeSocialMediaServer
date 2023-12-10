function validateLogin(req, res, next) {
  if (!req.body.email || req.body.email.trim() === "") {
    res.status(400).json({ message: "Please enter an email." });
  } else {
    if (!req.body.password || req.body.password.trim() === "") {
      res.status(400).json({ message: "Please enter a password." });
    } else {
      next();
    }
  }
}

module.exports = validateLogin;
