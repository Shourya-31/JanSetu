import dotenv from 'dotenv';
import prisma from '../config/prisma';

dotenv.config();

type SourceVillage = {
  nameHindi: string;
  nameEnglish: string;
  action: string;
  population: number;
};

type SourcePanchayat = {
  name: string;
  nameEnglish: string;
  villages: SourceVillage[];
};

type SourceBlock = {
  blockName: string;
  blockNameEnglish: string;
  panchayats: SourcePanchayat[];
};

const { CENSUS_HIERARCHY } = require('../data/narayanpurHierarchy') as {
  CENSUS_HIERARCHY: SourceBlock[];
};

async function getOrCreate<T extends { id: number }>(
  findFn: () => Promise<T | null>,
  createFn: () => Promise<T>
): Promise<T> {
  const existing = await findFn();
  return existing ?? createFn();
}

export async function seedHierarchy(database = prisma) {
  let totalVillages = 0;

  for (const sourceBlock of CENSUS_HIERARCHY) {
    // 1. Get or create Block
    const block = await getOrCreate(
      () => database.block.findFirst({ where: { nameHindi: sourceBlock.blockName } }),
      () => database.block.create({
        data: { nameHindi: sourceBlock.blockName, nameEnglish: sourceBlock.blockNameEnglish }
      })
    );

    for (const sourcePanchayat of sourceBlock.panchayats) {
      // 2. Get or create GramPanchayat
      const gp = await getOrCreate(
        () => database.gramPanchayat.findFirst({
          where: { blockId: block.id, nameHindi: sourcePanchayat.name }
        }),
        () => database.gramPanchayat.create({
          data: {
            nameHindi: sourcePanchayat.name,
            nameEnglish: sourcePanchayat.nameEnglish,
            blockId: block.id
          }
        })
      );

      for (const sourceVillage of sourcePanchayat.villages) {
        // 3. Get or create Village
        await getOrCreate(
          () => database.village.findFirst({
            where: { gramPanchayatId: gp.id, nameHindi: sourceVillage.nameHindi }
          }),
          () => database.village.create({
            data: {
              nameHindi: sourceVillage.nameHindi,
              nameEnglish: sourceVillage.nameEnglish,
              affectedStatus: sourceVillage.action,
              population: sourceVillage.population,
              gramPanchayatId: gp.id
            }
          })
        );
        totalVillages++;
      }
    }
  }

  const blockCount = await database.block.count();
  const gpCount = await database.gramPanchayat.count();
  const villageCount = await database.village.count();

  console.log(`✅ Hierarchy seeded:`);
  console.log(`   Blocks:          ${blockCount}`);
  console.log(`   GramPanchayats:  ${gpCount}`);
  console.log(`   Villages:        ${villageCount} (processed ${totalVillages})`);
}

if (require.main === module) {
  seedHierarchy()
    .catch((error) => {
      console.error('Hierarchy seeding failed:', error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}