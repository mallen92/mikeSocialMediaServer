import "dotenv/config";
import jwt from "jsonwebtoken";

export default function verifyAccessToken(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const accessToken = req.headers.authorization.split(" ")[1];
    const verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified.id;
    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden" });
  }
}
