import { prisma } from "../lib/prisma";

export const findAllProjects = () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
};
