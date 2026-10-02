import { Router } from "express";
import { getProject, getProjects } from "../controllers/project.controller";

const projectRouter = Router();

projectRouter.get("/", getProjects);

projectRouter.get("/:id", getProject);

export default projectRouter;
