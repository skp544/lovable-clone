import { NotFoundError } from "../errors/app.error";
import { findMessagesByProjectId } from "../repositories/message.repository";
import { findProjectById } from "../repositories/project.repository";

export const getMessagesByProjectId = async (projectId: string) => {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return findMessagesByProjectId(projectId);
};
