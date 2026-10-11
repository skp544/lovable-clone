import express from "express";
import cors from "cors";
import { API_PORT } from "./config/env";
import apiRouter from "./routes/api";
import { requestLogger } from "./middleware/request-logger.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { logger } from "./lib/logger";

const app = express();

app.use(requestLogger);
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(API_PORT, () => {
  logger.info(`Server running on port http://localhost:${API_PORT}`);
});
