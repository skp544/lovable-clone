import express from "express";
import cors from "cors";
import { API_PORT } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(API_PORT, () => {
  console.log(`Server running on port http://localhost:${API_PORT}`);
});
