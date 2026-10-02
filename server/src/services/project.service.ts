import { findAllProjects } from "../repositories/project.repository";

export const getAllProjects = () => {
  return findAllProjects();
};
