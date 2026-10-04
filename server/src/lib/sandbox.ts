import fs from "fs/promises";
import path from "path";
import { sandboxRoot } from "../config/constants";
import { BadRequestError } from "../errors/app.error";

export type FileCollection = Record<string, string>;

function assertPathInsideRoot(
  root: string,
  targetPath: string,
  errorMessage = "Invalid path",
): void {
  const relative = path.relative(root, targetPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(errorMessage);
  }
}

function assertSandboxPathInsideRoot(sandboxPath: string): void {
  assertPathInsideRoot(sandboxRoot, sandboxPath, "Invalid sandbox ID");
}

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

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  ".vscode",
  ".idea",
  "dist",
  "build",
  "out",
  "target",
  "node",
]);

const SKIP_FILES = new Set([
  ".DS_Store",
  "Thumbs.db",
  "desktop.ini",
  "npm-debug.log",
  "yarn-error.log",
  "pnpm-debug.log",
  ".env",
  ".env.local",
  ".env.development",
  ".env.test",
  ".env.production",
  ".env.*.local",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

const MAX_TRACKED_BYTE_SIZE = 1024 * 1024 * 10;

export async function readSandboxTree(
  sandboxId: string,
): Promise<FileCollection> {
  const root = path.join(sandboxRoot, sandboxId);
  assertSandboxPathInsideRoot(root);

  const files: FileCollection = {};

  const walk = async (current: string) => {
    let entries = [];

    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (err) {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          await walk(fullPath);
        }
        continue;
      }

      if (!entry.isFile() || SKIP_FILES.has(entry.name)) continue;

      try {
        const stat = await fs.stat(fullPath); // Get file stats to check size
        if (stat.size > MAX_TRACKED_BYTE_SIZE) {
          continue; // Skip files that exceed the size limit
        }

        files[path.relative(root, fullPath)] = await fs.readFile(
          fullPath,
          "utf-8",
        );
      } catch (err) {
        console.error(`Error reading file: ${fullPath}`, err);
      }
    }
  };

  await walk(root);

  return files;
}
