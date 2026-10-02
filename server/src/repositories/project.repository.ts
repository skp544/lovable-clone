import { MessageRole, MessageType } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const findAllProjects = () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const findProjectById = (id: string) => {
  return prisma.project.findUnique({
    where: { id },
  });
};

interface CreateProjectData {
  name: string;
  userId: string;
  content: string;
}

export const createProjectWithMessage = ({
  name,
  userId,
  content,
}: CreateProjectData) => {
  return prisma.project.create({
    data: {
      name,
      userId,
      messages: {
        create: {
          content,
          role: MessageRole.USER,
          type: MessageType.RESULT,
        },
      },
    },
    include: { messages: true },
  });
};
