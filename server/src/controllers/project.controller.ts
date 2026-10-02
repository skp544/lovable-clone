import type { Request, Response } from "express";
import { NotFoundError } from "../errors/app.error";
import { getAllProjects, getProjectById } from "../services/project.service";
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
