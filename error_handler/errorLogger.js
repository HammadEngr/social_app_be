import winston from "winston";
import fs from "fs";
import path from "path";

const logsDir = "logs";

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] : ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, "error.log") }),
    new winston.transports.Console(),
  ],
});

export default errorLogger;
