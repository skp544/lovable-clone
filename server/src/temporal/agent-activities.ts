import { cancellationSignal, heartbeat } from "@temporalio/activity";
import { logger } from "../lib/logger";
import { AgentBasePayload, WorkflowPipelineState } from "./workflow-types";
import { hasLlm } from "../lib/model";
import { runPlanner } from "../agents/planner/run";
import { todoListMiddleware } from "langchain";
import {
  PlanActivity,
  serializedPlanMessage,
  TodoItem,
  updateTodoStatusForSubAgent,
} from "../lib/plan";
import { prisma } from "../lib/prisma";
import { savePlanMessage } from "../repositories/message.repository";

const HEARTBEAT_INTERVAL_MS = 5_000;

export const withHeartbeat = async <T>(
  run: (beat: () => void) => Promise<T>,
): Promise<T> => {
  const beat = () => {
    try {
      heartbeat();
    } catch (err) {
      logger.warn("Activity heartbeat failed", err);
    }
  };

  const ticker = setInterval(beat, HEARTBEAT_INTERVAL_MS);
  try {
    return await run(beat);
  } finally {
    clearInterval(ticker);
  }
};

async function syncPlan(
  projectId: string,
  state: WorkflowPipelineState,
  todos: TodoItem[],
  activity?: PlanActivity | null,
) {
  const saved = await savePlanMessage({
    projectId,
    messageId: state.planMessageId || "",
    todos,
    activity,
  });

  state.planMessageId = saved.id;
}

export const runPlannerActivity = async (
  input: AgentBasePayload,
): Promise<WorkflowPipelineState> => {
  if (!hasLlm()) {
    return { ...input.state };
  }

  const state = { ...input.state };

  return withHeartbeat(async (beat) => {
    const started = Date.now();

    const state = { ...input.state };

    const result = await runPlanner({
      // actual agent logic
      prompt: input.prompt,
      thread: state.thread,
      todos: state.todos,
      signal: cancellationSignal(),
      onProgress: beat,
      onTodos: async (todos, activity) => {
        state.todos = todos;
        await syncPlan(input.projectId, state, todos, activity);
        beat();
      },
    });

    state.thread = result.thread;

    state.todos = updateTodoStatusForSubAgent(
      state.todos,
      "design_app",
      "start",
    ); // move the design related todos from pending to in_progress

    // state.todos = result.todos;

    await syncPlan(input.projectId, state, state.todos, {
      agent: "planner",
      details: "Handoff to designer",
    });

    return state;
  });
};
