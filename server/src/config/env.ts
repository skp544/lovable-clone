import dotenv from "dotenv";

dotenv.config();

export const API_PORT = Number(process.env.API_PORT) || 3000;
