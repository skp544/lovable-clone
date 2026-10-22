export type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type TodoPhase = "design" | "build" | "review" | "cancelled";

const STATUSES: TodoStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

const PHASES: TodoPhase[] = ["design", "build", "review", "cancelled"];

const PHASE_INDEX: Record<TodoPhase, number> = {
  design: 0,
  build: 1,
  review: 2,
  cancelled: 3,
};

const STATUS_TRANSITIONS: Record<TodoStatus, TodoStatus[]> = {
  pending: ["in_progress"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export interface TodoItem {
  content: string;
  status: TodoStatus;
  phase: TodoPhase;
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

export function canTransitionStatus(from: TodoStatus, to: TodoStatus): boolean {
  if (from === to) return true;
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionStatus(from: TodoStatus, to: TodoStatus): TodoStatus {
  if (canTransitionStatus(from, to)) {
    return to;
  }

  throw new Error(`Cannot transition from ${from} to ${to}`);
}

function applyStatus(todo: TodoItem, to: TodoStatus): TodoItem {
  const status = transitionStatus(todo.status, to);

  return {
    ...todo,
    status,
  };
}

const TOOL_NAME_TO_PHASE: Record<string, TodoPhase> = {
  design_app: "design",
  build_ui: "build",
  review_app: "review",
  cancelled: "cancelled",
};

export function phaseForToolName(toolName: string): TodoPhase | null {
  if (toolName in TOOL_NAME_TO_PHASE) {
    return TOOL_NAME_TO_PHASE[toolName];
  }

  return null;
}

export function updateTodoStatusForSubAgent(
  todos: TodoItem[],
  toolName: string,
  stage: "start" | "complete" | "cancel",
): TodoItem[] {
  const pipelinePhase = phaseForToolName(toolName);

  if (!pipelinePhase) return todos;

  const currentPhaseIndex = PHASE_INDEX[pipelinePhase];

  let markedCurrent = false;

  return todos.map((todo) => {
    const todoIndex = PHASE_INDEX[todo.phase];

    if (todoIndex < currentPhaseIndex) {
      return applyStatus(todo, "completed");
    }

    if (todoIndex > currentPhaseIndex) {
      if (todo.status === "in_progress") {
        return applyStatus(todo, "pending");
      }
      return todo;
    }

    if (stage === "complete") {
      return applyStatus(todo, "completed");
    }

    if (!markedCurrent && todo.status !== "completed") {
      markedCurrent = true;
      return applyStatus(todo, "in_progress");
    }

    if (todo.status === "in_progress") {
      return applyStatus(todo, "pending");
    }

    return todo;
  });
}

export const inferToDoPhase = (content: string): TodoPhase => {
  const text = content.toLowerCase();

  if (/\b(review|polish|summary|export|verify|preview)/.test(text)) {
    return "review";
  }
  if (/\b(design|visual|ux|architect|reason|wireframe)/.test(text)) {
    return "design";
  }
  return "build";
};

export const parsePhase = (value: unknown, content: string): TodoPhase => {
  if (typeof value === "string" && PHASES.includes(value as TodoPhase)) {
    return value as TodoPhase;
  }
  return inferToDoPhase(content); // guess the phase
};

export const normalizeTodo = (value: unknown): TodoItem | null => {
  if (!value || typeof value !== "object") return null;

  const { content, status, phase } = value as {
    content?: unknown;
    status?: unknown;
    phase?: unknown;
  };
  if (typeof content !== "string" || !content.trim()) return null;

  const parsedPhase = parsePhase(phase, content);
  return {
    content: content.trim(),
    status: STATUSES.includes(status as TodoStatus)
      ? (status as TodoStatus)
      : "pending",
    phase: parsedPhase,
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

export function serializedPlanMessage(
  todos: TodoItem[],
  activity?: PlanActivity | null,
): string {
  const payload: PlanMessage = {
    kind: PLAN_KIND,
    todos,
  };

  if (activity?.agent && activity.details) payload.activity = activity;

  return JSON.stringify(payload);
}

export function defaultPlan(prompt: string): TodoItem[] {
  const brief = prompt.trim().slice(0, 80);

  const steps: Pick<TodoItem, "content" | "phase">[] = [
    {
      phase: "design",
      content: `Reason about the UX and layout for the request: "${brief}"`,
    },
    {
      phase: "build",
      content:
        "Create the basic boilerplate structure with src/App.tsx and a default export",
    },
    {
      phase: "build",
      content: "Add reusable components under src/components",
    },
    {
      phase: "build",
      content:
        "Compose the components in App.tsx and style them with Tailwind, responsive from mobile up",
    },
    {
      phase: "build",
      content: "Add state, interactions and realistic sample data",
    },
    {
      phase: "review",
      content: "Verify the app renders in preview, then polish and summarize",
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    status: index === 0 ? "in_progress" : "pending",
  }));
}
