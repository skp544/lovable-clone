import { NativeConnection, Worker } from "@temporalio/worker";
import {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_TASK_QUEUE,
} from "../config/env";
import { retryWithBackoff } from "../utils/retry";
import * as activities from "./activities";

async function connect() {
  const connection = await retryWithBackoff(
    () => NativeConnection.connect({ address: TEMPORAL_ADDRESS }),
    { label: "Temporal connection" },
  );
  console.log(`Connected to Temporal at ${TEMPORAL_ADDRESS}`);
  return connection;
}

async function main() {
  const connection = await connect();

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    taskQueue: TEMPORAL_TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
    activities,
  });

  console.log(`Temporal worker running on task queue "${TEMPORAL_TASK_QUEUE}"`);
  await worker.run();
}

main().catch((err) => {
  console.error("Temporal worker failed", err);
  process.exit(1);
});
