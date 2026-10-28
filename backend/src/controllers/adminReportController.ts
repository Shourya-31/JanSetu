import { FastifyRequest, FastifyReply } from 'fastify';
import { withErrorContext } from '../utils/errors';
import prisma from '../config/prisma';
import { mergePhotoUrls } from '../utils/villagePhotos';
import { affectedVillageCounts, isDirectlyAffected, isIndirectlyAffected } from '../utils/villageAffectedStatus';

export async function getAdminSurveys(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = req.query as { blockId: string; panchayatId?: string; villageId?: string };
    const { blockId, panchayatId, villageId } = query;
    const parseId = (value?: string) => {
      if (value === undefined) return undefined;
      const id = Number(value);
      return Number.isSafeInteger(id) && id > 0 ? id : null;
    };
    const blockDbId = parseId(blockId);
    const panchayatDbId = parseId(panchayatId);
    const villageDbId = parseId(villageId);
    if (blockDbId === null || panchayatDbId === null || villageDbId === null) {
      return reply.code(400).send({ error: 'Location IDs must be positive integers.' });
    }
    if (blockDbId === undefined) {
      return reply.code(400).send({ error: 'blockId is required' });
    }

    const whereClause = {
      ...(villageDbId === undefined ? {} : { id: villageDbId }),
      gramPanchayat: {
        blockId: blockDbId,
        ...(panchayatDbId === undefined ? {} : { id: panchayatDbId })
      }
    };
    const villages = await prisma.village.findMany({
      where: whereClause,
      include: {
        villageSurvey: true,
        gramPanchayat: {
          include: {
            block: true
          }
        }
      }
    });
    const villageSurveys = villages.map(v => {
      const vs = v.villageSurvey;
      if (!vs) return null;
      
      return {
        id: vs.id,
        blockId: String(v.gramPanchayat.block.id),
        panchayatId: String(v.gramPanchayat.id),
        panchayatKey: String(v.gramPanchayat.id),
        villageId: v.id.toString(),
        villageKey: v.id.toString(),
        villageName: v.nameHindi,
        submittedAt: vs.updatedAt.toISOString(),
        completed: vs.isCompleted,
        progress: vs.isCompleted ? 100 : Number(vs.progress || 0),
        completedSections: Array.isArray(vs.completedSections) ? vs.completedSections : [],
        answers: {
          ...(vs.surveyData && typeof vs.surveyData === 'object' ? vs.surveyData as Record<string, unknown> : {}),
          villagePhotos: mergePhotoUrls(
            vs.villagePhotos,
            vs.surveyData && typeof vs.surveyData === 'object'
              ? (vs.surveyData as Record<string, unknown>).villagePhotos
              : undefined
          ),
          totalHouseholds: vs.totalHouseholds,
          totalPopulation: vs.totalPopulation,
          scPopulation: vs.scPopulation,
          stPopulation: vs.stPopulation,
          totalSchools: vs.totalSchools,
          totalAnganwadi: vs.totalAnganwadi,
          totalHealthFacilities: vs.totalHealthFacilities,
          totalHostels: vs.totalHostels,
          fairPriceShop: vs.fairPriceShop,
          shopDistance: vs.shopDistance,
          mobileNetwork: vs.mobileNetwork,
          networkDistance: vs.networkDistance,
          electricity: vs.electricity,
          solarLight: vs.solarLight,
          road: vs.road,
          roadConnectivity: vs.roadConnectivity,
          roadReasons: vs.roadReasons,
          rainCutoff: vs.rainCutoff,
          tapWater: vs.tapWater,
          tapWaterExcludedFamilies: vs.tapWaterExcludedFamilies,
          ponds: vs.ponds,
          puccaHouses: vs.puccaHouses,
          rawHouses: vs.rawHouses,
          completedHouses: vs.completedHouses,
          pendingHouses: vs.pendingHouses,
          housingNotSanctioned: vs.housingNotSanctioned,
          totalAgriculturalLand: vs.totalAgriculturalLand,
          irrigatedLand: vs.irrigatedLand,
          odf: vs.odf,
          banking: vs.banking,
          vet: vs.vet,
          waterSourceType: vs.waterSourceType,
          waterAvailabilityMonths: vs.waterAvailabilityMonths,
          waterQualityIssue: vs.waterQualityIssue,
          fluorideIssue: vs.fluorideIssue,
          handpumpsTotal: vs.handpumpsTotal,
          handpumpsWorking: vs.handpumpsWorking,
          pipelineWaterScheme: vs.pipelineWaterScheme,
          mnregaWorkdays: vs.mnregaWorkdays,
          mnregaDemandPending: vs.mnregaDemandPending,
          miningWorkersCount: vs.miningWorkersCount,
          migrationCount: vs.migrationCount,
          migrationDestination: vs.migrationDestination,
          subHealthCenterAvailable: vs.subHealthCenterAvailable,
          healthWorkerVisit: vs.healthWorkerVisit,
          malariaLastYear: vs.malariaLastYear,
          tbCasesCount: vs.tbCasesCount,
          sickleCell: vs.sickleCell
        }
      };
    }).filter(Boolean);

    const villageIds = villages.map(v => v.id);
    const households = await prisma.householdSurvey.findMany({
      where: {
        villageId: { in: villageIds }
      },
      include: {
        village: {
          include: {
            gramPanchayat: {
              include: {
                block: true
              }
            }
          }
        }
      }
    });

    const householdSurveys = households.map(h => {
      return {
        id: h.id,
        blockId: String(h.village.gramPanchayat.block.id),
        panchayatId: String(h.village.gramPanchayat.id),
        panchayatKey: String(h.village.gramPanchayat.id),
        villageId: h.villageId.toString(),
        villageKey: h.villageId.toString(),
        villageName: h.village.nameHindi,
        householdId: h.houseNumber.toString(),
        submittedAt: h.submittedAt.toISOString(),
        completed: h.isCompleted,
        answers: {
          headName: h.headName,
          mobile: h.mobile,
          surveyDate: h.surveyDate,
          surveyorName: h.surveyorName,
          caste: h.caste,
          isBPL: h.isBpl,
          rationCard: h.rationCard,
          eldersCount: h.eldersCount,
          childrenCount: h.childrenCount,
          womenCount: h.womenCount,
          aadhaarEkyc: h.aadhaarEkyc,
          noAadhaarMembers: h.noAadhaarMembers,
          noCasteCertMembers: h.noCasteCertMembers,
          noAyushmanMembers: h.noAyushmanMembers,
          noVoterIdMembers: h.noVoterIdMembers,
          mnregaJobCard: h.mnregaJobCard,
          noShramikCardMembers: h.noShramikCardMembers,
          janDhanAccount: h.janDhanAccount,
          bankName: h.bankName,
          kcc: h.kcc,
          forestRightsPatta: h.forestRightsPatta,
          marriageCertificate: h.marriageCertificate,
          jsy: h.jsy,
          pmmvy: h.pmmvy,
          mahtariVandana: h.mahtariVandana,
          widowPension: h.widowPension,
          disabilityPension: h.disabilityPension,
          needsAssistiveDevice: h.needsAssistiveDevice,
          assistanceTypes: h.assistanceTypes,
          otherAssistance: h.otherAssistance,
          deathInLastYear: h.deathInLastYear,
          deathCertificateReceived: h.deathCertificateReceived,
          pmGaribKalyanRation: h.pmGaribKalyanRation,
          childrenWithoutBirthCert: h.childrenWithoutBirthCert,
          vaccinationStatus: h.vaccinationStatus,
          anganwadiMeal: h.anganwadiMeal,
          childrenSchoolStatus: h.childrenSchoolStatus,
          schoolNotGoingReason: h.schoolNotGoingReason,
          otherSchoolReason: h.otherSchoolReason,
          unemployedMembers: h.unemployedMembers,
          pmKisan: h.pmKisan,
          miningEmployment: h.miningEmployment,
          annualIncome: h.annualIncome,
          mainIncomeSource: h.mainIncomeSource,
          livestockSource: h.livestockSource,
          otherLivestockSource: h.otherLivestockSource,
          animalEmployment: h.animalEmployment,
          houseType: h.houseType,
          housingSchemeBenefit: h.housingSchemeBenefit,
          toiletStatus: h.toiletStatus,
          tapWaterConnection: h.tapWaterConnection,
          drinkingWaterSource: h.drinkingWaterSource,
          electricityConnection: h.electricityConnection,
          solarEnergy: h.solarEnergy,
          familyDisease: h.familyDisease,
          freeMedicines: h.freeMedicines,
          shgMember: h.shgMember,
          priorityNeed1: h.priorityNeed1,
          priorityNeed2: h.priorityNeed2,
          priorityNeed3: h.priorityNeed3,
          eligibleSchemeNotReceived: h.eligibleSchemeNotReceived,
          schemeBenefitName: h.schemeBenefitName
        }
      };
    });

    return reply.send({
      villageSurveys,
      householdSurveys,
      integrationPending: false
    });

  } catch (error) {
    throw withErrorContext(error, { operation: 'admin.surveys.query', stage: 'database_query' });
  }
}

export async function getAdminGramStats(req: FastifyRequest, reply: FastifyReply) {
  try {
    // ⚡ SUPER FAST ⚡: Uses the pre-calculated counters on Block and GramPanchayat!
    const blocks = await prisma.block.findMany({
      include: {
        gramPanchayats: {
          include: {
            villages: {
              include: { villageSurvey: { select: { isCompleted: true } } }
            }
          }
        }
      }
    });

    const responseBlocks = blocks.map(block => {
      const panchayats = block.gramPanchayats.map(panchayat => {
        const villages = panchayat.villages.map(village => {
          const isDirect = isDirectlyAffected(village.affectedStatus);
          const isIndirect = isIndirectlyAffected(village.affectedStatus);
          const villageSurveyFilled = village.villageSurvey?.isCompleted === true;

          return {
            villageId: village.id.toString(),
            villageName: village.nameHindi,
            affectedStatus: village.affectedStatus,
            isDirectAffected: isDirect,
            isIndirectAffected: isIndirect,
            villageSurveyFilled,
            totalHouseholds: village.totalHouseholds,
            householdsFilled: village.householdsFilled,
            householdsPending: Math.max(0, village.totalHouseholds - village.householdsFilled),
            completionPercent: village.totalHouseholds > 0 ? Math.round((village.householdsFilled / village.totalHouseholds) * 100) : 0
          };
        });
        const affectedCounts = affectedVillageCounts(panchayat.villages.map((village) => village.affectedStatus));
        const directAffectedVillagesSurveyFilled = panchayat.villages.filter(
          (village) => isDirectlyAffected(village.affectedStatus) && village.villageSurvey?.isCompleted === true
        ).length;
        const indirectAffectedVillagesSurveyFilled = panchayat.villages.filter(
          (village) => isIndirectlyAffected(village.affectedStatus) && village.villageSurvey?.isCompleted === true
        ).length;
        const villageSurveyFilled = panchayat.villages.filter(
          (village) => village.villageSurvey?.isCompleted === true
        ).length;

        return {
          panchayatId: panchayat.nameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          panchayatName: panchayat.nameHindi,
          totalVillages: affectedCounts.totalVillages,
          directAffectedVillages: affectedCounts.directAffectedVillages,
          indirectAffectedVillages: affectedCounts.indirectAffectedVillages,
          unaffectedVillages: affectedCounts.unaffectedVillages,
          directAffectedVillagesSurveyFilled,
          indirectAffectedVillagesSurveyFilled,
          directAffectedVillageCompletionPercent: affectedCounts.directAffectedVillages
            ? Math.round((directAffectedVillagesSurveyFilled / affectedCounts.directAffectedVillages) * 100)
            : 0,
          indirectAffectedVillageCompletionPercent: affectedCounts.indirectAffectedVillages
            ? Math.round((indirectAffectedVillagesSurveyFilled / affectedCounts.indirectAffectedVillages) * 100)
            : 0,
          villageSurveyFilled,
          villageSurveyPending: Math.max(0, affectedCounts.totalVillages - villageSurveyFilled),
          totalHouseholds: panchayat.totalHouseholds,
          householdsFilled: panchayat.householdsFilled,
          householdsPending: Math.max(0, panchayat.totalHouseholds - panchayat.householdsFilled),
          completionPercent: panchayat.totalHouseholds > 0 ? Math.round((panchayat.householdsFilled / panchayat.totalHouseholds) * 100) : 0,
          villages
        };
      });
      const affectedCounts = affectedVillageCounts(block.gramPanchayats.flatMap(
        (panchayat) => panchayat.villages.map((village) => village.affectedStatus)
      ));
      const directAffectedVillagesSurveyFilled = block.gramPanchayats.reduce(
        (count, panchayat) => count + panchayat.villages.filter(
          (village) => isDirectlyAffected(village.affectedStatus) && village.villageSurvey?.isCompleted === true
        ).length,
        0
      );
      const indirectAffectedVillagesSurveyFilled = block.gramPanchayats.reduce(
        (count, panchayat) => count + panchayat.villages.filter(
          (village) => isIndirectlyAffected(village.affectedStatus) && village.villageSurvey?.isCompleted === true
        ).length,
        0
      );
      const villageSurveyFilled = panchayats.reduce((count, panchayat) => count + panchayat.villageSurveyFilled, 0);

      return {
        blockId: block.nameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        blockName: block.nameHindi,
        totalVillages: affectedCounts.totalVillages,
        directAffectedVillages: affectedCounts.directAffectedVillages,
        indirectAffectedVillages: affectedCounts.indirectAffectedVillages,
        unaffectedVillages: affectedCounts.unaffectedVillages,
        directAffectedVillagesSurveyFilled,
        indirectAffectedVillagesSurveyFilled,
        directAffectedVillageCompletionPercent: affectedCounts.directAffectedVillages
          ? Math.round((directAffectedVillagesSurveyFilled / affectedCounts.directAffectedVillages) * 100)
          : 0,
        indirectAffectedVillageCompletionPercent: affectedCounts.indirectAffectedVillages
          ? Math.round((indirectAffectedVillagesSurveyFilled / affectedCounts.indirectAffectedVillages) * 100)
          : 0,
        villageSurveyFilled,
        villageSurveyPending: Math.max(0, affectedCounts.totalVillages - villageSurveyFilled),
        totalHouseholds: block.totalHouseholds,
        householdsFilled: block.householdsFilled,
        householdsPending: Math.max(0, block.totalHouseholds - block.householdsFilled),
        completionPercent: block.totalHouseholds > 0 ? Math.round((block.householdsFilled / block.totalHouseholds) * 100) : 0,
        panchayats
      };
    });

    const summary = responseBlocks.reduce((acc, b) => {
      acc.totalVillages += b.totalVillages;
      acc.directAffectedVillages += b.directAffectedVillages;
      acc.indirectAffectedVillages += b.indirectAffectedVillages;
      acc.unaffectedVillages += b.unaffectedVillages;
      acc.directAffectedVillagesSurveyFilled += b.directAffectedVillagesSurveyFilled;
      acc.indirectAffectedVillagesSurveyFilled += b.indirectAffectedVillagesSurveyFilled;
      acc.villageSurveyFilled += b.villageSurveyFilled;
      acc.villageSurveyPending += b.villageSurveyPending;
      acc.totalHouseholds += b.totalHouseholds;
      acc.householdsFilled += b.householdsFilled;
      acc.householdsPending += b.householdsPending;
      return acc;
    }, {
      totalVillages: 0,
      directAffectedVillages: 0,
      indirectAffectedVillages: 0,
      unaffectedVillages: 0,
      directAffectedVillagesSurveyFilled: 0,
      indirectAffectedVillagesSurveyFilled: 0,
      villageSurveyFilled: 0,
      villageSurveyPending: 0,
      totalHouseholds: 0,
      householdsFilled: 0,
      householdsPending: 0,
      overallCompletionPercent: 0,
      directAffectedVillageCompletionPercent: 0,
      indirectAffectedVillageCompletionPercent: 0
    });

    if (summary.totalHouseholds > 0) {
      summary.overallCompletionPercent = Math.round((summary.householdsFilled / summary.totalHouseholds) * 100);
    }
    summary.directAffectedVillageCompletionPercent = summary.directAffectedVillages
      ? Math.round((summary.directAffectedVillagesSurveyFilled / summary.directAffectedVillages) * 100)
      : 0;
    summary.indirectAffectedVillageCompletionPercent = summary.indirectAffectedVillages
      ? Math.round((summary.indirectAffectedVillagesSurveyFilled / summary.indirectAffectedVillages) * 100)
      : 0;

    return reply.send({
      blocks: responseBlocks,
      summary
    });

  } catch (error) {
    throw withErrorContext(error, { operation: 'admin.gram_stats.query', stage: 'database_query' });
  }
}
