import { logger } from "../lib/logger";

interface RetryOptions {
  label: string;
  maxAttempts?: number;
  initialDelayMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Delay doubles after each failure (1s, 2s, 4s, 8s with the defaults); the
// last error is rethrown once attempts run out.
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  { label, maxAttempts = 5, initialDelayMs = 1000 }: RetryOptions,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxAttempts) throw err;

      const delay = initialDelayMs * 2 ** (attempt - 1);
      logger.warn(
        `${label} attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`,
      );
      await sleep(delay);
    }
  }
}
