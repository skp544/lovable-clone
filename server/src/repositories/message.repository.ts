import { LOCAL_USER_ID } from "../config/constants";
import { MessageRole, MessageType } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type { FileCollection } from "../lib/sandbox";

export const findMessagesByProjectId = (projectId: string) => {
  return prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: { fragments: true },
  });
};

interface SaveResultData {
  projectId: string;
  content: string;
  title: string;
  files: FileCollection;
  sandboxUrl: string;
  isError?: boolean;
}

export const saveResult = ({
  projectId,
  content,
  title,
  files,
  sandboxUrl,
  isError,
}: SaveResultData) => {
  return prisma.message.create({
    data: {
      projectId,
      content,
      role: MessageRole.ASSISTANT,
      type: isError ? MessageType.ERROR : MessageType.RESULT,
      // Errors carry no fragment.
      ...(!isError && {
        fragments: { create: { title, sandboxUrl, files } },
      }),
    },
    include: { fragments: true },
  });
};
