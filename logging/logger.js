import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint } = format;

export const logger = createLogger({
  format: combine(
    timestamp({ format: "MM/DD/YYYY hh:mm:ss A" }),
    prettyPrint()
  ),
  transports: [new transports.File({ filename: "logging/error.log" })],
});
