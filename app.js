import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { redisConnect } from "./redis.js";
import { logger } from "./logs/logger.js";
import authenticationHandlers from "./handlers/authenticationHandlers.js";
import userHandlers from "./handlers/userHandlers.js";
import imageHandlers from "./handlers/imageHandlers.js";

const app = express();
const PORT = 3001;
app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authenticationHandlers);
app.use("/user", userHandlers);
app.use("/images", imageHandlers);

redisConnect()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  )
  .catch(() => {
    console.error("Not connected to Redis server");
    logger.error({ message: "Not connected to Redis server" });
  });
