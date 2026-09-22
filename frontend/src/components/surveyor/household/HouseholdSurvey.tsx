import React, { useMemo, useState } from "react";
import HouseholdForm from "./HouseholdForm";

import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Search,
} from "lucide-react";

export interface HouseholdItem {
  houseNumber: number;
  isCompleted: boolean;
  headName?: string;
  data?: any;
}

interface HouseholdSurveyProps {
  villageName: string;
  blockName: string;
  panchayatName: string;

  households: HouseholdItem[];

  surveyorName?: string;

  onBack: () => void;

  onHouseholdSave: (
    houseNumber: number,
    data: any
  ) => void;

  onHouseholdCountSubmit: (
    count: number
  ) => void;
}

/* =========================================================
   HOUSEHOLD SECTION CONFIG
========================================================= */

const HOUSEHOLD_SECTION_IDS = [
  "general",
  "demography",
  "documents",
  "women",
  "disability",
  "education",
  "employment",
  "housing",
  "health",
  "shg",
  "other",
] as const;

const TOTAL_SECTIONS =
  HOUSEHOLD_SECTION_IDS.length;

/* =========================================================
   GET COMPLETED SECTION COUNT
========================================================= */

const getCompletedSectionCount = (
  data: any
): number => {
  if (!data) return 0;

  return HOUSEHOLD_SECTION_IDS.filter(
    (sectionId) =>
      Boolean(data[`${sectionId}Completed`])
  ).length;
};

const HouseholdSurvey: React.FC<
  HouseholdSurveyProps
> = ({
  villageName,
  blockName,
  panchayatName,
  households,
  surveyorName = "सर्वेक्षक",
  onBack,
  onHouseholdSave,
  onHouseholdCountSubmit,
}) => {
  // =======================================================
  // ACTIVE HOUSE
  // =======================================================

  const [activeHouse, setActiveHouse] =
    useState<number | null>(null);

  // =======================================================
  // FAMILY COUNT
  // =======================================================

  const [familyCount, setFamilyCount] =
    useState("");

  // =======================================================
  // SEARCH
  // =======================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  // =======================================================
  // OVERALL HOUSEHOLD PROGRESS
  // =======================================================

  const completedHouseholds =
    households.filter(
      (house) => house.isCompleted
    ).length;

  const pendingHouseholds =
    households.length - completedHouseholds;

  const overallProgress =
    households.length > 0
      ? Math.round(
          (completedHouseholds /
            households.length) *
            100
        )
      : 0;

  // =======================================================
  // FILTER HOUSEHOLDS
  // =======================================================

  const filteredHouseholds = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return households;
    }

    return households.filter((house) => {
      const houseNumber =
        String(house.houseNumber);

      const headName =
        house.headName
          ?.toLowerCase()
          .trim() ?? "";

      return (
        houseNumber.includes(query) ||
        headName.includes(query)
      );
    });
  }, [households, searchQuery]);

  // =======================================================
  // ACTIVE HOUSE DATA
  // =======================================================

  const activeHouseData =
    activeHouse !== null
      ? households.find(
          (house) =>
            house.houseNumber === activeHouse
        )
      : undefined;

  // =======================================================
  // START SURVEY
  // =======================================================

  const handleStartSurvey = () => {
    const count = Number(familyCount);

    if (!count || count <= 0) {
      return;
    }

    onHouseholdCountSubmit(count);
  };

  // =======================================================
  // HOUSEHOLD FORM
  // =======================================================

  if (activeHouse !== null) {
    return (
      <HouseholdForm
        houseNumber={activeHouse}
        villageName={villageName}
        blockName={blockName}
        panchayatName={panchayatName}
        surveyorName={surveyorName}
        existingData={activeHouseData?.data}
        onBack={() => setActiveHouse(null)}
        onComplete={(data) => {
          onHouseholdSave(
            activeHouse,
            data
          );

          setActiveHouse(null);
        }}
      />
    );
  }

  // =======================================================
  // MAIN SCREEN
  // =======================================================

  return (
    <div className="space-y-4">

      {/* ===================================================
          VILLAGE HEADER
      ==================================================== */}

      <div className="bg-white border border-slate-900 rounded-xl px-5 py-3">

        <div className="flex items-center justify-between gap-4">

          <div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold">
              हाउसहोल्ड सर्वे
            </span>

            <h1 className="text-xl font-bold text-slate-900 mt-1">
              {villageName}
            </h1>

            <p className="text-xs text-slate-500 mt-0.5">
              {panchayatName} • {blockName}
            </p>

          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            ग्राम मेनू
          </button>

        </div>

      </div>

      {/* ===================================================
          MAIN SECTION
      ==================================================== */}

      <div className="bg-white border border-slate-900 rounded-xl p-5">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-5">

          <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold">
            सर्वे प्रगति
          </span>

          <h2 className="text-xl font-bold text-slate-900 mt-1">
            हाउसहोल्ड सर्वे
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            जिस मकान / परिवार की जानकारी दर्ज करनी है, उस पर क्लिक करें।
          </p>

        </div>

        {/* =================================================
            FAMILY COUNT
        ================================================== */}

        {households.length === 0 && (

          <div className="max-w-2xl">

            <div className="border border-slate-200 rounded-xl bg-slate-50 p-4">

              <h3 className="text-base font-bold text-slate-900">
                कुल कितने परिवार हैं?
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                सर्वे शुरू करने के लिए इस ग्राम में कुल परिवारों की संख्या दर्ज करें।
              </p>

              <div className="mt-4">

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  कुल परिवारों की संख्या
                </label>

                <div className="flex gap-2">

                  <input
                    type="number"
                    min={1}
                    value={familyCount}
                    onChange={(e) =>
                      setFamilyCount(
                        e.target.value
                      )
                    }
                    placeholder="उदाहरण: 25"
                    className="flex-1 px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  />

                  <button
                    type="button"
                    onClick={handleStartSurvey}
                    disabled={
                      !familyCount ||
                      Number(familyCount) <= 0
                    }
                    className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                      familyCount &&
                      Number(familyCount) > 0
                        ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    सर्वे शुरू करें →
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            HOUSEHOLD LIST
        ================================================== */}

        {households.length > 0 && (
          <>

            {/* =================================================
                SUMMARY
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

              {/* TOTAL */}

              <div className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50">

                <p className="text-xs text-slate-500">
                  कुल परिवार
                </p>

                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {households.length}
                </p>

              </div>

              {/* COMPLETE */}

              <div className="border border-emerald-200 rounded-lg px-4 py-3 bg-emerald-50">

                <p className="text-xs text-emerald-700">
                  पूर्ण
                </p>

                <p className="text-xl font-bold text-emerald-800 mt-0.5">
                  {completedHouseholds}
                </p>

              </div>

              {/* PENDING */}

              <div className="border border-amber-200 rounded-lg px-4 py-3 bg-amber-50">

                <p className="text-xs text-amber-700">
                  लंबित
                </p>

                <p className="text-xl font-bold text-amber-800 mt-0.5">
                  {pendingHouseholds}
                </p>

              </div>

            </div>

            {/* =================================================
                OVERALL PROGRESS
            ================================================== */}

            <div className="mb-5">

              <div className="flex items-center justify-between mb-1.5">

                <span className="text-xs font-semibold text-slate-600">
                  कुल सर्वे प्रगति
                </span>

                <span className="text-xs font-bold text-slate-800">
                  {completedHouseholds} /{" "}
                  {households.length} परिवार
                  {" • "}
                  {overallProgress}%
                </span>

              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />

              </div>

            </div>

            {/* =================================================
                SEARCH
            ================================================== */}

            <div className="mb-4">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="मकान नंबर या परिवार मुखिया खोजें..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />

              </div>

              {searchQuery.trim() && (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {filteredHouseholds.length} परिवार मिले
                </p>
              )}

            </div>

            {/* =================================================
                NO SEARCH RESULT
            ================================================== */}

            {filteredHouseholds.length === 0 && (
              <div className="border border-slate-200 rounded-xl bg-slate-50 p-6 text-center">

                <p className="text-sm font-semibold text-slate-700">
                  कोई परिवार नहीं मिला
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  मकान नंबर या परिवार मुखिया का नाम दोबारा जाँचें।
                </p>

              </div>
            )}

            {/* =================================================
                HOUSEHOLD CARDS
            ================================================== */}

            {filteredHouseholds.length > 0 && (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {filteredHouseholds.map(
                  (house) => {

                    const completedSections =
                      getCompletedSectionCount(
                        house.data
                      );

                    const sectionProgress =
                      Math.round(
                        (completedSections /
                          TOTAL_SECTIONS) *
                          100
                      );

                    const isCompleted =
                      house.isCompleted;

                    return (
                      <button
                        key={house.houseNumber}
                        type="button"
                        onClick={() =>
                          setActiveHouse(
                            house.houseNumber
                          )
                        }
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-white border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >

                        {/* TOP */}

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex items-center gap-3 min-w-0">

                            <div
                              className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-900"
                              }`}
                            >
                              {house.houseNumber}
                            </div>

                            <div className="min-w-0">

                              <h3 className="text-[15px] font-bold text-slate-900">
                                मकान #{house.houseNumber}
                              </h3>

                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {house.headName ||
                                  "परिवार मुखिया दर्ज नहीं है"}
                              </p>

                            </div>

                          </div>

                          <div className="shrink-0">

                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <CircleAlert className="w-5 h-5 text-slate-300" />
                            )}

                          </div>

                        </div>

                        {/* STATUS */}

                        <div className="mt-3">

                          <div className="flex items-center justify-between mb-1">

                            <span
                              className={`text-[11px] font-semibold ${
                                isCompleted
                                  ? "text-emerald-700"
                                  : "text-slate-500"
                              }`}
                            >
                              {isCompleted
                                ? "✓ सर्वे पूर्ण"
                                : completedSections > 0
                                ? `${completedSections}/${TOTAL_SECTIONS} अनुभाग पूर्ण • जारी रखें`
                                : "सर्वे शुरू करें"}
                            </span>

                            <span className="text-[10px] font-bold text-slate-500">
                              {sectionProgress}%
                            </span>

                          </div>

                          {/* SECTION PROGRESS */}

                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">

                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-blue-500"
                              }`}
                              style={{
                                width: `${sectionProgress}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* ACTION */}

                        <div className="flex justify-end mt-2">

                          <span className="text-[11px] text-slate-400">
                            {isCompleted
                              ? "देखें / संपादित करें →"
                              : "खोलें →"}
                          </span>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
};

export default HouseholdSurvey;