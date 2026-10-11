export const VILLAGE_SURVEY_SECTIONS = [
  'general',
  'education',
  'school',
  'hostel',
  'health',
  'water',
  'livelihood',
  'ladies',
  'cleanliness',
  'pension',
  'development'
] as const;

export type VillageSurveySection = typeof VILLAGE_SURVEY_SECTIONS[number];

export function normalizeCompletedSections(value: unknown): VillageSurveySection[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((section): section is VillageSurveySection =>
    typeof section === 'string' && (VILLAGE_SURVEY_SECTIONS as readonly string[]).includes(section)
  ))];
}

export function progressForSections(sections: unknown): number {
  return Math.round((normalizeCompletedSections(sections).length / VILLAGE_SURVEY_SECTIONS.length) * 100);
}

export function canFinalizeSurvey(completedSections: unknown, surveyData: unknown): boolean {
  const sections = normalizeCompletedSections(completedSections);
  if (!VILLAGE_SURVEY_SECTIONS.every((section) => sections.includes(section))) return false;
  if (!surveyData || typeof surveyData !== 'object') return false;
  const data = surveyData as Record<string, unknown>;
  const requiredFields: Record<VillageSurveySection, string> = {
    general: 'totalHouseholds',
    education: 'anganbadiData',
    school: 'schoolData',
    hostel: 'hostelData',
    health: 'healthData',
    water: 'waterData',
    livelihood: 'employmentData',
    ladies: 'ladiesData',
    cleanliness: 'cleanlinessData',
    pension: 'pensionData',
    development: 'developmentData'
  };
  return VILLAGE_SURVEY_SECTIONS.every((section) =>
    Object.prototype.hasOwnProperty.call(data, requiredFields[section])
  );
}
