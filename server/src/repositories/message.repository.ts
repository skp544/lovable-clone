import type { AgentChatMessage } from "../agents/types";
import { LOCAL_USER_ID } from "../config/constants";
import { MessageRole, MessageType } from "../generated/prisma/client";
import {
  formatPlanForAgent,
  parsePlanMessage,
  PlanActivity,
  serializedPlanMessage,
  TodoItem,
} from "../lib/plan";
import { prisma } from "../lib/prisma";
import type { FileCollection } from "../lib/sandbox";

function formatLoadedDbContent(content: string): string {
  const todos = parsePlanMessage(content); // take message from db and parse them todos

  return todos ? formatPlanForAgent(todos) : content;
}

export const findMessagesByProjectId = (projectId: string) => {
  return prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: { fragments: true },
  });
};

export const loadMessages = async (
  projectId: string,
): Promise<AgentChatMessage[]> => {
  const messages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetched newest-first to get the latest 5; flip back to chronological order.
  return messages.reverse().map((message) => ({
    role: message.role === MessageRole.ASSISTANT ? "assistant" : "user",
    content: formatLoadedDbContent(message.content),
  }));
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

export async function savePlanMessage(input: {
  projectId: string;
  messageId: string;
  todos: TodoItem[];
  activity?: PlanActivity | null;
}) {
  const content = serializedPlanMessage(input.todos, input.activity);

  if (input.messageId) {
    return prisma.message.update({
      where: {
        id: input.messageId,
      },
      data: {
        content,
      },
    });
  }

  return prisma.message.create({
    data: {
      projectId: input.projectId,
      content,
      role: "ASSISTANT",
      type: "RESULT",
    },
  });
}
