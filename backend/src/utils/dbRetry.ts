/**
 * Database Resilience & Retry Helper with Exponential Backoff
 * Prevents transaction failure and data loss from transient database locks,
 * socket resets, or serialization errors.
 */

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = Number(process.env.DB_RETRY_COUNT || 2),
  delayMs = Number(process.env.DB_RETRY_DELAY_MS || 75)
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isTransientError =
        err.code === 'P2034' || // Prisma transaction conflict
        err.code === '40P01' || // PostgreSQL Deadlock
        err.code === '40001' || // Serialization Failure
        err.code === '57P01' || // Connection terminated
        err.message?.includes('Transaction failed') ||
        err.message?.includes('connection timeout');

      if (!isTransientError || attempt >= retries) {
        throw err;
      }

      console.warn(JSON.stringify({
        operation: 'database.retry',
        attempt,
        maxAttempts: retries,
        delayMs: delayMs * Math.pow(2, attempt - 1),
        errorCode: err.code || 'UNKNOWN'
      }));
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Database operation failed after maximum retries.');
}
