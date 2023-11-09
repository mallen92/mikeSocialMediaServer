import "dotenv/config";
import jwt from "jsonwebtoken";
import { logger } from "../logging/logger.js";

export default function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({ message: "Access denied" });
    } else if (authHeader.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified.id;
      next();
    }
  } catch (error) {
    switch (error.message) {
      case "jwt expired":
        res
          .status(403)
          .json({ message: "Your session has expired. Please log in." });
        logger.error({ message: error });
        break;
      default:
        res.status(403).json({ message: "Access denied" });
        logger.error({ message: error });
        break;
    }
  }
}
