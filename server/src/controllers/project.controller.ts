import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/app.error";
import type { CreateProjectInput } from "../schemas/project.schema";
import {
  createProject as createProjectService,
  getAllProjects,
  getProjectById,
} from "../services/project.service";
import { sendSuccess } from "../utils/response";

export const getProjects = async (_req: Request, res: Response) => {
  const projects = await getAllProjects();
  sendSuccess(res, projects);
};

export const getProject = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const project = await getProjectById(req.params.id);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  sendSuccess(res, project);
};

export const createProject = async (
  req: Request<object, unknown, CreateProjectInput>,
  res: Response,
) => {
  const project = await createProjectService(req.body.value);
  sendSuccess(res, project, "Project created", StatusCodes.CREATED);
};
