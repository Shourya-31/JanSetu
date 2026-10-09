// ============================================================================
// Admin Analytics & Reports type definitions
// ----------------------------------------------------------------------------
// TypeScript interfaces for analytics calculations, report compilation,
// and export functionality. Designed to accept data from the backend once
// integration is completed.
// ============================================================================

import type { Block } from '../data/narayanpurHierarchy';

// ---------- Village Survey Data Structures ----------

export interface VillageSurveyGeneralData {
  totalHouseholds: string;
  scPopulation: string;
  totalSchools: string;
  totalAnganwadi: string;
  fairPriceShop: string;
  mobileNetwork: string;
  electricity: string;
  road: string;
  roadconnectivity: string;
  roadReasons: string[];
  tapWater: string;
  ponds: string;
  puccaHouses: string;
  completedHouses: string;
  pendingHouses: string;
  totalAgriculturalLand: string;
  odf: string;
  totalPopulation: string;
  stPopulation: string;
  totalHealthFacilities: string;
  totalHostels: string;
  shopDistance: string;
  networkDistance: string;
  solarLight: string;
  rainCutoff: string;
  tapWaterExcludedFamilies: string;
  vet: string;
  rawHouses: string;
  housingNotSanctioned: string;
  banking: string;
  irrigatedLand: string;
}

export interface VillageSurveyRecord {
  id: string;
  villageName: string;
  block: string;
  panchayat: string;
  district: string;
  surveyorName: string;
  submittedAt?: string;
  general: VillageSurveyGeneralData;
  // Section-level data stored as key-value pairs
  anganwadi?: Record<string, unknown>[];
  school?: Record<string, unknown>[];
  hostel?: Record<string, unknown>[];
  health?: Record<string, unknown>;
  water?: Record<string, unknown>;
  employment?: Record<string, unknown>;
  ladies?: Record<string, unknown>;
  cleanliness?: Record<string, unknown>;
  pension?: Record<string, unknown>;
  development?: Record<string, unknown>;
  [key: string]: unknown;
}

// ---------- Household Survey Data Structures ----------

export interface HouseholdSurveyRecord {
  id: string;
  trackingId: string;
  houseNumber: number;
  villageName: string;
  block: string;
  panchayat: string;
  surveyorName: string;
  submittedAt?: string;
  // Section data
  general?: Record<string, unknown>;
  demography?: Record<string, unknown>;
  documents?: Record<string, unknown>;
  women?: Record<string, unknown>;
  disability?: Record<string, unknown>;
  education?: Record<string, unknown>;
  employment?: Record<string, unknown>;
  housing?: Record<string, unknown>;
  health?: Record<string, unknown>;
  shg?: Record<string, unknown>;
  other?: Record<string, unknown>;
  [key: string]: unknown;
}

// ---------- Analytics Calculation Types ----------

export interface OptionCount {
  option: string;
  count: number;
  percentage: number;
}

export interface QuestionStat {
  questionKey: string;
  questionLabel: string;
  totalResponses: number;
  options: OptionCount[];
}

export interface NumericStat {
  questionKey: string;
  questionLabel: string;
  total: number;
  count: number;
  min: number;
  max: number;
  average: number;
}

export interface AnalyticsSummary {
  totalVillagesSurveyed: number;
  totalHouseholdsSurveyed: number;
  totalPopulation: number;
  totalHouseholds: number;
  villageSurveyStats: QuestionStat[];
  householdSurveyStats: QuestionStat[];
  numericStats: NumericStat[];
}

// ---------- Report Types ----------

export interface BlockReportData {
  blockId: string;
  blockName: string;
  blockNameEnglish: string;
  generatedAt: string;
  totalVillages: number;
  totalHouseholds: number;
  villageSurveys: VillageSurveyRecord[];
  householdSurveys: HouseholdSurveyRecord[];
  villageSurveyStats: QuestionStat[];
  householdSurveyStats: QuestionStat[];
  numericStats: NumericStat[];
}

// ---------- Location Selection ----------

export interface BlockOption {
  id: string;
  blockName: string;
  blockNameEnglish: string;
}

// ---------- Data Loading State ----------

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface DataState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// ---------- Village Survey Section Definitions ----------

export const VILLAGE_SURVEY_SECTIONS = [
  { id: 'general', title: 'ग्राम की सामान्य जानकारी', titleEn: 'General Information' },
  { id: 'anganwadi', title: 'आंगनबाड़ी', titleEn: 'Anganwadi' },
  { id: 'school', title: 'विद्यालय एवं शिक्षा', titleEn: 'School & Education' },
  { id: 'hostel', title: 'आश्रम/छात्रावास', titleEn: 'Hostel' },
  { id: 'health', title: 'स्वास्थ्य एवं पोषण', titleEn: 'Health & Nutrition' },
  { id: 'water', title: 'पेयजल सुविधा', titleEn: 'Drinking Water' },
  { id: 'employment', title: 'रोजगार, आजीविका, पलायन एवं कौशल विकास', titleEn: 'Employment & Livelihood' },
  { id: 'ladies', title: 'महिला स्वयं सहायता समूह एवं वित्तीय समावेशन', titleEn: 'Women SHG & Financial Inclusion' },
  { id: 'cleanliness', title: 'स्वच्छता एवं अपशिष्ट प्रबंधन', titleEn: 'Cleanliness & Waste Management' },
  { id: 'pension', title: 'पेंशन एवं सामाजिक सुरक्षा', titleEn: 'Pension & Social Security' },
  { id: 'development', title: 'ग्राम की विकास आवश्यकताएँ', titleEn: 'Village Development Needs' },
] as const;

export const HOUSEHOLD_SURVEY_SECTIONS = [
  { id: 'general', title: 'परिवार की सामान्य जानकारी', titleEn: 'General Information' },
  { id: 'demography', title: 'जनसांख्यिकी', titleEn: 'Demography' },
  { id: 'documents', title: 'दस्तावेज़ एवं योजनाएं', titleEn: 'Documents & Schemes' },
  { id: 'women', title: 'महिला एवं सामाजिक सुरक्षा', titleEn: 'Women & Social Security' },
  { id: 'disability', title: 'दिव्यांगता दस्तावेज़', titleEn: 'Disability Documents' },
  { id: 'education', title: 'बच्चों की शिक्षा', titleEn: 'Children Education' },
  { id: 'employment', title: 'कृषि एवं रोजगार', titleEn: 'Agriculture & Employment' },
  { id: 'housing', title: 'आवास एवं सुविधाएं', titleEn: 'Housing & Facilities' },
  { id: 'health', title: 'स्वास्थ्य', titleEn: 'Health' },
  { id: 'shg', title: 'स्वयं सहायता समूह', titleEn: 'Self Help Group' },
  { id: 'other', title: 'अन्य जानकारी', titleEn: 'Other Information' },
] as const;

// ---------- Village Survey General Questions for Analytics ----------

export interface QuestionDefinition {
  key: string;
  label: string;
  labelEn: string;
  type: 'categorical' | 'numeric' | 'text' | 'multi-select';
  options?: string[];
  section: string;
}

export const VILLAGE_GENERAL_QUESTIONS: QuestionDefinition[] = [
  { key: 'totalHouseholds', label: 'कुल घर / परिवार संख्या', labelEn: 'Total Households', type: 'numeric', section: 'general' },
  { key: 'totalPopulation', label: 'कुल जनसंख्या', labelEn: 'Total Population', type: 'numeric', section: 'general' },
  { key: 'scPopulation', label: 'अनुसूचित जाति (SC) की संख्या', labelEn: 'SC Population', type: 'numeric', section: 'general' },
  { key: 'stPopulation', label: 'अनुसूचित जनजाति (ST) की संख्या', labelEn: 'ST Population', type: 'numeric', section: 'general' },
  { key: 'totalSchools', label: 'कुल स्कूल संख्या', labelEn: 'Total Schools', type: 'numeric', section: 'general' },
  { key: 'totalAnganwadi', label: 'कुल आंगनबाड़ी केंद्र संख्या', labelEn: 'Total Anganwadi Centers', type: 'numeric', section: 'general' },
  { key: 'totalHealthFacilities', label: 'कुल स्वास्थ्य केंद्र', labelEn: 'Total Health Facilities', type: 'numeric', section: 'general' },
  { key: 'totalHostels', label: 'कुल आश्रम/छात्रावास', labelEn: 'Total Hostels', type: 'numeric', section: 'general' },
  { key: 'totalAgriculturalLand', label: 'कुल कृषि भूमि (एकड़)', labelEn: 'Total Agricultural Land (acres)', type: 'numeric', section: 'general' },
  { key: 'irrigatedLand', label: 'सिंचित भूमि (एकड़)', labelEn: 'Irrigated Land (acres)', type: 'numeric', section: 'general' },
  { key: 'puccaHouses', label: 'पक्के मकान', labelEn: 'Pucca Houses', type: 'numeric', section: 'general' },
  { key: 'rawHouses', label: 'कच्चे मकान', labelEn: 'Raw/Kachha Houses', type: 'numeric', section: 'general' },
  { key: 'fairPriceShop', label: 'शासकीय उचित मूल्य की दुकान', labelEn: 'Fair Price Shop', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'mobileNetwork', label: 'मोबाइल नेटवर्क उपलब्ध', labelEn: 'Mobile Network Available', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'electricity', label: 'बिजली उपलब्ध', labelEn: 'Electricity Available', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'road', label: 'पक्की सड़क से जुड़ा', labelEn: 'Connected by Pucca Road', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'tapWater', label: 'नल जल उपलब्ध', labelEn: 'Tap Water Available', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'odf', label: 'ODF (खुले में शौचमुक्त)', labelEn: 'Open Defecation Free', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'solarLight', label: 'सोलर लाइट उपलब्ध', labelEn: 'Solar Light Available', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'rainCutoff', label: 'बरसात में कटऑफ', labelEn: 'Monsoon Cutoff', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'banking', label: 'बैंकिंग सुविधा', labelEn: 'Banking Facility', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
  { key: 'vet', label: 'पशु चिकित्सा केंद्र', labelEn: 'Veterinary Center', type: 'categorical', options: ['हाँ', 'नहीं'], section: 'general' },
];
