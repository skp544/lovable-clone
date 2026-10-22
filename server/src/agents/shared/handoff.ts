import { AgentChatMessage } from "../types";

export const appendAgentMessage = (
  thread: AgentChatMessage[],
  agentLabel: string,
  body: string,
): AgentChatMessage[] => [
  ...thread,
  { role: "assistant", content: `[${agentLabel}]\n${body.trim()}` },
];
