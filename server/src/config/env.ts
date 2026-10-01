import dotenv from "dotenv";

dotenv.config();

export const API_PORT = Number(process.env.API_PORT) || 3000;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const DATABASE_URL = databaseUrl;
