import { FileCollection, readSandboxTree } from "../lib/sandbox";
import { saveResult } from "../repositories/message.repository";

export { saveResult };

export async function createSandbox(projectId: string) {
  return projectId;
}

export async function loadSandboxFiles(
  sandboxId: string,
): Promise<FileCollection> {
  return readSandboxTree(sandboxId);
}
