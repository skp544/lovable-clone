import morgan from "morgan";
import { NODE_ENV } from "../config/env";
import { logger } from "../lib/logger";

// Pipe morgan's output through winston so request logs share its format.
export const requestLogger = morgan(
  NODE_ENV === "production" ? "combined" : "dev",
  {
    stream: { write: (line) => logger.http(line.trim()) },
  },
);
