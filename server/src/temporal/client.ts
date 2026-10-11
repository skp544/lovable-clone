import { Client, Connection } from "@temporalio/client";
import {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_TASK_QUEUE,
} from "../config/env";
import { retryWithBackoff } from "../utils/retry";
import {
  codeAgentWorkflow,
  pingWorkflow,
  type CodeAgentInput,
} from "./workflows";
import { logger } from "../lib/logger";

let clientPromise: Promise<Client> | undefined;

// Lazily creates one shared client; a failed attempt is not cached.
export function connect(): Promise<Client> {
  clientPromise ??= retryWithBackoff(
    () => Connection.connect({ address: TEMPORAL_ADDRESS }),
    { label: "Temporal client connection" },
  )
    .then((connection) => {
      logger.info(`Temporal client connected to ${TEMPORAL_ADDRESS}`);
      return new Client({ connection, namespace: TEMPORAL_NAMESPACE });
    })
    .catch((err) => {
      clientPromise = undefined;
      throw err;
    });

  return clientPromise;
}

export async function startPing(name: string) {
  const client = await connect();

  return client.workflow.start(pingWorkflow, {
    taskQueue: TEMPORAL_TASK_QUEUE,
    workflowId: `ping-${Date.now()}`,
    args: [name],
  });
}

export async function startCodeAgent(input: CodeAgentInput) {
  const client = await connect();

  const handle = await client.workflow.start(codeAgentWorkflow, {
    taskQueue: TEMPORAL_TASK_QUEUE,
    workflowId: `code-agent-${input.projectId}-${Date.now()}`,
    args: [input],
  });

  return handle.result();
}
