import type { Request, Response } from "express";
import { getAllProjects } from "../services/project.service";

export const getProjects = async (_req: Request, res: Response) => {
  const projects = await getAllProjects();
  res.json(projects);
};
