import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";
import projectRouter from "./project.routes";

const apiRouter = Router();

apiRouter.get("/health", healthCheck);

apiRouter.use("/projects", projectRouter);

export default apiRouter;
