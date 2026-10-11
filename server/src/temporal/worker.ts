import { NativeConnection, Worker } from "@temporalio/worker";
import { TEMPORAL_ADDRESS, TEMPORAL_TASK_QUEUE } from "../config/env";

async function connect() {
  const connection = await NativeConnection.connect({
    address: TEMPORAL_ADDRESS,
  });
  console.log(`Connected to Temporal at ${TEMPORAL_ADDRESS}`);
  return connection;
}

async function main() {
  const connection = await connect();

  const worker = await Worker.create({
    connection,
    taskQueue: TEMPORAL_TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
  });

  console.log(`Temporal worker running on task queue "${TEMPORAL_TASK_QUEUE}"`);
  await worker.run();
}

main().catch((err) => {
  console.error("Temporal worker failed", err);
  process.exit(1);
});
