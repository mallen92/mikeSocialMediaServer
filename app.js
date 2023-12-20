/*--------------- 3RD PARTY MODULES ----------------*/
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

/*----------------- CONFIG MODULES ------------------*/
const corsOptions = require("./cors/corsOptions");
const logger = require("./logs/logger");
const redisClient = require("./redisClient");

/*----------------- HANDLER MODULES ------------------*/
const authHandlers = require("./handlers/authHandlers");
const userHandlers = require("./handlers/userHandlers");
const imageHandlers = require("./handlers/imageHandlers");
const connectHandlers = require("./handlers/connectHandlers");

/*----------------- SERVER CONFIGURATIONS ------------------*/
const app = express();
const PORT = process.env.PORT || 3001;

/*-------------- ROOT MIDDLEWARE ---------------*/
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

/*---------------- PATH MIDDLEWARE -----------------*/
app.use("/auth", authHandlers);
app.use("/user", userHandlers);
app.use("/images", imageHandlers);
app.use("/connect", connectHandlers);

redisClient
  .connect()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  )
  .catch(() => {
    console.error("Not connected to Redis server");
    logger.error({ message: "Not connected to Redis server" });
  });
