import { generateSlug } from "random-word-slugs";
import { LOCAL_USER_ID } from "../config/constants";
import {
  createProjectWithMessage,
  findAllProjects,
  findProjectById,
} from "../repositories/project.repository";

export const getAllProjects = () => {
  return findAllProjects();
};

export const getProjectById = (id: string) => {
  return findProjectById(id);
};

export const createProject = (value: string) => {
  return createProjectWithMessage({
    name: generateSlug(3, { format: "kebab" }),
    userId: LOCAL_USER_ID,
    content: value,
  });
};
