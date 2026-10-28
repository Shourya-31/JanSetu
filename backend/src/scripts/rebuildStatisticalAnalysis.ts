import prisma from '../config/prisma';
import { enqueueAllStatisticalAnalysisSummaries, refreshQueuedStatisticalAnalysisSummaries } from '../services/statisticalAnalysisRefresh';

async function main() {
  const queued = await enqueueAllStatisticalAnalysisSummaries();
  const logger: Parameters<typeof refreshQueuedStatisticalAnalysisSummaries>[0] = {
    error: (context, _message) => console.error(`Statistical analysis refresh failed for block ${String(context.blockId)}.`),
    warn: () => console.warn('Statistical analysis refresh warning.'),
    info: () => undefined
  };
  let remaining = await prisma.statisticalAnalysisRefreshQueue.count();
  while (remaining > 0) {
    await refreshQueuedStatisticalAnalysisSummaries(logger);
    const updatedRemaining = await prisma.statisticalAnalysisRefreshQueue.count();
    if (updatedRemaining >= remaining) {
      throw new Error(`Statistical analysis rebuild left ${updatedRemaining} block(s) pending.`);
    }
    remaining = updatedRemaining;
  }
  console.log(`Statistical analysis rebuild complete. Blocks queued: ${queued}.`);
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error(`Statistical analysis rebuild failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
