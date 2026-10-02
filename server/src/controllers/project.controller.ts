import type { Request, Response } from "express";
import { getAllProjects, getProjectById } from "../services/project.service";
import { sendError, sendSuccess } from "../utils/response";

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
    sendError(res, "Project not found", 404);
    return;
  }

  sendSuccess(res, project);
};
