const winston = require("winston");

const { createLogger, format, transports } = winston;
const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  format: combine(
    timestamp({ format: "MM/DD/YYYY hh:mm:ss A" }),
    prettyPrint()
  ),
  transports: [new transports.File({ filename: "logs/error.log" })],
});

module.exports = logger;
