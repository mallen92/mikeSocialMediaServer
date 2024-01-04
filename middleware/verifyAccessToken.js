require("dotenv").config();
const jwt = require("jsonwebtoken");

function verifyAccessToken(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const accessToken = authHeader.split(" ")[1];
    const verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.userKey = verified.userKey;
    next();
  } catch (error) {
    switch (error.message) {
      case "jwt expired": {
        res.status(403).json({ message: "Access token expired" });
        break;
      }
      default:
        res.status(401).json({ message: "An unrecognized token was sent" });
        logger.error({ message: error });
        break;
    }
  }
}

module.exports = verifyAccessToken;
