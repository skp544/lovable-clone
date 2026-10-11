import dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";

export const API_PORT = Number(process.env.API_PORT) || 3000;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const DATABASE_URL = databaseUrl;

export const TEMPORAL_ADDRESS =
  process.env.TEMPORAL_ADDRESS || "localhost:7233";
export const TEMPORAL_TASK_QUEUE =
  process.env.TEMPORAL_TASK_QUEUE || "coding-agent";

export const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || "default";

export const LOG_LEVEL =
  process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "http");

export const LOG_DIR = process.env.LOG_DIR || "logs";
