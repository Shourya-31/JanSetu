export interface GeneralInformation {
  totalHouseholds: number;
  totalPopulation: number;
  scPopulation: number;
  stPopulation: number;
  totalAgriculturalLand: number;

  totalAnganwadi: number;
  totalSchools: number;

  // बाकी general questions बाद में यहाँ आएंगे
}

export interface AnganwadiSurvey {
  name: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
}

export interface SchoolSurvey {
  name: string;
  udiseCode: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: number;
  q12: number;
  q13: number;
  q14: number;
  q15: number;
  q16: number;
  q17: string;
  q18: string;
}

export interface VillageSurvey {
  general: GeneralInformation;
  anganwadis: AnganwadiSurvey[];
  schools: SchoolSurvey[];
}