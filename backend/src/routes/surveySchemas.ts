const formText = (maxLength = 1000) => ({ type: 'string', maxLength });
const formTextArray = { type: 'array', maxItems: 500, items: formText() };
const countValue = {
  anyOf: [
    { type: 'integer', minimum: 0, maximum: 10000000 },
    { type: 'string', pattern: '^(|[0-9]{1,8})$' }
  ]
};

function objectWithFields(
  fields: string[],
  arrayFields: string[] = [],
  required = false
) {
  const properties: Record<string, unknown> = {};
  fields.forEach((field) => {
    properties[field] = arrayFields.includes(field) ? formTextArray : formText();
  });
  return {
    type: 'object',
    ...(required ? { required: fields } : {}),
    additionalProperties: false,
    properties
  };
}

function boundedJsonValue(depth: number): Record<string, unknown> {
  const variants: Record<string, unknown>[] = [
    { type: 'string', maxLength: 5000 },
    { type: 'number', minimum: -10000000, maximum: 10000000 },
    { type: 'boolean' },
    { type: 'null' }
  ];
  if (depth > 0) {
    const nestedValue = boundedJsonValue(depth - 1);
    variants.push(
      { type: 'array', maxItems: 500, items: nestedValue },
      {
        type: 'object', maxProperties: 256,
        propertyNames: { type: 'string', minLength: 1, maxLength: 100, pattern: '\\S' },
        additionalProperties: nestedValue
      }
    );
  }
  return { anyOf: variants };
}

export const boundedSurveyObjectSchema = {
  type: 'object', maxProperties: 256,
  propertyNames: { type: 'string', minLength: 1, maxLength: 100, pattern: '\\S' },
  additionalProperties: boundedJsonValue(5)
};

const villageGeneralFields = [
  'totalHouseholds', 'totalPopulation', 'scPopulation', 'stPopulation', 'totalAgriculturalLand',
  'totalSchools', 'totalAnganwadi', 'totalHealthFacilities', 'totalHostels', 'fairPriceShop',
  'mobileNetwork', 'electricity', 'road', 'roadconnectivity', 'tapWater', 'ponds', 'puccaHouses',
  'completedHouses', 'pendingHouses', 'odf', 'shopDistance', 'networkDistance', 'solarLight',
  'rainCutoff', 'tapWaterExcludedFamilies', 'vet', 'rawHouses', 'housingNotSanctioned', 'banking',
  'irrigatedLand'
];
const villageGeneralProperties: Record<string, unknown> = Object.fromEntries(
  villageGeneralFields.map((field) => [field, formText()])
);
villageGeneralProperties.roadReasons = formTextArray;

const anganbadiSchema = objectWithFields([
  'centerName', 'buildingAvailability', 'buildingCondition', 'operation', 'nutritionServices',
  'toiletCondition', 'drinkingWater', 'watersupply', 'electricity', 'nutritionGarden'
]);
const schoolSchema = objectWithFields([
  'schoolName', 'udiseCode', 'schoolType', 'building', 'buildingCondition', 'seatingArrangement',
  'toilets', 'drinkingWater', 'watersupply', 'electricity', 'ramp', 'sports', 'uniform', 'textbooks',
  'totalChildren', 'childrenWithoutAadhaar', 'childrenWithoutAPAAR', 'disabledChildren',
  'childrenNotAttendingSchool', 'dropoutChildren', 'dropoutReason', 'majorShortcoming', 'schoolNumber'
]);
const hostelSchema = objectWithFields(['facilityType', 'condition', 'washrooms']);
const healthFacilitySchema = objectWithFields([
  'healthCenterType', 'regularOperation', 'medicinesEquipment', 'medicalStaff', 'majorShortcoming'
]);
const waterSchema = objectWithFields([
  'tapWaterAvailability', 'summerWaterCondition', 'drinkingQuality', 'waterQualityProblem',
  'otherWaterQualityProblem', 'waterDistance', 'pipelineRequirement', 'waterTankRequirement'
]);
const employmentSchema = objectWithFields([
  'unemployedYouth', 'livelihoodActivities', 'migration', 'migrantPersons', 'migrationDestination',
  'migrationReason', 'migrationDuration', 'nearestITICollegeDistance', 'skillTraining', 'majorTraining',
  'employmentAfterTraining', 'requiredTraining1', 'requiredTraining2'
], ['livelihoodActivities']);
const womenGroupSchema = objectWithFields([
  'shgOperated', 'totalSHG', 'activeSHG', 'majorSHGActivities', 'shgSupport', 'bankingFacility',
  'nearestBankDistance', 'familyBankAccounts'
]);
const cleanlinessSchema = objectWithFields(['toiletAvailability', 'solidWasteManagement', 'drainageSystem']);
const pensionSchema = objectWithFields([
  'disabledEligible', 'disabledNotReceiving', 'widowEligible', 'widowNotReceiving',
  'elderlyEligible', 'elderlyNotReceiving'
]);
const developmentSchema = objectWithFields([
  'handpumpRequirement', 'borewellRequirement', 'solarPumpRequirement', 'solarStreetLightRequirement',
  'roadRequirement', 'otherInfrastructureRequirement', 'priorityWork1', 'priorityWork2', 'priorityWork3',
  'additionalRemarks'
]);

export const villageSurveySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    villageName: formText(200), block: formText(200), panchayat: formText(200), district: formText(200),
    ...villageGeneralProperties,
    anganbadiData: { type: 'array', maxItems: 500, items: anganbadiSchema },
    schoolData: { type: 'array', maxItems: 500, items: schoolSchema },
    hostelData: { type: 'array', maxItems: 500, items: hostelSchema },
    healthData: { type: 'array', maxItems: 500, items: healthFacilitySchema },
    waterData: waterSchema,
    employmentData: employmentSchema,
    ladiesData: womenGroupSchema,
    cleanlinessData: cleanlinessSchema,
    pensionData: pensionSchema,
    developmentData: developmentSchema
  }
};

export const villageProfileBodySchema = {
  type: 'object',
  required: ['block', 'panchayat', 'villageName'],
  additionalProperties: false,
  properties: {
    block: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    panchayat: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    villageName: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    totalPopulation: { type: 'integer', minimum: 0, maximum: 10000000 },
    totalHouseholds: { type: 'integer', minimum: 0, maximum: 10000000 },
    scCount: { type: 'integer', minimum: 0, maximum: 10000000 },
    stCount: { type: 'integer', minimum: 0, maximum: 10000000 },
    puccaHouses: { type: 'integer', minimum: 0, maximum: 10000000 },
    semiPuccaHouses: { type: 'integer', minimum: 0, maximum: 10000000 },
    kacchaHouses: { type: 'integer', minimum: 0, maximum: 10000000 },
    mineDistanceKm: { type: 'string', minLength: 1, maxLength: 200 },
    hasPuccaRoad: { type: 'string', minLength: 1, maxLength: 100 },
    monsoonCutOff: { type: 'string', minLength: 1, maxLength: 100 },
    schoolType: { type: 'string', minLength: 1, maxLength: 200 },
    hospitalType: { type: 'string', minLength: 1, maxLength: 200 },
    electrification: { type: 'string', minLength: 1, maxLength: 200 },
    hasAnganwadi: { type: 'string', minLength: 1, maxLength: 100 },
    odfStatus: { type: 'string', minLength: 1, maxLength: 100 },
    villagePhotos: { type: 'array', maxItems: 10, items: { type: 'string', maxLength: 1000 } },
    quality: boundedSurveyObjectSchema,
    gapMatrix: boundedSurveyObjectSchema,
    villageSurvey: villageSurveySchema
  }
};

const householdTextFields = [
  'headName', 'surveyDate', 'surveyorName', 'caste', 'isBpl', 'isBPL', 'elderly', 'children', 'women',
  'rationCard', 'aadhaarEkyc', 'mnregaJobCard', 'janDhanAccount', 'kcc', 'forestRightsPatta',
  'marriagecertificate', 'bankName', 'jsy', 'pmmvy', 'mahtariVandana', 'widowPension',
  'disabilityPension', 'needsAssistiveDevice', 'otherAssistance', 'deathInLastYear',
  'deathCertificateReceived', 'pmGaribKalyanRation', 'childrenWithoutBirthCertificate',
  'vaccinationStatus', 'anganwadiMeal', 'childrenSchoolStatus', 'otherSchoolReason', 'pmKisan',
  'miningEmployment', 'annualIncome', 'mainIncomeSource', 'livestockSource', 'otherLivestockSource',
  'animalEmployment', 'houseType', 'housingSchemeBenefit', 'toiletStatus', 'tapWaterConnection',
  'drinkingWaterSource', 'electricityConnection', 'solarEnergy', 'familyDisease', 'freeMedicines',
  'shgMember', 'priorityNeed1', 'priorityNeed2', 'priorityNeed3', 'eligibleSchemeNotReceived',
  'schemeBenefitName', 'trackingId', 'block', 'blockName', 'panchayat', 'panchayatName', 'incomeSource',
  'isMiningWorker', 'hasToilet', 'hasTapWater'
];
const householdArrayFields = ['assistanceTypes', 'schoolNotGoingReason'];
const householdCountFields = [
  'totalMembers', 'eldersCount', 'childrenCount', 'unemployedCount', 'unemployedMembers',
  'noAadhaarMembers', 'noCasteCertificateMembers', 'noAyushmanMembers', 'noVoterIdMembers',
  'noShramikCardMembers', 'missingAadhaar', 'missingCasteCert', 'missingAyushman', 'missingVoterId'
];
export const householdAnswerSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    villageName: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    houseNumber: { type: 'integer', minimum: 1, maximum: 10000000 },
    version: { type: 'integer', minimum: 1 },
    mobile: { type: 'string', maxLength: 32, pattern: '^[0-9+() -]*$' },
    ...Object.fromEntries(householdTextFields.map((field) => [field, formText()])),
    ...Object.fromEntries(householdCountFields.map((field) => [field, countValue])),
    ...Object.fromEntries(householdArrayFields.map((field) => [field, formTextArray])),
    generalCompleted: { type: 'boolean' },
    demographyCompleted: { type: 'boolean' },
    documentsCompleted: { type: 'boolean' },
    womenCompleted: { type: 'boolean' },
    disabilityCompleted: { type: 'boolean' },
    educationCompleted: { type: 'boolean' },
    employmentCompleted: { type: 'boolean' },
    housingCompleted: { type: 'boolean' },
    healthCompleted: { type: 'boolean' },
    shgCompleted: { type: 'boolean' },
    otherCompleted: { type: 'boolean' }
  }
};

const requiredCompletions = [
  'generalCompleted', 'demographyCompleted', 'documentsCompleted', 'womenCompleted',
  'disabilityCompleted', 'educationCompleted', 'employmentCompleted', 'housingCompleted',
  'healthCompleted', 'shgCompleted', 'otherCompleted'
];
const requiredHouseholdFields = [
  'headName', 'mobile', 'surveyDate', 'surveyorName', 'caste', 'isBpl', 'elderly', 'children', 'women',
  'rationCard', 'noAadhaarMembers', 'aadhaarEkyc', 'noCasteCertificateMembers', 'noAyushmanMembers',
  'noVoterIdMembers', 'mnregaJobCard', 'noShramikCardMembers', 'janDhanAccount', 'kcc',
  'forestRightsPatta', 'marriagecertificate', 'bankName', 'jsy', 'pmmvy', 'mahtariVandana',
  'widowPension', 'disabilityPension', 'needsAssistiveDevice', 'assistanceTypes', 'otherAssistance',
  'deathInLastYear', 'deathCertificateReceived', 'pmGaribKalyanRation', 'childrenWithoutBirthCertificate',
  'vaccinationStatus', 'anganwadiMeal', 'childrenSchoolStatus', 'schoolNotGoingReason', 'otherSchoolReason',
  'unemployedMembers', 'pmKisan', 'miningEmployment', 'annualIncome', 'mainIncomeSource',
  'livestockSource', 'otherLivestockSource', 'animalEmployment', 'houseType', 'housingSchemeBenefit',
  'toiletStatus', 'tapWaterConnection', 'drinkingWaterSource', 'electricityConnection', 'solarEnergy',
  'familyDisease', 'freeMedicines', 'shgMember', 'priorityNeed1', 'priorityNeed2', 'priorityNeed3',
  'eligibleSchemeNotReceived', 'schemeBenefitName'
];
const householdSubmissionDataSchema = {
  ...householdAnswerSchema,
  required: [...requiredCompletions, ...requiredHouseholdFields],
  properties: {
    ...householdAnswerSchema.properties,
    ...Object.fromEntries(requiredCompletions.map((field) => [field, { const: true }]))
  }
};

export const householdSubmissionEnvelopeSchema = {
  type: 'object',
  additionalProperties: false,
  anyOf: [
    { required: ['villageName', 'houseNumber', 'data'] },
    { required: ['data'], properties: { data: { type: 'object', required: ['villageName', 'houseNumber'] } } }
  ],
  properties: {
    villageName: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    houseNumber: { type: 'integer', minimum: 1, maximum: 10000000 },
    data: householdSubmissionDataSchema
  }
};