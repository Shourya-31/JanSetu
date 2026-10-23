import type { GeneralInformationFormData } from "../components/surveyor/village-survey/general/GeneralInformation";
import type { AnganbadiData } from "../components/surveyor/village-survey/anganbadi/AnganbadiForm";
import type { HostelData } from "../components/surveyor/village-survey/hostel/HostelForm";
import type { HealthData } from "../components/surveyor/village-survey/health/HealthForm";
import type { WaterData } from "../components/surveyor/village-survey/water/WaterForm";
import type { EmploymentData } from "../components/surveyor/village-survey/employment/EmploymentForm";
import type { LadiesData } from "../components/surveyor/village-survey/ladies/LadiesForm";
import type { CleanlinessData } from "../components/surveyor/village-survey/cleanliness/CleanlinessForm";
import type { PensionData } from "../components/surveyor/village-survey/pension/PensionForm";
import type { DevelopmentData } from "../components/surveyor/village-survey/development/DevelopmentForm";
import type { HouseholdGeneralInformationRef } from "../components/surveyor/household/general/HouseholdGeneralInformation";
import type { HouseholdDemographyRef } from "../components/surveyor/household/demography/HouseholdDemography";
import type { HouseholdDocumentsSchemesRef } from "../components/surveyor/household/documents/HouseholdDocumentsSchemes";
import type { HouseholdWomenSocialSecurityRef } from "../components/surveyor/household/women/HouseholdWomenSocialSecurity";
import type { HouseholdDisabilityDocumentsRef } from "../components/surveyor/household/disability/HouseholdDisabilityDocuments";
import type { HouseholdChildrenEducationRef } from "../components/surveyor/household/education/HouseholdChildrenEducation";
import type { HouseholdAgricultureEmploymentRef } from "../components/surveyor/household/employment/HouseholdAgricultureEmployment";
import type { HouseholdHousingFacilitiesRef } from "../components/surveyor/household/housing/HouseholdHousingFacilities";
import type { HouseholdHealthRef } from "../components/surveyor/household/health/HouseholdHealth";
import type { HouseholdSHGRef } from "../components/surveyor/household/shg/HouseholdSHG";
import type { HouseholdOtherInformationRef } from "../components/surveyor/household/other/HouseholdOtherInformation";
type SchoolData = Record<string, string>;
export type VillageAnswers = Partial<GeneralInformationFormData> & {
  villagePhotos?: string[];
  anganbadiData?: Partial<AnganbadiData>[];
  schoolData?: Partial<SchoolData>[];
  hostelData?: Partial<HostelData>[];
  healthData?: Partial<HealthData>[];
  waterData?: Partial<WaterData>;
  employmentData?: Partial<EmploymentData>;
  ladiesData?: Partial<LadiesData>;
  cleanlinessData?: Partial<CleanlinessData>;
  pensionData?: Partial<PensionData>;
  developmentData?: Partial<DevelopmentData>;
};
export type HouseholdAnswers = Partial<
  ReturnType<HouseholdGeneralInformationRef["getData"]>
> &
  Partial<ReturnType<HouseholdDemographyRef["getData"]>> &
  Partial<ReturnType<HouseholdDocumentsSchemesRef["getData"]>> &
  Partial<ReturnType<HouseholdWomenSocialSecurityRef["getData"]>> &
  Partial<ReturnType<HouseholdDisabilityDocumentsRef["getData"]>> &
  Partial<ReturnType<HouseholdChildrenEducationRef["getData"]>> &
  Partial<ReturnType<HouseholdAgricultureEmploymentRef["getData"]>> &
  Partial<ReturnType<HouseholdHousingFacilitiesRef["getData"]>> &
  Partial<ReturnType<HouseholdHealthRef["getData"]>> &
  Partial<ReturnType<HouseholdSHGRef["getData"]>> &
  Partial<ReturnType<HouseholdOtherInformationRef["getData"]>> & {
    isCompleted?: boolean;
    surveyStatus?: string;
    completedSections?: number;
    totalSections?: number;
  };
export interface SurveyRecord<T> {
  id: string;
  blockId: string;
  panchayatId: string;
  villageId: string;
  panchayatKey?: string;
  villageKey?: string;
  villageName: string;
  householdId?: string;
  submittedAt?: string;
  completed?: boolean;
  answers: T;
}
export interface SurveyDataset {
  villageSurveys: SurveyRecord<VillageAnswers>[];
  householdSurveys: SurveyRecord<HouseholdAnswers>[];
  integrationPending: boolean;
}
export interface ReportScope {
  blockId: string;
  panchayatId?: string;
  villageId?: string;
}

export interface AnalyticsScope {
  blockId?: string;
  panchayatId?: string;
  villageId?: string;
}

export interface AdminLocationVillage {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  action: string;
  population: number;
  surveyStatus: "completed" | "incomplete" | "unavailable";
}

export interface AdminLocationPanchayat {
  id: string;
  name: string;
  nameEnglish: string;
  villages: AdminLocationVillage[];
}

export interface AdminLocationBlock {
  id: string;
  blockName: string;
  blockNameEnglish: string;
  panchayats: AdminLocationPanchayat[];
}

export interface AdminAnalyticsSummary {
  districts: number;
  blocks: number;
  gramPanchayats: number;
  villages: number;
  villageSurveysCompleted: number;
  villageSurveysPending: number;
  villageSurveysIncomplete: number;
  villageSurveysUnavailable: number;
  villageCompletionPercent: number;
  householdRecords: number;
  completedHouseholdRecords: number;
  incompleteHouseholdRecords: number;
  householdCompletionPercent: number | null;
  population: number | null;
  populationResponses: number;
  totalHouseholds: number | null;
  householdTotalResponses: number;
}
