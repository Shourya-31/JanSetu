import React, { useState } from "react";
import { CheckCircle2, LogOut, ArrowLeft } from "lucide-react";

import {
  CENSUS_HIERARCHY,
  type Block,
  type Village,
} from "../../data/narayanpurHierarchy";

import { VillageSurveyForm } from "./village-survey/VillageSurveyForm";

import HouseholdSurvey from "./household/HouseholdSurvey";
import type { HouseholdItem } from "./household/HouseholdSurvey";

interface SurveyorDashboardProps {
  surveyorId: string;

  // ग्राम प्रोफाइल / परिवार प्रोफाइल
  surveyMode: "village" | "household";

  onLogout: () => void;
}

export const SurveyorDashboard: React.FC<SurveyorDashboardProps> = ({
  surveyorId,
  surveyMode,
  onLogout,
}) => {
  // =========================================================
  // LOCATION STATE
  // =========================================================

  const [selectedBlockId, setSelectedBlockId] = useState<string>("");

  const [selectedPanchayatId, setSelectedPanchayatId] =
    useState<string>("");

  const [selectedVillage, setSelectedVillage] =
    useState<Village | null>(null);

  // =========================================================
  // VIEW STATE
  // =========================================================

  const [viewMode, setViewMode] = useState<
    "selection" | "village_menu" | "village_survey" | "household_survey"
  >("selection");

  // =========================================================
  // LOCAL HIERARCHY
  // Backend की जरूरत नहीं
  // =========================================================

  const hierarchy: Block[] = CENSUS_HIERARCHY;

  // =========================================================
  // LOCAL SURVEY DATA
  // =========================================================

  const [villageData, setVillageData] =
    useState<Record<string, unknown> | null>(null);

  const [households, setHouseholds] =
    useState<HouseholdItem[]>([]);

  const [dataError, setDataError] = useState("");

  const [dataLoading, setDataLoading] = useState(false);

  // =========================================================
  // SELECTED BLOCK
  // =========================================================

  const selectedBlock = hierarchy.find(
    (block) => block.id === selectedBlockId
  );

  // =========================================================
  // PANCHAYAT OPTIONS
  // =========================================================

  const panchayatOptions =
    selectedBlock?.panchayats ?? [];

  // =========================================================
  // SELECTED PANCHAYAT
  // =========================================================

  const selectedPanchayat =
    panchayatOptions.find(
      (panchayat) =>
        panchayat.id === selectedPanchayatId
    );

  // =========================================================
  // VILLAGE OPTIONS
  // =========================================================

  const villageOptions =
    selectedPanchayat?.villages ?? [];

  // =========================================================
  // RESET TO SELECTION
  // =========================================================

  const resetToSelection = () => {
    setSelectedVillage(null);
    setVillageData(null);
    setHouseholds([]);

    setSelectedBlockId("");
    setSelectedPanchayatId("");

    setDataError("");
    setViewMode("selection");
  };

  // =========================================================
  // BLOCK CHANGE
  // =========================================================

  const handleBlockChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedBlockId(e.target.value);

    setSelectedPanchayatId("");
    setSelectedVillage(null);

    setVillageData(null);
    setHouseholds([]);

    setDataError("");
    setViewMode("selection");
  };

  // =========================================================
  // PANCHAYAT CHANGE
  // =========================================================

  const handlePanchayatChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPanchayatId(e.target.value);

    setSelectedVillage(null);

    setVillageData(null);
    setHouseholds([]);

    setDataError("");
    setViewMode("selection");
  };

  // =========================================================
  // VILLAGE SELECT
  // Backend API नहीं
  // =========================================================

  const handleVillageSelect = (
    village: Village
  ) => {
    setSelectedVillage(village);

    setDataError("");
    setVillageData(null);

    /*
     * अभी frontend-only development है।
     *
     * इसलिए village select करते समय कोई API call नहीं होगा।
     */

    if (surveyMode === "village") {
      // ग्राम प्रोफाइल
      setViewMode("village_survey");
    } else {
      // परिवार प्रोफाइल
      setViewMode("household_survey");
    }
  };

  // =========================================================
  // VILLAGE SURVEY SAVE
  // Local state only
  // =========================================================

  const handleVillageComplete = async (
    data: Record<string, unknown>
  ) => {
    setDataError("");
    setDataLoading(true);

    try {
      const finalData = {
        ...data,

        district: "नारायणपुर",

        villageName:
          selectedVillage?.nameHindi ?? "",

        block:
          selectedBlock?.blockName ?? "",

        panchayat:
          selectedPanchayat?.name ?? "",

        surveyorName: surveyorId,
      };

      // Local state में save
      setVillageData(finalData);

      /*
       * Backend बाद में integrate करेंगे।
       *
       * अभी सिर्फ frontend testing के लिए
       * data browser memory में रहेगा।
       */

      setViewMode("selection");
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : "ग्राम सर्वे सहेजा नहीं जा सका।"
      );
    } finally {
      setDataLoading(false);
    }
  };

  // =========================================================
  // HOUSEHOLD COUNT SUBMIT
  // Backend नहीं
  // =========================================================

  const handleHouseholdCountSubmit = async (
    count: number
  ) => {
    if (!selectedVillage) return;

    setDataError("");
    setDataLoading(true);

    try {
      const newHouseholds: HouseholdItem[] =
        Array.from(
          { length: count },
          (_, index) => ({
            id: `local-${selectedVillage.id}-${index + 1}`,

            version: 1,

            houseNumber: index + 1,

            headName: "",

            isCompleted: false,

            data: {
              villageName:
                selectedVillage.nameHindi,

              block:
                selectedBlock?.blockName ?? "",

              panchayat:
                selectedPanchayat?.name ?? "",

              houseNumber: index + 1,

              surveyorName: surveyorId,
            },
          })
        );

      setHouseholds(newHouseholds);
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : "परिवार सूची तैयार नहीं हो सकी।"
      );

      throw error;
    } finally {
      setDataLoading(false);
    }
  };

  // =========================================================
  // HOUSEHOLD SAVE
  // Local state only
  // =========================================================

  const handleSaveHousehold = async (
    houseNumber: number,
    formData: Record<string, unknown>
  ) => {
    if (!selectedVillage) return;

    setDataError("");

    const requiredSections = [
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

    const isFullyCompleted =
      requiredSections.every(
        (key) => formData?.[key] === true
      );

    const surveyAnswers = {
      ...formData,

      villageName:
        selectedVillage.nameHindi,

      houseNumber,

      block:
        selectedBlock?.blockName ?? "",

      blockName:
        selectedBlock?.blockName ?? "",

      panchayat:
        selectedPanchayat?.name ?? "",

      panchayatName:
        selectedPanchayat?.name ?? "",

      surveyorName:
        formData.surveyorName ||
        surveyorId,
    };

    const existingHousehold =
      households.find(
        (household) =>
          household.houseNumber === houseNumber
      );

    const updatedHousehold: HouseholdItem = {
      id:
        existingHousehold?.id ??
        `local-${selectedVillage.id}-${houseNumber}`,

      version:
        (existingHousehold?.version ?? 0) + 1,

      houseNumber,

      headName:
        typeof formData.headName === "string"
          ? formData.headName
          : existingHousehold?.headName ?? "",

      isCompleted: isFullyCompleted,

      data: surveyAnswers,
    };

    setHouseholds((previous) => {
      const exists = previous.some(
        (item) =>
          item.houseNumber === houseNumber
      );

      if (exists) {
        return previous.map((item) =>
          item.houseNumber === houseNumber
            ? updatedHousehold
            : item
        );
      }

      return [...previous, updatedHousehold].sort(
        (a, b) =>
          a.houseNumber - b.houseNumber
      );
    });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 font-hindi pb-16">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-2xs">

        <div className="flex items-center space-x-2.5">

          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
            DMFT
          </div>

          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">
              सर्वेक्षक कार्यक्षेत्र
            </h1>

            <p className="text-[11px] text-slate-500 mt-0.5">
              {surveyMode === "village"
                ? "ग्राम प्रोफाइल"
                : "परिवार प्रोफाइल"}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={onLogout}
          className="text-xs border px-3 py-1.5 rounded-md hover:bg-slate-100 flex items-center cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-1 text-slate-600" />
          लॉग आउट
        </button>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="max-w-6xl mx-auto px-4 mt-6">

        {/* ERROR */}

        {dataError && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between gap-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 rounded-lg"
          >
            <span>{dataError}</span>

            <button
              type="button"
              onClick={() => setDataError("")}
              className="text-xs font-semibold underline"
            >
              बंद करें
            </button>
          </div>
        )}

        {/* LOADING */}

        {dataLoading && (
          <div
            role="status"
            className="mb-4 text-sm text-slate-500"
          >
            कृपया प्रतीक्षा करें…
          </div>
        )}

        {/* ===================================================
            BLOCK → GP → VILLAGE
        ==================================================== */}

        {viewMode === "selection" && (
          <div className="space-y-5">

            {/* Selection */}

            <div className="bg-white border rounded-xl p-5 shadow-2xs">

              <div className="mb-4">

                <span className="text-xs font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {surveyMode === "village"
                    ? "ग्राम प्रोफाइल"
                    : "परिवार प्रोफाइल"}
                </span>

                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  पहले विकासखंड एवं ग्राम पंचायत चुनें
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  ग्राम पंचायत चुनने के बाद उसके अंतर्गत आने वाले सभी प्रभावित ग्राम नीचे दिखाई देंगे।
                </p>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* BLOCK */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    विकासखंड *
                  </label>

                  <select
                    value={selectedBlockId}
                    onChange={handleBlockChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >

                    <option value="">
                      -- विकासखंड चुनें --
                    </option>

                    {hierarchy.map((block) => (
                      <option
                        key={block.id}
                        value={block.id}
                      >
                        {block.blockName}
                      </option>
                    ))}

                  </select>

                </div>

                {/* PANCHAYAT */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ग्राम पंचायत *
                  </label>

                  <select
                    disabled={!selectedBlock}
                    value={selectedPanchayatId}
                    onChange={handlePanchayatChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >

                    <option value="">
                      -- ग्राम पंचायत चुनें --
                    </option>

                    {panchayatOptions.map(
                      (panchayat) => (
                        <option
                          key={panchayat.id}
                          value={panchayat.id}
                        >
                          {panchayat.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

            </div>

            {/* =================================================
                VILLAGES
            ================================================== */}

            {selectedPanchayat && (
              <div className="bg-white border rounded-xl p-5 shadow-2xs">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">

                  <div>

                    <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      उपलब्ध ग्राम
                    </span>

                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {selectedPanchayat.name}
                    </h3>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {villageOptions.length} ग्राम उपलब्ध हैं
                    </p>

                  </div>

                </div>

                {villageOptions.length > 0 ? (

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">

                    {villageOptions.map(
                      (village) => {

                        const isSelected =
                          selectedVillage?.id ===
                          village.id;

                        return (
                          <button
                            type="button"
                            key={village.id}
                            onClick={() =>
                              handleVillageSelect(
                                village
                              )
                            }
                            className={`
                              p-4 rounded-xl border text-left
                              transition-all cursor-pointer
                              hover:-translate-y-0.5 shadow-2xs
                              ${
                                isSelected
                                  ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300"
                                  : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                              }
                            `}
                          >

                            <div className="flex items-start justify-between gap-2">

                              <div className="min-w-0">

                                <p className="font-bold text-sm text-slate-900 truncate">
                                  {village.nameHindi}
                                </p>

                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                  {village.nameEnglish}
                                </p>

                              </div>

                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                              )}

                            </div>

                            <p className="text-[10px] text-slate-500 mt-3">

                              {village.action ===
                              "Direct Affected"
                                ? "प्रत्यक्ष प्रभावित"
                                : village.action ===
                                  "Indirect Affected"
                                ? "अप्रत्यक्ष प्रभावित"
                                : "प्रत्यक्ष एवं अप्रत्यक्ष प्रभावित"}

                            </p>

                          </button>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="p-6 text-center border border-dashed rounded-xl">

                    <p className="text-sm font-bold text-slate-700">
                      इस ग्राम पंचायत में कोई ग्राम उपलब्ध नहीं है।
                    </p>

                  </div>

                )}

              </div>
            )}

          </div>
        )}

        {/* ===================================================
            OLD VILLAGE MENU
            अभी रखा है ताकि existing flow टूटे नहीं।
            नए profile flow में सीधे form खुलेगा।
        ==================================================== */}

        {viewMode === "village_menu" &&
          selectedVillage && (
            <div className="space-y-5">

              <div className="bg-white border rounded-xl p-5 shadow-2xs">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>

                    <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      चयनित ग्राम
                    </span>

                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {selectedVillage.nameHindi}
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPanchayat?.name} •{" "}
                      {selectedBlock?.blockName}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={resetToSelection}
                    className="px-3.5 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    गाँवों की सूची
                  </button>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("village_survey")
                  }
                  className="bg-white border rounded-xl p-6 text-left shadow-2xs hover:-translate-y-0.5 hover:border-emerald-400 transition-all cursor-pointer"
                >

                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                    1
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    ग्राम सर्वे
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    ग्राम का परिचय, सुविधाएँ एवं अंतराल मैट्रिक्स
                  </p>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode("household_survey")
                  }
                  className="bg-white border rounded-xl p-6 text-left shadow-2xs hover:-translate-y-0.5 hover:border-blue-400 transition-all cursor-pointer"
                >

                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
                    2
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    परिवार सर्वे
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    गाँव के प्रत्येक परिवार का सर्वेक्षण
                  </p>

                </button>

              </div>

            </div>
          )}

        {/* ===================================================
            VILLAGE SURVEY
        ==================================================== */}

        {viewMode === "village_survey" &&
          selectedVillage && (

            <VillageSurveyForm
              village={selectedVillage}
              blockName={
                selectedBlock?.blockName ?? ""
              }
              panchayatName={
                selectedPanchayat?.name ?? ""
              }

              onBack={resetToSelection}

              initialData={
                villageData ?? undefined
              }

              onComplete={
                handleVillageComplete
              }
            />

          )}

        {/* ===================================================
            HOUSEHOLD SURVEY
        ==================================================== */}

        {viewMode === "household_survey" &&
          selectedVillage && (

            <HouseholdSurvey
              villageName={
                selectedVillage.nameHindi
              }

              blockName={
                selectedBlock?.blockName ?? ""
              }

              panchayatName={
                selectedPanchayat?.name ?? ""
              }

              households={households}

              surveyorName={surveyorId}

              onBack={resetToSelection}

              onHouseholdSave={
                handleSaveHousehold
              }

              onHouseholdCountSubmit={
                handleHouseholdCountSubmit
              }
            />

          )}

      </main>
    </div>
  );
};

export default SurveyorDashboard;