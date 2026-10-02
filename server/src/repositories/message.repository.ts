import { LOCAL_USER_ID } from "../config/constants";
import { prisma } from "../lib/prisma";

export const findMessagesByProjectId = (projectId: string) => {
  return prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: { fragments: true },
  });
};
