import jwt from "jsonwebtoken";
import { logger } from "../logging/logger.js";

export default function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({ message: "Access Denied " });
    } else if (authHeader.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified.id;
      next();
    }
  } catch (error) {
    res.status(500).json({ message: "SERVER ERROR" });
    logger.error({ message: error });
  }
}
