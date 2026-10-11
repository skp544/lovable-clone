import { Client, Connection } from "@temporalio/client";
import {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_TASK_QUEUE,
} from "../config/env";
import { retryWithBackoff } from "../utils/retry";
import { pingWorkflow } from "./workflows";

let clientPromise: Promise<Client> | undefined;

// Lazily creates one shared client; a failed attempt is not cached.
export function connect(): Promise<Client> {
  clientPromise ??= retryWithBackoff(
    () => Connection.connect({ address: TEMPORAL_ADDRESS }),
    { label: "Temporal client connection" },
  )
    .then((connection) => {
      console.log(`Temporal client connected to ${TEMPORAL_ADDRESS}`);
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
