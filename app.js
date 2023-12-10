/*--------------- 3RD PARTY MODULES ----------------*/
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");

/*----------------- NODE MODULES ------------------*/
const path = require("path");

/*----------------- CONFIG MODULES ------------------*/
const corsOptions = require("./cors/corsOptions");
const logger = require("./logs/logger");
const redisClient = require("./redisClient");

/*----------------- HANDLER MODULES ------------------*/
const rootHandlers = require("./handlers/rootHandlers");
const authHandlers = require("./handlers/authHandlers");

/*----------------- SERVER CONFIGURATIONS ------------------*/
const app = express();
const PORT = process.env.PORT || 3001;

/*-------------- CONFIGURATION MIDDLEWARE ---------------*/
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/*---------------- HANDLER MIDDLEWARE -----------------*/
app.use(rootHandlers);
app.use("/auth", authHandlers);

/*---------------- 404 MIDDLEWARE -----------------*/
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

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
