import { runPlainPrompt } from "../lib/llm";
import { FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT } from "../lib/prompt";
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

export async function generateTitle(summary: string) {
  const title = await runPlainPrompt(FRAGMENT_TITLE_PROMPT, summary);

  return title.trim().replace(/["']/g, "").slice(0, 40) || "Untitled";
}

export async function generateResponse(summary: string) {
  const response = await runPlainPrompt(RESPONSE_PROMPT, summary);

  return response.trim();
}
