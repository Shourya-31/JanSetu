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

const { CENSUS_HIERARCHY } = require('../../../frontend/src/data/narayanpurHierarchy') as {
  CENSUS_HIERARCHY: SourceBlock[];
};

async function seedHierarchy() {
  const data = CENSUS_HIERARCHY.flatMap((block) =>
    block.panchayats.flatMap((panchayat) =>
      panchayat.villages.map((village) => ({
        blockName: block.blockName,
        blockNameEnglish: block.blockNameEnglish,
        panchayatName: panchayat.name,
        panchayatNameEnglish: panchayat.nameEnglish,
        villageName: village.nameHindi,
        villageNameEnglish: village.nameEnglish,
        affectedStatus: village.action,
        population: village.population
      }))
    )
  );

  if (data.length !== 290) {
    throw new Error(`Expected exactly 290 affected villages; source contains ${data.length}`);
  }

  const result = await prisma.narayanpurHierarchy.createMany({
    data,
    skipDuplicates: true
  });
  console.log(`Inserted ${result.count} hierarchy rows from the ${data.length}-village source dataset.`);
}

seedHierarchy()
  .catch((error) => {
    console.error('Hierarchy seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });