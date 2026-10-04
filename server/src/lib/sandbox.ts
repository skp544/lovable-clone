import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import {
  COMMAND_MAX_BUFFER_BYTES,
  COMMAND_TIMEOUT_MS,
  MAX_TRACKED_BYTE_SIZE,
  sandboxRoot,
  SKIP_DIRS,
  SKIP_FILES,
} from "../config/constants";
import { BadRequestError } from "../errors/app.error";

export type FileCollection = Record<string, string>;

function assertPathInsideRoot(
  root: string,
  targetPath: string,
  errorMessage = "Invalid path",
): void {
  const relative = path.relative(root, targetPath);
  // Match ".." as a whole segment so names like "..foo" are still allowed.
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new BadRequestError(errorMessage);
  }
}

// A sandbox must be a folder inside sandboxRoot, never sandboxRoot itself
// (an empty or "." id would otherwise expose every sandbox).
function assertSandboxPathInsideRoot(sandboxPath: string): void {
  assertPathInsideRoot(sandboxRoot, sandboxPath, "Invalid sandbox ID");
  if (path.relative(sandboxRoot, sandboxPath) === "") {
    throw new BadRequestError("Invalid sandbox ID");
  }
}

export async function ensureSandbox(sandboxId: string): Promise<string> {
  const sandboxPath = path.resolve(sandboxRoot, sandboxId);
  assertSandboxPathInsideRoot(sandboxPath);

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

  // Validate every path before writing so a bad entry can't leave a
  // half-written sandbox behind.
  const cleaned = Object.entries(files).map(([filePath, content]) => {
    const cleanPath = sanitizeRelativePath(filePath);
    if (!cleanPath) {
      throw new BadRequestError(`Invalid file path: ${filePath}`);
    }
    return { fullPath: path.join(sandboxPath, cleanPath), content };
  });

  for (const { fullPath, content } of cleaned) {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  return sandboxPath;
}

const execAsync = promisify(exec);

// Never throws: the agent needs to see failures as text so it can react.
export async function runSandboxCommand(
  sandboxId: string,
  command: string,
): Promise<string> {
  try {
    const cwd = await ensureSandbox(sandboxId);
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
    });

    return stdout.trim() || stderr.trim() || "no output";
  } catch (err) {
    const { message, killed, stdout, stderr } = err as Error & {
      killed?: boolean;
      stdout?: string;
      stderr?: string;
    };

    // exec's own message already starts with "Command failed: ...".
    const reason = killed
      ? `${message} (timed out after ${COMMAND_TIMEOUT_MS / 1000}s)`
      : message;

    return [
      reason.startsWith("Command failed")
        ? reason
        : `Command failed: ${reason}`,
      `stdout:\n${stdout?.trim() || "(empty)"}`,
      `stderr:\n${stderr?.trim() || "(empty)"}`,
    ].join("\n\n");
  }
}

export type SandboxFileContent = { path: string; content: string };

export async function readSandboxFiles(
  sandboxId: string,
  filePaths: string[],
): Promise<SandboxFileContent[]> {
  const root = path.join(sandboxRoot, sandboxId);
  assertSandboxPathInsideRoot(root);

  const contents: SandboxFileContent[] = [];

  for (const filePath of filePaths) {
    const cleanPath = sanitizeRelativePath(filePath);
    if (!cleanPath) {
      throw new BadRequestError(`Invalid file path: ${filePath}`);
    }

    const fullPath = path.join(root, cleanPath);
    assertPathInsideRoot(root, fullPath, "Invalid file path");

    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isFile() || stat.size > MAX_TRACKED_BYTE_SIZE) continue;

      contents.push({
        path: cleanPath,
        content: await fs.readFile(fullPath, "utf-8"),
      });
    } catch (err) {
      // A missing file is expected for caller-supplied paths; skip quietly.
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`Error reading file: ${fullPath}`, err);
      }
    }
  }

  return contents;
}

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
