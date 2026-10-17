export type TodoStatus = "pending" | "in_progress" | "completed";

export interface TodoItem {
  content: string;
  status: TodoStatus;
}

export const PLAN_KIND = "plan";

export interface PlanActivity {
  agent: string;
  details: string;
}

export interface PlanMessage {
  todos: TodoItem[];
  kind: typeof PLAN_KIND;
  activity?: PlanActivity;
}

const STATUSES: TodoStatus[] = ["pending", "in_progress", "completed"];

export const normalizeTodo = (value: unknown): TodoItem | null => {
  if (!value || typeof value !== "object") return null;

  const { content, status } = value as { content?: unknown; status?: unknown };
  if (typeof content !== "string" || !content.trim()) return null;

  return {
    content: content.trim(),
    status: STATUSES.includes(status as TodoStatus)
      ? (status as TodoStatus)
      : "pending",
  };
};

export const parseTodos = (value: unknown): TodoItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeTodo)
    .filter((todo): todo is TodoItem => Boolean(todo));
};

export const formatPlanForAgent = (todos: TodoItem[]): string => {
  const lines = todos.map(
    (todo, index) => `${index + 1}. [${todo.status}] ${todo.content}`,
  );

  return `Current plan:\n${lines.join("\n")}\nFollow this plan in order. Update it with write_todo as you complete steps.`;
};

export const parsePlanMessage = (content: string): TodoItem[] | null => {
  let parsed: Partial<PlanMessage> | null;
  try {
    parsed = JSON.parse(content) as Partial<PlanMessage>;
  } catch {
    // Most stored message content is plain text, not JSON.
    return null;
  }

  if (parsed?.kind !== PLAN_KIND) return null;

  const todos = parseTodos(parsed.todos);
  return todos.length > 0 ? todos : null;
};
