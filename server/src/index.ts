import express from "express";
import cors from "cors";
import { API_PORT } from "./config/env";
import apiRouter from "./routes/api";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.listen(API_PORT, () => {
  console.log(`Server running on port http://localhost:${API_PORT}`);
});
