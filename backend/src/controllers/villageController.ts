import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/prisma';

export async function getAllVillageProfiles(req: FastifyRequest, reply: FastifyReply) {
  try {
    const villages = await prisma.villageProfile.findMany({
      orderBy: { villageName: 'asc' }
    });
    const result: Record<string, any> = {};
    villages.forEach((v) => {
      result[v.villageName] = v;
    });
    return reply.send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function getVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const query = (req.query || {}) as { villageName?: string };
  const { villageName } = query;
  if (!villageName) {
    return reply.status(400).send({ error: 'villageName query parameter is required' });
  }

  try {
    const village = await prisma.villageProfile.findUnique({
      where: { villageName }
    });
    if (!village) {
      return reply.status(404).send({ error: 'Village profile not found' });
    }
    return reply.send(village);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function saveVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const body = (req.body || {}) as any;
  const {
    block,
    panchayat,
    villageName,
    totalPopulation,
    totalHouseholds,
    scCount,
    stCount,
    puccaHouses,
    semiPuccaHouses,
    kacchaHouses,
    mineDistanceKm,
    hasPuccaRoad,
    monsoonCutOff,
    schoolType,
    hospitalType,
    electrification,
    quality,
    gapMatrix
  } = body;

  if (!villageName || !block || !panchayat) {
    return reply.status(400).send({ error: 'villageName, block, and panchayat are required' });
  }

  try {
    const upserted = await prisma.villageProfile.upsert({
      where: { villageName },
      update: {
        block,
        panchayat,
        totalPopulation: totalPopulation || 0,
        totalHouseholds: totalHouseholds || 0,
        scCount: scCount || 0,
        stCount: stCount || 0,
        puccaHouses: puccaHouses || 0,
        semiPuccaHouses: semiPuccaHouses || 0,
        kacchaHouses: kacchaHouses || 0,
        mineDistanceKm: mineDistanceKm || '0 to 5 KM',
        hasPuccaRoad: hasPuccaRoad || 'Yes',
        monsoonCutOff: monsoonCutOff || 'No',
        schoolType: schoolType || 'Primary School',
        hospitalType: hospitalType || 'Sub-Health Centre (SHC)',
        electrification: electrification || 'Fully Electrified',
        qualityMetrics: quality || {},
        gapMatrix: gapMatrix || {},
        version: { increment: 1 }
      },
      create: {
        block,
        panchayat,
        villageName,
        totalPopulation: totalPopulation || 0,
        totalHouseholds: totalHouseholds || 0,
        scCount: scCount || 0,
        stCount: stCount || 0,
        puccaHouses: puccaHouses || 0,
        semiPuccaHouses: semiPuccaHouses || 0,
        kacchaHouses: kacchaHouses || 0,
        mineDistanceKm: mineDistanceKm || '0 to 5 KM',
        hasPuccaRoad: hasPuccaRoad || 'Yes',
        monsoonCutOff: monsoonCutOff || 'No',
        schoolType: schoolType || 'Primary School',
        hospitalType: hospitalType || 'Sub-Health Centre (SHC)',
        electrification: electrification || 'Fully Electrified',
        qualityMetrics: quality || {},
        gapMatrix: gapMatrix || {}
      }
    });

    return reply.status(200).send({ success: true, data: upserted });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function patchVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  const body = (req.body || {}) as any;
  const { version, ...updates } = body;

  if (!version) {
    return reply.status(400).send({ error: 'Record version is required for optimistic locking update' });
  }

  try {
    const updated = await prisma.villageProfile.updateMany({
      where: { id, version },
      data: {
        totalPopulation: updates.totalPopulation !== undefined ? updates.totalPopulation : undefined,
        totalHouseholds: updates.totalHouseholds !== undefined ? updates.totalHouseholds : undefined,
        qualityMetrics: updates.quality !== undefined ? updates.quality : undefined,
        gapMatrix: updates.gapMatrix !== undefined ? updates.gapMatrix : undefined,
        version: { increment: 1 }
      }
    });

    if (updated.count === 0) {
      return reply.status(409).send({ error: 'Conflict: Village profile was updated by another user. Reload and try again.' });
    }

    const result = await prisma.villageProfile.findUnique({ where: { id } });
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function deleteVillageProfile(req: FastifyRequest, reply: FastifyReply) {
  const params = (req.params || {}) as { id: string };
  const { id } = params;
  try {
    const deleted = await prisma.villageProfile.delete({
      where: { id }
    });
    return reply.send({ success: true, data: deleted });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}
