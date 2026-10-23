import { describe, expect, it } from 'vitest';
import { householdSections } from '../data/adminSurveyCatalog';
import { buildReportHtml } from './adminReportExports';
import { compileReport } from './adminReportModel';

const answers = ['हाँ', 'नहीं', 'पात्रता नहीं'];

describe('animal employment in admin details and reports', () => {
  it.each(answers)('preserves %s in the household detail and report output', (animalEmployment) => {
    const report = compileReport({
      villageSurveys: [],
      householdSurveys: [{
        id: 'household-1',
        blockId: 'test-block',
        panchayatId: 'test-panchayat',
        villageId: '3',
        villageName: 'परीक्षण गाँव',
        householdId: '1',
        answers: { animalEmployment }
      }],
      integrationPending: false
    }, {
      blockId: 'test-block',
      villageId: '3'
    }, 'Test Block', '2026-10-15T00:00:00.000Z');

    const detailAnswer = report.answers.find((answer) => answer.key === 'animalEmployment');
    const employmentSection = householdSections.find((section) => section.id === 'employment');
    const field = employmentSection?.fields.find((candidate) => candidate.key === 'animalEmployment');
    const surveyTable = report.tables.find((table) => table.id === `Household-${employmentSection?.title}`);
    const answerColumn = surveyTable?.columns.findIndex((column) => column.fieldKey === 'animalEmployment');
    const distribution = report.statistics.find((stat) => stat.key === 'animalEmployment');

    expect(field?.options).toEqual(answers);
    expect(detailAnswer?.value).toBe(animalEmployment);
    expect(answerColumn).toBeGreaterThanOrEqual(0);
    expect(surveyTable?.rows[0].values[answerColumn!]).toBe(animalEmployment);
    expect(buildReportHtml(report)).toContain(animalEmployment);
    if (animalEmployment === 'पात्रता नहीं') {
      expect(distribution?.ineligible).toBe(1);
    } else {
      expect(distribution?.options.find((option) => option.option === animalEmployment)?.count).toBe(1);
    }
  });

  it('treats identical house numbers in different villages as separate households', () => {
    const report = compileReport({
      villageSurveys: [],
      householdSurveys: ['3', '4'].map((villageId) => ({
        id: `household-${villageId}`,
        blockId: 'test-block',
        panchayatId: 'test-panchayat',
        villageId,
        villageName: `Village ${villageId}`,
        householdId: '1',
        completed: false,
        answers: { animalEmployment: 'हाँ' }
      })),
      integrationPending: false
    }, { blockId: 'test-block' }, 'Test Block');

    expect(report.summary.householdRecords).toBe(2);
  });
});
