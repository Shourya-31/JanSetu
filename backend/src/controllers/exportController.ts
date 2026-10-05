import { FastifyRequest, FastifyReply } from 'fastify';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import prisma from '../config/prisma';

const EXPORT_BATCH_SIZE = 500;
const MAX_EXPORT_ROWS = 50000;

const CSV_HEADER = [
  'Tracking ID', 'Village Name', 'House Number', 'Head Name', 'Mobile', 'Caste', 'Is BPL',
  'Total Members', 'Elders Count', 'Children Count', 'Unemployed Count', 'Income Source',
  'Missing Aadhaar', 'Missing Ayushman', 'Missing Caste Cert', 'Missing Voter ID',
  'Is Mining Worker', 'House Type', 'Has Toilet', 'Has Tap Water', 'Submitted At'
];

function csvCell(value: unknown): string {
  const rawValue = value instanceof Date ? value.toISOString() : String(value ?? '');
  const safeValue = /^[\t\r ]*[=+\-@]/.test(rawValue) ? `'${rawValue}` : rawValue;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function csvHouseholdRow(household: {
  trackingId: string;
  villageName: string;
  houseNumber: number;
  headName: string;
  mobile: string;
  caste: string;
  isBPL: string;
  totalMembers: number;
  eldersCount: number;
  childrenCount: number;
  unemployedCount: number;
  incomeSource: string;
  missingAadhaar: number;
  missingAyushman: number;
  missingCasteCert: number;
  missingVoterId: number;
  isMiningWorker: string;
  houseType: string;
  hasToilet: string;
  hasTapWater: string;
  submittedAt: Date;
}): string {
  return [
    household.trackingId, household.villageName, household.houseNumber, household.headName,
    household.mobile, household.caste, household.isBPL, household.totalMembers,
    household.eldersCount, household.childrenCount, household.unemployedCount, household.incomeSource,
    household.missingAadhaar, household.missingAyushman, household.missingCasteCert,
    household.missingVoterId, household.isMiningWorker, household.houseType, household.hasToilet,
    household.hasTapWater, household.submittedAt
  ].map(csvCell).join(',');
}

export async function exportHouseholdsCsv(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as {
    block?: string;
    panchayat?: string;
    village?: string;
    isBPL?: string;
    caste?: string;
    isMiningWorker?: string;
    hasMissingDocs?: string;
    hasUnemployed?: string;
    houseNumber?: number;
    auditStatus?: string;
    registryStatus?: string;
    searchQuery?: string;
  };

  const where: any = {};
  const andConditions: any[] = [];
  if (query.block) {
    andConditions.push({
      OR: [
        { surveyAnswers: { path: ['block'], equals: query.block } },
        { surveyAnswers: { path: ['blockName'], equals: query.block } }
      ]
    });
  }
  if (query.panchayat) {
    andConditions.push({
      OR: [
        { surveyAnswers: { path: ['panchayat'], equals: query.panchayat } },
        { surveyAnswers: { path: ['panchayatName'], equals: query.panchayat } }
      ]
    });
  }
  if (query.village) where.villageName = query.village;
  if (query.houseNumber) where.houseNumber = query.houseNumber;
  if (query.auditStatus && query.auditStatus !== 'सभी' && query.auditStatus !== 'All') {
    where.auditStatus = query.auditStatus;
  }
  if (query.registryStatus && query.registryStatus !== 'सभी' && query.registryStatus !== 'All') {
    where.registryStatus = query.registryStatus;
  }
  if (query.isBPL) {
    if (query.isBPL === 'Yes' || query.isBPL === 'हां') {
      where.isBPL = { in: ['Yes', 'हां'] };
    } else if (query.isBPL === 'No' || query.isBPL === 'नहीं') {
      where.isBPL = { in: ['No', 'नहीं'] };
    } else {
      where.isBPL = query.isBPL;
    }
  }
  if (query.caste) where.caste = query.caste;
  if (query.isMiningWorker) {
    if (query.isMiningWorker === 'Yes' || query.isMiningWorker === 'हां') {
      where.isMiningWorker = { in: ['Yes', 'हां'] };
    } else if (query.isMiningWorker === 'No' || query.isMiningWorker === 'नहीं') {
      where.isMiningWorker = { in: ['No', 'नहीं'] };
    } else {
      where.isMiningWorker = query.isMiningWorker;
    }
  }
  if (query.hasMissingDocs === 'true') {
    where.OR = [
      { missingAadhaar: { gt: 0 } },
      { missingAyushman: { gt: 0 } },
      { missingCasteCert: { gt: 0 } },
      { missingVoterId: { gt: 0 } }
    ];
  }
  if (query.hasUnemployed === 'true') {
    where.unemployedCount = { gt: 0 };
  }
  if (query.searchQuery?.trim()) {
    const search = query.searchQuery.trim();
    andConditions.push({
      OR: [
        { headName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { trackingId: { contains: search, mode: 'insensitive' } },
        { villageName: { contains: search, mode: 'insensitive' } }
      ]
    });
  }
  if (andConditions.length > 0) where.AND = andConditions;

  reply.hijack();
  reply.raw.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="jansetu_export_${Date.now()}.csv"`,
    'Cache-Control': 'no-store'
  });

  const exportStream = Readable.from((async function* () {
    yield `\uFEFF${CSV_HEADER.join(',')}\r\n`;

    let cursor: { id: string; submittedAt: Date } | undefined;
    let rowsWritten = 0;
    while (rowsWritten < MAX_EXPORT_ROWS) {
      const page = await prisma.householdSurvey.findMany({
        where: cursor
          ? {
              AND: [
                where,
                {
                  OR: [
                    { submittedAt: { lt: cursor.submittedAt } },
                    { submittedAt: cursor.submittedAt, id: { lt: cursor.id } }
                  ]
                }
              ]
            }
          : where,
        take: Math.min(EXPORT_BATCH_SIZE, MAX_EXPORT_ROWS - rowsWritten),
        orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          trackingId: true,
          villageName: true,
          houseNumber: true,
          headName: true,
          mobile: true,
          caste: true,
          isBPL: true,
          totalMembers: true,
          eldersCount: true,
          childrenCount: true,
          unemployedCount: true,
          incomeSource: true,
          missingAadhaar: true,
          missingAyushman: true,
          missingCasteCert: true,
          missingVoterId: true,
          isMiningWorker: true,
          houseType: true,
          hasToilet: true,
          hasTapWater: true,
          submittedAt: true
        }
      });

      if (page.length === 0) break;
      for (const household of page) {
        yield `${csvHouseholdRow(household)}\r\n`;
      }

      const lastRow = page[page.length - 1];
      cursor = { id: lastRow.id, submittedAt: lastRow.submittedAt };
      rowsWritten += page.length;
    }
  })());

  try {
    await pipeline(exportStream, reply.raw);
  } catch (err) {
    req.log.warn({ err }, 'Household CSV export stream ended before completion');
    if (!reply.raw.destroyed) reply.raw.destroy(err instanceof Error ? err : undefined);
  }
}
