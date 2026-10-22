import { isArray, parseEnv } from "node:util";

export function messageText(content: unknown): string {
  if (typeof content === "string") return content;

  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;

      if (part && typeof part === "object" && "text" in part) return part.text;

      return "";
    })
    .join("\n")
    .trim();
}

export function lastAssistantText(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index] as { type?: string; content: unknown };

    const isAssistant = message?.type === "ai";

    if (!isAssistant) continue;

    const text = messageText(message.content);

    if (text) return text;
  }

  return "";
}

type PlannerStreamState = {
  messages: unknown[];
};

function streamStateFromChunk(chunk: unknown): PlannerStreamState {
  if (!chunk || typeof chunk !== "object") return { messages: [] };

  const record = chunk as Record<string, unknown>;

  if (Array.isArray(record.messages)) {
    return { messages: record.messages };
  }

  return { messages: [] };
}

export async function streamAgentValues(
  stream: AsyncIterable<unknown>,
  onProgress?: () => void,
): Promise<unknown[]> {
  let chunkIndex = -1;

  let lastMessages: unknown[] = [];

  for await (const chunk of stream) {
    chunkIndex += 1;

    onProgress?.(); // send the heartbeat to temporal activity

    const { messages } = streamStateFromChunk(chunk);

    lastMessages = messages;
  }

  return lastMessages;
}
