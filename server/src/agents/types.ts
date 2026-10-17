import { TodoItem } from "../lib/plan";

export type Role = "user" | "assistant" | "system";

export interface AgentChatMessage {
  role: Role;
  content: string;
}

export interface AgentRunHooks {
  onProgress?: () => void;
  onTodos?: (
    todos: TodoItem[],
    activity?: { agent: string; detail: string } | null,
  ) => Promise<void>;
  signal?: AbortSignal;
}

export interface PlannerInput extends AgentRunHooks {
  prompt: string;
  todos: TodoItem[];
  thread: AgentChatMessage[];
}

export interface PlannerResult {
  notes: string;
  todos: TodoItem[];
  thread: AgentChatMessage[];
}

export interface DesignerInput extends AgentRunHooks {
  prompt: string;
  thread: AgentChatMessage[];
}

export interface DesignerResult {
  design: string;
  thread: AgentChatMessage[];
}
