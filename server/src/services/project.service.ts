import {
  findAllProjects,
  findProjectById,
} from "../repositories/project.repository";

export const getAllProjects = () => {
  return findAllProjects();
};

export const getProjectById = (id: string) => {
  return findProjectById(id);
};
