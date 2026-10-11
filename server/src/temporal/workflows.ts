import { proxyActivities } from "@temporalio/workflow";
// Type-only: the workflow sandbox must not bundle the activity implementations.
import type * as activities from "./activities";

const { createSandbox, saveResult } = proxyActivities<typeof activities>({
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

  await createSandbox(projectId);

  // Dummy values until the agent actually generates an app.
  await saveResult({
    projectId,
    content: "Here is the dummy result",
    title: "Dummy app",
    files: { "src/App.tsx": "export default function App() { return null; }" },
    sandboxUrl: `/api/preview/${projectId}`,
    isError: false,
  });

  return {
    files: null,
  };
}
