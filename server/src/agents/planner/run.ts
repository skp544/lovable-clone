import { OPENAI_MODEL } from "../../config/env";
import { logger } from "../../lib/logger";
import { getChatModel, hasLlm } from "../../lib/model";
import { defaultPlan, parsePlannerTodos, TodoItem } from "../../lib/plan";
import { appendAgentMessage } from "../shared/handoff";
import { lastAssistantText, streamAgentValues } from "../shared/langchain";
import { PlannerInput, PlannerResult } from "../types";
import { createAgent, todoListMiddleware } from "langchain";
import { PLANNER_PROMPT } from "./prompt";

export async function runPlanner(input: PlannerInput): Promise<PlannerResult> {
  const todos: TodoItem[] = input.todos.length
    ? input.todos
    : defaultPlan(input.prompt);

  if (!hasLlm()) {
    return {
      thread: input.thread,
      todos,
      notes: "Created plan using default plan",
    };
  }

  const agent = createAgent({
    name: "planner",
    model: getChatModel(OPENAI_MODEL, true),
    tools: [],
    systemPrompt: PLANNER_PROMPT,
    version: "v1",
    signal: input.signal,
    middleware: [todoListMiddleware()],
  });

  const history = input.thread;

  const agentInput = {
    messages: history.length
      ? history
      : [
          {
            role: "user",
            content: input.prompt,
          },
        ],
  };

  const stream = await agent.stream(agentInput, {
    streamMode: "values",
    recursionLimit: 12,
  });

  const { messages: lastMessages, todos: lastTodos } = await streamAgentValues(
    stream,
    input.onProgress,
  );

  const parsedTodos = parsePlannerTodos(lastTodos);

  const notes =
    lastAssistantText(lastMessages) ||
    "[Hardcoded] Plan created for the project";

  await input.onTodos?.(parsedTodos, {
    agent: "planner",
    details: "Plan created by agent for the project",
  });

  const thread = appendAgentMessage(input.thread, "planner", notes);

  return {
    notes,
    todos: parsedTodos,
    thread,
  };
}
