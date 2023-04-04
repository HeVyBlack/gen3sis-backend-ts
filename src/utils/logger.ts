import { createLogger, transports, format } from "winston";
const { printf, label, timestamp, combine } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `\n${timestamp} ${level.toLocaleUpperCase()}:\n${message}`;
});

const logger = createLogger({
  transports: [new transports.Console()],
  format: combine(timestamp(), customFormat),
});

export default logger;
