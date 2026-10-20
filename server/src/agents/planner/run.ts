import { PlannerInput, PlannerResult } from "../types";

export async function runPlanner(input: PlannerInput): Promise<PlannerResult> {
  return {
    notes: "",
    todos: input.todos,
    thread: input.thread,
  };
}
