import { proxyActivities } from "@temporalio/workflow";
// Type-only: the workflow sandbox must not bundle the activity implementations.
import type * as activities from "./activities";
import {
  createAgentBasePayload,
  emptyPipelineState,
  WorkflowAgentMessage,
  WorkflowPipelineState,
} from "./workflow-types";

const {
  createSandbox,
  loadMessages,
  runPlannerActivity,
  saveResult,
  generateResponse,
  generateTitle,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "10 minutes",
  retry: {
    maximumAttempts: 3,
  },
});

export async function pingWorkflow(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export interface CodeAgentInput {
  projectId: string;
  prompt: string;
}

export async function codeAgentWorkflow(input: CodeAgentInput) {
  const { projectId } = input;

  const sandboxId = await createSandbox(projectId);

  const previousMessages = await loadMessages(input.projectId);

  const thread =
    previousMessages.length > 0
      ? [...previousMessages]
      : [
          {
            role: "user",
            content: input.prompt,
          },
        ];

  let state: WorkflowPipelineState = emptyPipelineState(
    thread as WorkflowAgentMessage[],
  );

  // running the planner agent activity

  state = await runPlannerActivity(createAgentBasePayload(input, state));

  const sampleSummary = "A custom react app to create todo list app"; // once a coding agent is completed
  const title = await generateTitle(sampleSummary);

  const response = await generateResponse(sampleSummary);

  // Dummy values until the agent actually generates an app.
  await saveResult({
    projectId,
    content: response,
    title: title,
    files: { "src/App.tsx": "export default function App() { return null; }" },
    sandboxUrl: `/api/preview/${projectId}`,
    isError: false,
  });

  return {
    files: null,
  };
}
