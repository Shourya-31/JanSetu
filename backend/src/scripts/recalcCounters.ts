import dotenv from 'dotenv';
import prisma from '../config/prisma';
import { isDirectlyAffected, isIndirectlyAffected } from '../utils/villageAffectedStatus';

dotenv.config();

async function run() {
  console.log("Recalculating all counters...");
  
  const blocks = await prisma.block.findMany({ include: { gramPanchayats: { include: { villages: { include: { villageSurvey: true, households: true } } } } } });

  for (const block of blocks) {
    let blockTotalVillages = 0;
    let blockDirectAffected = 0;
    let blockIndirectAffected = 0;
    let blockVillageSurveyFilled = 0;
    let blockTotalHouseholds = 0;
    let blockHouseholdsFilled = 0;

    for (const gp of block.gramPanchayats) {
      let gpTotalVillages = 0;
      let gpDirectAffected = 0;
      let gpIndirectAffected = 0;
      let gpVillageSurveyFilled = 0;
      let gpTotalHouseholds = 0;
      let gpHouseholdsFilled = 0;

      for (const village of gp.villages) {
        const isDirect = isDirectlyAffected(village.affectedStatus);
        const isIndirect = isIndirectlyAffected(village.affectedStatus);
        const isSurveyFilled = !!village.villageSurvey?.isCompleted;
        const totalHouseholds = village.villageSurvey?.totalHouseholds || 0;
        const householdsFilled = village.households.filter(h => h.isCompleted).length;

        await prisma.village.update({
          where: { id: village.id },
          data: {
            isSurveyFilled,
            totalHouseholds,
            householdsFilled
          }
        });

        gpTotalVillages++;
        if (isDirect) gpDirectAffected++;
        if (isIndirect) gpIndirectAffected++;
        if (isSurveyFilled) gpVillageSurveyFilled++;
        gpTotalHouseholds += totalHouseholds;
        gpHouseholdsFilled += householdsFilled;
      }

      await prisma.gramPanchayat.update({
        where: { id: gp.id },
        data: {
          totalVillages: gpTotalVillages,
          directAffectedVillages: gpDirectAffected,
          indirectAffectedVillages: gpIndirectAffected,
          villageSurveysFilled: gpVillageSurveyFilled,
          totalHouseholds: gpTotalHouseholds,
          householdsFilled: gpHouseholdsFilled
        }
      });

      blockTotalVillages += gpTotalVillages;
      blockDirectAffected += gpDirectAffected;
      blockIndirectAffected += gpIndirectAffected;
      blockVillageSurveyFilled += gpVillageSurveyFilled;
      blockTotalHouseholds += gpTotalHouseholds;
      blockHouseholdsFilled += gpHouseholdsFilled;
    }

    await prisma.block.update({
      where: { id: block.id },
      data: {
        totalVillages: blockTotalVillages,
        directAffectedVillages: blockDirectAffected,
        indirectAffectedVillages: blockIndirectAffected,
        villageSurveysFilled: blockVillageSurveyFilled,
        totalHouseholds: blockTotalHouseholds,
        householdsFilled: blockHouseholdsFilled
      }
    });
  }

  console.log("Recalculation complete!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
