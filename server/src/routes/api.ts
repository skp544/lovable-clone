import { Router } from "express";
import { healthCheck } from "../controllers/health";

const apiRouter = Router();

apiRouter.get("/health", healthCheck);

export default apiRouter;
