import path from "path";

export const sandboxRoot = path.resolve(__dirname, "../../../data/sandbox");

export const LOCAL_USER_ID = "local-user-id";

export const COMMAND_TIMEOUT_MS = 60 * 1000;
export const COMMAND_MAX_BUFFER_BYTES = 1024 * 1024;
export const MAX_TRACKED_BYTE_SIZE = 1024 * 1024 * 10;

export const SKIP_DIRS = new Set([
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

export const SKIP_FILES = new Set([
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
