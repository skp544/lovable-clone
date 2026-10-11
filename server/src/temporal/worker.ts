import { NativeConnection, Worker } from "@temporalio/worker";
import {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_TASK_QUEUE,
} from "../config/env";

const MAX_CONNECT_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries with exponential backoff (1s, 2s, 4s, 8s between 5 attempts).
async function connect() {
  for (let attempt = 1; ; attempt++) {
    try {
      const connection = await NativeConnection.connect({
        address: TEMPORAL_ADDRESS,
      });
      console.log(`Connected to Temporal at ${TEMPORAL_ADDRESS}`);
      return connection;
    } catch (err) {
      if (attempt >= MAX_CONNECT_ATTEMPTS) throw err;

      const delay = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
      console.warn(
        `Temporal connection attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed, retrying in ${delay}ms`,
      );
      await sleep(delay);
    }
  }
}

async function main() {
  const connection = await connect();

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    taskQueue: TEMPORAL_TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
    activities: {},
  });

  console.log(`Temporal worker running on task queue "${TEMPORAL_TASK_QUEUE}"`);
  await worker.run();
}

main().catch((err) => {
  console.error("Temporal worker failed", err);
  process.exit(1);
});
