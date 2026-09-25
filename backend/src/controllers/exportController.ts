import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';

export async function exportHouseholdsCsv(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as {
    village?: string;
    isBPL?: string;
    caste?: string;
    isMiningWorker?: string;
    hasMissingDocs?: string;
    hasUnemployed?: string;
  };

  const where: any = {};
  if (query.village) where.villageName = query.village;
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

  try {
    const households = await prisma.householdSurvey.findMany({
      where,
      take: 50000,
      orderBy: { submittedAt: 'desc' }
    });

    const header = [
      'Tracking ID',
      'Village Name',
      'House Number',
      'Head Name',
      'Mobile',
      'Caste',
      'Is BPL',
      'Total Members',
      'Elders Count',
      'Children Count',
      'Unemployed Count',
      'Income Source',
      'Missing Aadhaar',
      'Missing Ayushman',
      'Missing Caste Cert',
      'Missing Voter ID',
      'Is Mining Worker',
      'House Type',
      'Has Toilet',
      'Has Tap Water',
      'Submitted At'
    ].join(',') + '\n';

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="jansetu_export_${Date.now()}.csv"`);

    const rows: string[] = ['\uFEFF' + header.trim()];
    for (const h of households) {
      rows.push([
        `"${h.trackingId}"`,
        `"${h.villageName}"`,
        h.houseNumber,
        `"${(h.headName || '').replace(/"/g, '""')}"`,
        `"${h.mobile}"`,
        `"${h.caste}"`,
        `"${h.isBPL}"`,
        h.totalMembers,
        h.eldersCount,
        h.childrenCount,
        h.unemployedCount,
        `"${h.incomeSource}"`,
        h.missingAadhaar,
        h.missingAyushman,
        h.missingCasteCert,
        h.missingVoterId,
        `"${h.isMiningWorker}"`,
        `"${h.houseType}"`,
        `"${h.hasToilet}"`,
        `"${h.hasTapWater}"`,
        `"${h.submittedAt.toISOString()}"`
      ].join(','));
    }

    return reply.send(rows.join('\n'));
  } catch (err: any) {
    return reply.status(500).send({ error: 'Export failed: ' + err.message });
  }
}
