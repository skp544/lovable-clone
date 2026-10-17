import { Role } from "../agents/types";
import { TodoItem } from "../lib/plan";

export interface WorkflowAgentMessage {
  role: Role;
  content: string;
}

export interface WorkflowPipelineState {
  todos: TodoItem[];
  thread: WorkflowAgentMessage[];
  files: Record<string, string>;
  design: string;
  builderNotes: string;
  review: string;
  summary: string;
  planMessageId?: string;
}

export function emptyPipelineState(
  thread: WorkflowAgentMessage[],
): WorkflowPipelineState {
  return {
    todos: [],
    thread,
    files: {},
    design: "",
    builderNotes: "",
    review: "",
    summary: "",
  };
}
