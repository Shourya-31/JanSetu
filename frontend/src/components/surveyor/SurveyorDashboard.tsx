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


  // LOCATION STATE




  const [selectedBlockId, setSelectedBlockId] = useState<string>("");







  const [selectedPanchayatId, setSelectedPanchayatId] =



    useState<string>("");







  const [selectedVillage, setSelectedVillage] =



    useState<Village | null>(null);




  // VIEW STATE




  const [viewMode, setViewMode] = useState<



    "selection" | "village_menu" | "village_survey" | "household_survey"



  >("selection");



  // LOCAL HIERARCHY



  // Backend की जरूरत नहीं





  const hierarchy: Block[] = CENSUS_HIERARCHY;



  // LOCAL SURVEY DATA




  const [villageData, setVillageData] =



    useState<Record<string, unknown> | null>(null);







  const [households, setHouseholds] =



    useState<HouseholdItem[]>([]);







  

  // 0 परिवार वाले गाँव के लिए manual completion state
  const [zeroFamilySurveyStarted, setZeroFamilySurveyStarted] =
    useState(false);

const [dataError, setDataError] = useState("");







  const [dataLoading, setDataLoading] = useState(false);





  // SELECTED BLOCK





  const selectedBlock = hierarchy.find(



    (block) => block.id === selectedBlockId



  );




  // PANCHAYAT OPTIONS





  const panchayatOptions =



    selectedBlock?.panchayats ?? [];




  // SELECTED PANCHAYAT





  const selectedPanchayat =



    panchayatOptions.find(



      (panchayat) =>



        panchayat.id === selectedPanchayatId



    );




  // VILLAGE OPTIONS






  const villageOptions =



    selectedPanchayat?.villages ?? [];



  // Selection progress: Block -> Panchayat -> Village

  const selectionStep = selectedPanchayatId

    ? 3

    : selectedBlockId

      ? 2

      : 1;





  // RESET TO SELECTION





  const resetToSelection = () => {



    setSelectedVillage(null);



    setVillageData(null);



    setHouseholds([]);







    
    setZeroFamilySurveyStarted(false);

    setSelectedBlockId("");



    setSelectedPanchayatId("");







    setDataError("");



    setViewMode("selection");



  };






  // BLOCK CHANGE







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






  // PANCHAYAT CHANGE






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




  // VILLAGE SELECT



  // Backend API नहीं







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






  // VILLAGE SURVEY SAVE



  // Local state only







  const handleVillageComplete = async (



    data: Record<string, unknown>



  ) => {



    setDataError("");



    
    // 0 परिवार होने पर कोई household card नहीं बनेगा।
    // HouseholdSurvey में manual completion button दिखेगा।
    if (count === 0) {
      setHouseholds([]);
      setZeroFamilySurveyStarted(true);
      return;
    }

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







  // HOUSEHOLD COUNT SUBMIT







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
  // ZERO FAMILY SURVEY COMPLETE
  // =========================================================

  const handleZeroFamilyComplete = async () => {
    if (!selectedVillage) return;

    setDataError("");
    setZeroFamilySurveyStarted(false);
    setHouseholds([]);

    // 0 परिवार वाले गाँव में कोई household record/card नहीं बनाया जाता।
    // Manual confirmation के बाद अगले गाँव की सूची पर जाएँ।
    resetToSelection();
  };



  



  // HOUSEHOLD SAVE



  // Local state only





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







  



  // RENDER









  return (



    <div className="min-h-screen bg-slate-50 font-hindi pb-16">






{/* //           HEADER */}







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







{/*           MAIN */}







      <main className="w-full px-5 sm:px-8 lg:px-10 py-6">







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






{/*             BLOCK → GP → VILLAGE */}








        {viewMode === "selection" && (
  <div className="min-h-[calc(100vh-135px)] space-y-6">

   {/* AREA SELECTION HERO */}
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

      <div className="grid min-h-[calc(100vh-190px)] grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">

        {/* LEFT — WORKFLOW */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">

          <div>

            <div className="mb-7 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  {surveyMode === "village" ? "ग्राम प्रोफाइल" : "परिवार प्रोफाइल"}
                </span>

                {selectedBlock && (
                  <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
                    नारायणपुर जिला
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-400">
                चरण {selectionStep} / 3
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              अपना सर्वे क्षेत्र चुनें
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              पहले विकासखंड चुनें, फिर संबंधित ग्राम पंचायत चुनें। उसके बाद
              उपलब्ध प्रभावित ग्रामों में से अपना सर्वे क्षेत्र चुनें।
            </p>

            {/* PROGRESS */}
            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-600">चयन प्रगति</span>
                <span className="text-blue-700">{selectionStep === 3 ? "ग्राम चयन के लिए तैयार" : `चरण ${selectionStep} / 3`}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(selectionStep / 3) * 100}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
                <span className={selectedBlockId ? "text-blue-600" : ""}>विकासखंड</span>
                <span className={selectedPanchayatId ? "text-blue-600" : ""}>ग्राम पंचायत</span>
                <span>ग्राम</span>
              </div>
            </div>

            {/* SELECTION FIELDS */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  विकासखंड *
                </label>

                <select
                  value={selectedBlockId}
                  onChange={handleBlockChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">-- विकासखंड चुनें --</option>

                  {hierarchy.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.blockName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ग्राम पंचायत *
                </label>

                <select
                  disabled={!selectedBlock}
                  value={selectedPanchayatId}
                  onChange={handlePanchayatChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">-- ग्राम पंचायत चुनें --</option>

                  {panchayatOptions.map((panchayat) => (
                    <option key={panchayat.id} value={panchayat.id}>
                      {panchayat.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* CURRENT SELECTION */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  चयनित विकासखंड
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-800">
                  {selectedBlock?.blockName || "अभी चयनित नहीं"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  चयनित ग्राम पंचायत
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-800">
                  {selectedPanchayat?.name || "अभी चयनित नहीं"}
                </p>
              </div>

            </div>

            {/* PANCHAYAT SUMMARY */}
            {selectedPanchayat && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    उपलब्ध ग्राम
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {villageOptions.length}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    चयनित ग्राम पंचायत
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {selectedPanchayat.name}
                  </p>
                </div>
              </div>
            )}

          </div>

          <div className="mt-8 border-t border-slate-100 pt-5">
            <p className="text-xs leading-relaxed text-slate-400">
              सुझाव: विकासखंड और ग्राम पंचायत का चयन करने के बाद नीचे दिखाई
              देने वाले ग्राम कार्ड से सर्वेक्षण शुरू करें।
            </p>
          </div>

        </div>

        {/* RIGHT — VISUAL */}
        <div className="relative min-h-[430px] overflow-hidden bg-slate-900 lg:min-h-0">

          <img
            src="/village-static.png"
            alt="गाँव का दृश्य"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/10 to-transparent" />

          <div className="absolute inset-x-6 bottom-6">
            <div className="rounded-3xl border border-white/20 bg-slate-950/25 p-6 text-white shadow-2xl backdrop-blur-md">

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                ग्रामीण क्षेत्र चयन
              </span>

              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                गाँव से सर्वेक्षण की शुरुआत
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/80">
                सही क्षेत्र चुनकर ग्राम की प्रोफाइल, सुविधाओं और परिवारों का
                सर्वेक्षण आगे बढ़ाएँ।
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs">
                   कृषि
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs">
                   ग्राम
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs">
                   समुदाय
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>

   {/* AVAILABLE VILLAGES */}
    {selectedPanchayat && (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-7">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              उपलब्ध ग्राम
            </span>

            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {selectedPanchayat.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {villageOptions.length} ग्राम उपलब्ध हैं
            </p>
          </div>

          <p className="text-xs font-medium text-slate-400">
            किसी ग्राम कार्ड पर क्लिक करके सर्वेक्षण शुरू करें
          </p>

        </div>

        {villageOptions.length > 0 ? (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {villageOptions.map((village) => {

              const isSelected = selectedVillage?.id === village.id;

              return (
                <button
                  type="button"
                  key={village.id}
                  onClick={() => handleVillageSelect(village)}
                  className={`
                    group rounded-2xl border p-5 text-left transition-all
                    cursor-pointer hover:-translate-y-1 hover:shadow-lg
                    ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                    }
                  `}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-base font-bold text-slate-900">
                        {village.nameHindi}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {village.nameEnglish}
                      </p>

                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    )}

                  </div>

                  <div className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                    {village.action === "Direct Affected"
                      ? "प्रत्यक्ष प्रभावित"
                      : village.action === "Indirect Affected"
                      ? "अप्रत्यक्ष प्रभावित"
                      : "प्रत्यक्ष एवं अप्रत्यक्ष प्रभावित"}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-medium text-slate-400">
                      सर्वेक्षण शुरू करें
                    </span>
                    <span className="text-xs font-bold text-emerald-600 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                </button>
              );
            })}

          </div>

        ) : (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-sm font-bold text-slate-700">
              इस ग्राम पंचायत में कोई ग्राम उपलब्ध नहीं है।
            </p>
          </div>

        )}

      </div>
    )}
  </div>
)}

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







    
{/*             VILLAGE SURVEY */}





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







{/*         HOUSEHOLD SURVEY} */}







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



                          onZeroFamilyComplete={
                handleZeroFamilyComplete
              }
/>







          )}







      </main>



    </div>



  );



};







export default SurveyorDashboard;