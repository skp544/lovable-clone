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
