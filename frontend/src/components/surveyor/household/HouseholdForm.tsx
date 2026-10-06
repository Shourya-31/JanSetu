import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import HouseholdGeneralInformation from "./general/HouseholdGeneralInformation";
import HouseholdDemography from "./demography/HouseholdDemography";
import HouseholdDocumentsSchemes from "./documents/HouseholdDocumentsSchemes";
import HouseholdWomenSocialSecurity from "./women/HouseholdWomenSocialSecurity";
import HouseholdDisabilityDocuments from "./disability/HouseholdDisabilityDocuments";
import HouseholdChildrenEducation from "./education/HouseholdChildrenEducation";
import HouseholdAgricultureEmployment from "./employment/HouseholdAgricultureEmployment";
import HouseholdHousingFacilities from "./housing/HouseholdHousingFacilities";
import HouseholdHealth from "./health/HouseholdHealth";
import HouseholdSHG from "./shg/HouseholdSHG";
import HouseholdOtherInformation from "./other/HouseholdOtherInformation";

interface HouseholdFormProps {
  houseNumber: number;
  villageName: string;
  blockName: string;
  panchayatName: string;
  surveyorName: string;

  existingData?: any;

  onBack: () => void;
  onSave: (data: any) => void;
  onComplete: (data: any) => void;
}

const REQUIRED_SECTIONS = [
  "generalCompleted",
  "demographyCompleted",
  "documentsCompleted",
  "womenCompleted",
  "disabilityCompleted",
  "educationCompleted",
  "employmentCompleted",
  "housingCompleted",
  "healthCompleted",
  "shgCompleted",
  "otherCompleted",
];

const HouseholdForm: React.FC<HouseholdFormProps> = ({
  houseNumber,
  villageName,
  blockName,
  panchayatName,
  surveyorName,
  existingData,
  onBack,
  onSave,
  onComplete,
}) => {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<any>(
    existingData ?? {}
  );

  // =========================================================
  // REFS
  // =========================================================

  const generalRef = useRef<any>(null);
  const demographyRef = useRef<any>(null);
  const documentsRef = useRef<any>(null);
  const womenRef = useRef<any>(null);
  const disabilityRef = useRef<any>(null);
  const educationRef = useRef<any>(null);
  const employmentRef = useRef<any>(null);
  const housingRef = useRef<any>(null);
  const healthRef = useRef<any>(null);
  const shgRef = useRef<any>(null);
  const otherRef = useRef<any>(null);

  // =========================================================
  // LOAD EXISTING DATA
  // =========================================================

  useEffect(() => {
    setFormData(existingData ?? {});
  }, [existingData]);

  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  const goToPage = (page: 1 | 2) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // HELPER
  // =========================================================

  const isFilled = (value: any): boolean => {
    if (
      value === null ||
      value === undefined
    ) {
      return false;
    }

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "object") {
      return Object.values(value).some((item) =>
        isFilled(item)
      );
    }

    // number / boolean
    return true;
  };

  const hasAnyData = (
    data: any,
    keys: string[]
  ): boolean => {
    return keys.some((key) =>
      isFilled(data?.[key])
    );
  };

  // =========================================================
  // COLLECT DATA FROM ALL 11 SECTIONS
  // =========================================================

  const collectAllData = () => {
    const generalData =
      generalRef.current?.getData?.() ?? {};

    const demographyData =
      demographyRef.current?.getData?.() ?? {};

    const documentsData =
      documentsRef.current?.getData?.() ?? {};

    const womenData =
      womenRef.current?.getData?.() ?? {};

    const disabilityData =
      disabilityRef.current?.getData?.() ?? {};

    const educationData =
      educationRef.current?.getData?.() ?? {};

    const employmentData =
      employmentRef.current?.getData?.() ?? {};

    const housingData =
      housingRef.current?.getData?.() ?? {};

    const healthData =
      healthRef.current?.getData?.() ?? {};

    const shgData =
      shgRef.current?.getData?.() ?? {};

    const otherData =
      otherRef.current?.getData?.() ?? {};

    return {
      ...formData,

      ...generalData,
      ...demographyData,
      ...documentsData,
      ...womenData,
      ...disabilityData,
      ...educationData,
      ...employmentData,
      ...housingData,
      ...healthData,
      ...shgData,
      ...otherData,

      houseNumber,
      villageName,
      blockName,
      panchayatName,
      surveyorName,
    };
  };

  // =========================================================
  // FINAL SAVE
  // =========================================================

  const handleComplete = () => {
    const collectedData = collectAllData();

    // -------------------------------------------------------
    // SECTION 1
    // -------------------------------------------------------

    const generalCompleted = hasAnyData(
      collectedData,
      [
        "headName",
        "mobile",
        "surveyDate",
        "surveyorName",
      ]
    );

    // -------------------------------------------------------
    // SECTION 2
    // -------------------------------------------------------

    const demographyCompleted = hasAnyData(
      collectedData,
      [
        "caste",
        "isBpl",
        "elderly",
        "children",
        "women",
      ]
    );

    // -------------------------------------------------------
    // SECTION 3
    // -------------------------------------------------------

    const documentsCompleted = hasAnyData(
      collectedData,
      [
        "rationCard",
        "noAadhaarMembers",
        "aadhaarEkyc",
        "noCasteCertificateMembers",
        "noAyushmanMembers",
        "noVoterIdMembers",
        "mnregaJobCard",
        "noShramikCardMembers",
        "janDhanAccount",
        "kcc",
        "forestRightsPatta",
        "marriagecertificate",
        "bankName",
      ]
    );

    // -------------------------------------------------------
    // SECTION 4
    // -------------------------------------------------------

    const womenCompleted = hasAnyData(
      collectedData,
      [
        "jsy",
        "pmmvy",
        "mahtariVandana",
        "widowPension",
        "disabilityPension",
      ]
    );

    // -------------------------------------------------------
    // SECTION 5
    // -------------------------------------------------------

    const disabilityCompleted = hasAnyData(
      collectedData,
      [
        "needsAssistiveDevice",
        "assistanceTypes",
        "otherAssistance",
        "deathInLastYear",
        "deathCertificateReceived",
        "pmGaribKalyanRation",
      ]
    );

    // -------------------------------------------------------
    // SECTION 6
    // -------------------------------------------------------

    const educationCompleted = hasAnyData(
      collectedData,
      [
        "childrenWithoutBirthCertificate",
        "vaccinationStatus",
        "anganwadiMeal",
        "childrenSchoolStatus",
        "schoolNotGoingReason",
        "otherSchoolReason",
      ]
    );

    // -------------------------------------------------------
    // SECTION 7
    // -------------------------------------------------------

    const employmentCompleted = hasAnyData(
      collectedData,
      [
        "unemployedMembers",
        "pmKisan",
        "miningEmployment",
        "annualIncome",
        "mainIncomeSource",
        "livestockSource",
        "otherLivestockSource",
        "animalEmployment",
      ]
    );

    // -------------------------------------------------------
    // SECTION 8
    // -------------------------------------------------------

    const housingCompleted = hasAnyData(
      collectedData,
      [
        "houseType",
        "housingSchemeBenefit",
        "toiletStatus",
        "tapWaterConnection",
        "drinkingWaterSource",
        "electricityConnection",
        "solarEnergy",
      ]
    );

    // -------------------------------------------------------
    // SECTION 9
    // -------------------------------------------------------

    const healthCompleted = hasAnyData(
      collectedData,
      [
        "familyDisease",
        "freeMedicines",
      ]
    );

    // -------------------------------------------------------
    // SECTION 10
    // -------------------------------------------------------

    const shgCompleted = hasAnyData(
      collectedData,
      [
        "shgMember",
      ]
    );

    // -------------------------------------------------------
    // SECTION 11
    // -------------------------------------------------------

    const otherCompleted = hasAnyData(
      collectedData,
      [
        "priorityNeed1",
        "priorityNeed2",
        "priorityNeed3",
        "eligibleSchemeNotReceived",
        "schemeBenefitName",
      ]
    );

    // =======================================================
    // FINAL DATA
    // =======================================================

    const finalData = {
      ...collectedData,

      generalCompleted,
      demographyCompleted,
      documentsCompleted,
      womenCompleted,
      disabilityCompleted,
      educationCompleted,
      employmentCompleted,
      housingCompleted,
      healthCompleted,
      shgCompleted,
      otherCompleted,
    };

    // =======================================================
    // COMPLETION COUNT
    // =======================================================

    const completedCount =
      REQUIRED_SECTIONS.filter(
        (key) => Boolean(finalData[key])
      ).length;

    const allSectionsCompleted =
      completedCount ===
      REQUIRED_SECTIONS.length;

    // =======================================================
    // SAVE OBJECT
    // =======================================================

    const dataToSave = {
      ...finalData,

      completedSections: completedCount,
      totalSections: REQUIRED_SECTIONS.length,

      surveyStatus: allSectionsCompleted
        ? "completed"
        : "partial",

      isCompleted: allSectionsCompleted,
    };

    // Update local state
    setFormData(dataToSave);

    // =======================================================
    // ACTUAL SAVE
    // =======================================================

    onSave(dataToSave);

    // =======================================================
    // COMPLETE
    // =======================================================

    if (allSectionsCompleted) {
      onComplete(dataToSave);
      return;
    }

    // =======================================================
    // PARTIAL
    // =======================================================

    alert(
      `सर्वे आंशिक रूप से सहेजा गया है। ${completedCount}/11 अनुभाग पूरे हैं।`
    );

    onBack();
  };

  // =========================================================
  // EXISTING PROGRESS
  // =========================================================

  const completedCount =
    REQUIRED_SECTIONS.filter(
      (key) => Boolean(formData?.[key])
    ).length;

  const allSectionsCompleted =
    completedCount ===
    REQUIRED_SECTIONS.length;

  const sectionHeading =
    "text-lg font-bold text-slate-900 mt-8 mb-4";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">

        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              वापस
            </button>

            <div className="text-center">

              <h1 className="text-xl font-bold text-slate-900">
                परिवार सर्वेक्षण
              </h1>

              <p className="text-sm text-slate-600 mt-1">
                मकान क्रमांक: {houseNumber}
              </p>

            </div>

            <div className="text-right">

              <p className="text-xs text-slate-500">
                पृष्ठ
              </p>

              <p className="text-sm font-bold text-slate-900">
                {currentPage} / 2
              </p>

            </div>

          </div>

          {/* =================================================
              PROGRESS
          ================================================= */}

          <div className="px-5 lg:px-6 py-4 border-b border-slate-200">

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm font-semibold text-slate-700">
                सर्वे प्रगति
              </span>

              <span
                className={`text-sm font-bold ${
                  allSectionsCompleted
                    ? "text-green-600"
                    : "text-slate-600"
                }`}
              >
                {completedCount}/11
              </span>

            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

              <div
                className={`h-full transition-all ${
                  allSectionsCompleted
                    ? "bg-green-500"
                    : "bg-slate-900"
                }`}
                style={{
                  width: `${(completedCount / 11) * 100}%`,
                }}
              />

            </div>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <div className="px-5 lg:px-8 py-6">

            {/* =================================================
                PAGE 1
            ================================================= */}

            {currentPage === 1 && (
              <div>

                {/* 1 */}

                <h2 className={sectionHeading}>
                  1. परिवार की सामान्य जानकारी
                </h2>

                <HouseholdGeneralInformation
                  ref={generalRef}
                  houseNumber={houseNumber}
                  surveyorName={surveyorName}
                  existingData={formData}
                />

                {/* 2 */}

                <h2 className={sectionHeading}>
                  2. परिवार की जनसांख्यिकी
                </h2>

                <HouseholdDemography
                  ref={demographyRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 3 */}

                <h2 className={sectionHeading}>
                  3. दस्तावेज एवं शासकीय योजनाएँ
                </h2>

                <HouseholdDocumentsSchemes
                  ref={documentsRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 4 */}

                <h2 className={sectionHeading}>
                  4. महिला, मातृत्व एवं सामाजिक सुरक्षा योजनाएँ
                </h2>

                <HouseholdWomenSocialSecurity
                  ref={womenRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 5 */}

                <h2 className={sectionHeading}>
                  5. दिव्यांग सहायता एवं नागरिक दस्तावेज
                </h2>

                <HouseholdDisabilityDocuments
                  ref={disabilityRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 6 */}

                <h2 className={sectionHeading}>
                  6. बच्चे, आंगनवाड़ी एवं शिक्षा
                </h2>

                <HouseholdChildrenEducation
                  ref={educationRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* PAGE 1 */}

                <div className="flex justify-end mt-10 pt-6 border-t border-slate-200">

                  <button
                    type="button"
                    onClick={() => goToPage(2)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                  >
                    अगले पृष्ठ पर जाएँ
                    <ArrowRight size={18} />
                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                PAGE 2
            ================================================= */}

            {currentPage === 2 && (
              <div>

                {/* 7 */}

                <h2 className={sectionHeading}>
                  7. कृषि, रोजगार एवं आय
                </h2>

                <HouseholdAgricultureEmployment
                  ref={employmentRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 8 */}

                <h2 className={sectionHeading}>
                  8. आवास एवं घरेलू मूलभूत सुविधाएँ
                </h2>

                <HouseholdHousingFacilities
                  ref={housingRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 9 */}

                <h2 className={sectionHeading}>
                  9. स्वास्थ्य
                </h2>

                <HouseholdHealth
                  ref={healthRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 10 */}

                <h2 className={sectionHeading}>
                  10. महिला स्वयं सहायता समूह
                </h2>

                <HouseholdSHG
                  ref={shgRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* 11 */}

                <h2 className={sectionHeading}>
                  11. परिवार की प्रमुख आवश्यकताएँ / समस्या
                </h2>

                <HouseholdOtherInformation
                  ref={otherRef}
                  houseNumber={houseNumber}
                  existingData={formData}
                />

                {/* PAGE 2 BUTTONS */}

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">

                  <button
                    type="button"
                    onClick={() => goToPage(1)}
                    className="inline-flex items-center gap-2 px-5 py-3 border border-slate-900 text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft size={18} />
                    पिछला पृष्ठ
                  </button>

                  <button
                    type="button"
                    onClick={handleComplete}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-colors ${
                      allSectionsCompleted
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    सर्वे पूर्ण करें
                  </button>

                </div>

                {/* PARTIAL */}

                {!allSectionsCompleted && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">

                    <p className="text-sm text-amber-800">
                      अभी {completedCount}/11 अनुभाग पूरे हैं।
                      आप अभी भरे गए विवरण को सहेज सकते हैं।
                      बाकी जानकारी बाद में पूरी की जा सकती है।
                    </p>

                  </div>
                )}

                {/* COMPLETE */}

                {allSectionsCompleted && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">

                    <p className="text-sm font-semibold text-green-700">
                      ✓ सभी 11 अनुभाग पूरे हैं। सर्वे पूर्ण करने के लिए
                      नीचे दिए गए बटन पर क्लिक करें।
                    </p>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default HouseholdForm;