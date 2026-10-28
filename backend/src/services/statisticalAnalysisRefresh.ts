import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { calculateStatisticalBlockMetrics } from '../utils/statisticalAnalysis';

const REFRESH_INTERVAL_MS = 5_000;
const REFRESH_BATCH_SIZE = 4;

type RefreshLogger = {
  error: (context: Record<string, unknown>, message: string) => void;
  warn: (context: Record<string, unknown>, message: string) => void;
  info: (context: Record<string, unknown>, message: string) => void;
};

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let refreshInProgress: Promise<void> | null = null;

export async function enqueueMissingStatisticalAnalysisSummaries(): Promise<number> {
  const blocks = await prisma.block.findMany({
    where: { statisticalAnalysisSummary: null },
    select: { id: true }
  });
  if (!blocks.length) return 0;
  await prisma.statisticalAnalysisRefreshQueue.createMany({
    data: blocks.map((block) => ({ blockId: block.id })),
    skipDuplicates: true
  });
  return blocks.length;
}

export async function enqueueAllStatisticalAnalysisSummaries(): Promise<number> {
  const blocks = await prisma.block.findMany({ select: { id: true } });
  if (!blocks.length) return 0;
  await prisma.$transaction(async (transaction) => {
    for (const block of blocks) {
      await transaction.statisticalAnalysisRefreshQueue.upsert({
        where: { blockId: block.id },
        create: { blockId: block.id },
        update: { queuedAt: new Date(), attempts: 0, lastError: null }
      });
      await transaction.statisticalAnalysisSummary.updateMany({
        where: { blockId: block.id },
        data: { isStale: true }
      });
    }
  });
  return blocks.length;
}

export async function refreshQueuedStatisticalAnalysisSummaries(logger?: RefreshLogger): Promise<void> {
  if (refreshInProgress) return refreshInProgress;

  refreshInProgress = (async () => {
    const queuedBlocks = await prisma.statisticalAnalysisRefreshQueue.findMany({
      orderBy: { queuedAt: 'asc' },
      take: REFRESH_BATCH_SIZE,
      select: { blockId: true, queuedAt: true }
    });

    for (const queued of queuedBlocks) {
      try {
        await prisma.$transaction(async (transaction) => {
          await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${queued.blockId}::bigint)`;
          const block = await transaction.block.findUnique({
            where: { id: queued.blockId },
            select: {
              id: true,
              gramPanchayats: {
                select: {
                  villages: {
                    select: {
                      id: true,
                      affectedStatus: true,
                      villageSurvey: { select: { isCompleted: true } },
                      households: { select: { isCompleted: true } }
                    }
                  }
                }
              }
            }
          });

          if (!block) {
            await transaction.statisticalAnalysisRefreshQueue.deleteMany({
              where: { blockId: queued.blockId }
            });
            return;
          }

          const villages = block.gramPanchayats.flatMap((panchayat) => panchayat.villages);
          const metrics = calculateStatisticalBlockMetrics(villages);
          const refreshedAt = new Date();
          await transaction.statisticalAnalysisSummary.upsert({
            where: { blockId: block.id },
            create: {
              blockId: block.id,
              ...metrics,
              isStale: false,
              refreshedAt,
              sourceUpdatedAt: queued.queuedAt
            },
            update: {
              ...metrics,
              isStale: false,
              refreshedAt,
              sourceUpdatedAt: queued.queuedAt
            }
          });

          await transaction.statisticalAnalysisRefreshQueue.deleteMany({
            where: { blockId: block.id, queuedAt: queued.queuedAt }
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown refresh error';
        logger?.error({ blockId: queued.blockId, error: message }, 'Statistical analysis summary refresh failed');
        await prisma.statisticalAnalysisRefreshQueue.updateMany({
          where: { blockId: queued.blockId },
          data: { attempts: { increment: 1 }, lastError: message.slice(0, 1000) }
        });
      }
    }
  })().finally(() => {
    refreshInProgress = null;
  });

  return refreshInProgress;
}

export function startStatisticalAnalysisRefreshWorker(logger: RefreshLogger): () => void {
  if (refreshTimer) return () => stopStatisticalAnalysisRefreshWorker();

  const poll = async () => {
    try {
      const missing = await enqueueMissingStatisticalAnalysisSummaries();
      if (missing > 0) logger.info({ count: missing }, 'Queued missing statistical analysis summaries');
      await refreshQueuedStatisticalAnalysisSummaries(logger);
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown worker error' },
        'Statistical analysis refresh worker could not process its queue'
      );
    }
  };

  void poll();
  refreshTimer = setInterval(() => void poll(), REFRESH_INTERVAL_MS);
  refreshTimer.unref();
  return () => stopStatisticalAnalysisRefreshWorker();
}

export function stopStatisticalAnalysisRefreshWorker(): void {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}
