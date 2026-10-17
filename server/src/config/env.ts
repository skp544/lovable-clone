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

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const OPENAI_API_KEY = openaiApiKey;

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const OPENAI_BUILDER_MODEL =
  process.env.OPENAI_BUILDER_MODEL || "gpt-5-mini";

export const OPENAI_PLANNING_MODEL =
  process.env.OPENAI_PLANNING_MODEL || "gpt-5-mini";

export const OPENAI_REASONING_MODEL =
  process.env.OPENAI_REASONING_MODEL || "gpt-5-mini";

export type ReasoningEffort = "low" | "medium" | "high";

const REASONING_EFFORTS: readonly ReasoningEffort[] = ["low", "medium", "high"];

const rawReasoningEffort = process.env.OPENAI_REASONING_EFFORT;

export const OPENAI_REASONING_EFFORT: ReasoningEffort =
  REASONING_EFFORTS.find((effort) => effort === rawReasoningEffort) ?? "medium";

export const LOG_LEVEL =
  process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "http");

export const LOG_DIR = process.env.LOG_DIR || "logs";
