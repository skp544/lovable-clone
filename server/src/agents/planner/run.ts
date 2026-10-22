import { OPENAI_MODEL } from "../../config/env";
import { logger } from "../../lib/logger";
import { getChatModel, hasLlm } from "../../lib/model";
import { defaultPlan, TodoItem } from "../../lib/plan";
import { appendAgentMessage } from "../shared/handoff";
import { PlannerInput, PlannerResult } from "../types";
import { createAgent } from "langchain";

const PLANNER_PROMPT = `
  You are the planning lead. Do no write code. In 2-4 sentences, outline how you would approach building the user's app (UX, risks, order of work). Do not markdown headings.
`;

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

  let chunkIndex = 0;

  for await (const chunk of stream) {
    chunkIndex += 1;
  }

  const notes = "Plan created for the project";

  await input.onTodos?.(todos, {
    agent: "planner",
    details: "Plan created by agent for the project",
  });

  const thread = appendAgentMessage(input.thread, "planner", notes);

  return {
    notes,
    todos,
    thread,
  };
}
