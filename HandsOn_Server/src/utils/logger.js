import pino from "pino";
import { env } from "../config/env.ts";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

export default logger;
