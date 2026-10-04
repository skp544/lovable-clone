import fs from "fs/promises";
import path from "path";
import { sandboxRoot } from "../config/constants";
import { BadRequestError } from "../errors/app.error";

export type FileCollection = Record<string, string>;

export async function ensureSandbox(sandboxId: string): Promise<string> {
  const sandboxPath = path.resolve(sandboxRoot, sandboxId);

  // Reject ids like "../x" or absolute paths that resolve outside sandboxRoot
  // (or to sandboxRoot itself).
  const relative = path.relative(sandboxRoot, sandboxPath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new BadRequestError(`Invalid sandbox id: ${sandboxId}`);
  }

  await fs.mkdir(sandboxPath, { recursive: true });
  return sandboxPath;
}

// Strips leading slashes and drops ".." (and "." / empty) segments so the
// resulting relative path can never climb out of the sandbox.
function sanitizeRelativePath(filePath: string): string {
  return filePath
    .replace(/^[/\\]+/, "")
    .split(/[/\\]+/)
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/");
}

export async function writeSandboxFiles(
  sandboxId: string,
  files: FileCollection,
): Promise<string> {
  const sandboxPath = await ensureSandbox(sandboxId);

  for (const [filePath, content] of Object.entries(files)) {
    const cleanPath = sanitizeRelativePath(filePath);
    if (!cleanPath) {
      throw new BadRequestError(`Invalid file path: ${filePath}`);
    }

    const fullPath = path.join(sandboxPath, cleanPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  return sandboxPath;
}
