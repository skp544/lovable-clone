import path from "path";
import winston from "winston";
import { LOG_DIR, LOG_LEVEL, NODE_ENV } from "../config/env";

const { combine, timestamp, errors, colorize, printf, json } = winston.format;

const isProduction = NODE_ENV === "production";
const isTest = NODE_ENV === "test";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "apikey",
]);

const redact = (value: unknown, depth = 0): unknown => {
  if (depth > 5 || value === null || typeof value !== "object") return value;
  if (value instanceof Error) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([key, v]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redact(v, depth + 1),
    ]),
  );
};

// Winston keeps its own symbol-keyed fields (level, message, ...) on the info
// object, so only the plain string-keyed metadata is rewritten.
const redactFormat = winston.format((info) => {
  for (const key of Object.keys(info)) {
    if (key === "level" || key === "message") continue;
    info[key] = SENSITIVE_KEYS.has(key.toLowerCase())
      ? "[REDACTED]"
      : redact(info[key]);
  }
  return info;
});

const devFormat = combine(
  errors({ stack: true }),
  timestamp({ format: "HH:mm:ss" }),
  colorize(),
  printf(({ timestamp, level, message, stack, service, env, pid, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${stack ?? message}${rest}`;
  }),
);

const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  redactFormat(),
  json(),
);

const fileOptions = {
  maxsize: 10 * 1024 * 1024,
  maxFiles: 14,
  tailable: true,
};

// Console always; files only in production so local runs stay clean. Both
// file transports also capture crashes (uncaught exceptions / rejections).
const transports: winston.transport[] = [
  new winston.transports.Console({
    silent: isTest,
    handleExceptions: true,
    handleRejections: true,
  }),
];

if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      ...fileOptions,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      handleExceptions: true,
      handleRejections: true,
      ...fileOptions,
    }),
  );
}

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: { service: "lovable-server", env: NODE_ENV, pid: process.pid },
  transports,
  exitOnError: true,
});
