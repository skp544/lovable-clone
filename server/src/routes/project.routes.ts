import { Router } from "express";
import {
  createProject,
  getProject,
  getProjects,
} from "../controllers/project.controller";
import { getProjectMessages } from "../controllers/message.controller";
import { validateCreateProject, validateId } from "../schemas/project.schema";

const projectRouter = Router();

projectRouter.get("/", getProjects);

projectRouter.post("/", validateCreateProject, createProject);

projectRouter.get("/:id", validateId, getProject);

projectRouter.get("/:id/messages", validateId, getProjectMessages);

export default projectRouter;
