import { Router } from "express";
import { getProject, getProjects } from "../controllers/project.controller";
import { validateId } from "../schemas/project.schema";

const projectRouter = Router();

projectRouter.get("/", getProjects);

projectRouter.get("/:id", validateId, getProject);

export default projectRouter;
