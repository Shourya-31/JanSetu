import React, { useState } from "react";
import type { Village } from "../../../data/narayanpurHierarchy";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";

import GeneralInformation, { type GeneralInformationFormData } from "./general/GeneralInformation";
import AnganbadiSection from "./anganbadi/AnganbadiSection";
import SchoolSection from "./school/SchoolSection";
import HostelSection from "./hostel/HostelSection";
import HealthSection from "./health/HealthSection";
import WaterSection from "./water/WaterSection";
import EmploymentSection from "./employment/EmploymentSection";
import LadiesSection from "./ladies/LadiesSection";
import CleanlinessSection from "./cleanliness/CleanlinessSection";
import PensionSection from "./pension/PensionSection";
import DevelopmentSection from "./development/DevelopmentSection";

interface SectionProps {
  id: string;
  number: number;
  title: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  generalCompleted: boolean;
  onClick: () => void;
}

const sections = [
  {
    id: "general",
    number: 1,
    title: "ग्राम की सामान्य जानकारी",
    description:
      "ग्राम की मूल जानकारी, परिवार/घर, जनसंख्या एवं भूमि",
  },
  {
    id: "education",
    number: 2,
    title: "आंगनबाड़ी",
    description:
      "ग्राम में उपलब्ध आंगनबाड़ी केंद्रों से संबंधित जानकारी",
  },
  {
    id: "school",
    number: 3,
    title: "विद्यालय एवं शिक्षा",
    description:
      "ग्राम में उपलब्ध विद्यालयों एवं शिक्षा संबंधी जानकारी",
  },
  {
    id: "hostel",
    number: 4,
    title: "आश्रम/छात्रावास",
    description:
      "ग्राम में उपलब्ध आश्रम एवं छात्रावासों से संबंधित जानकारी",
  },
  {
    id: "health",
    number: 5,
    title: "स्वास्थ्य एवं पोषण",
    description:
      "स्वास्थ्य केंद्र, स्वास्थ्य कार्यकर्ता एवं उपलब्ध स्वास्थ्य सुविधाएँ",
  },

  {
  id: "water",
  number: 6,
  title: "पेयजल सुविधा",
  description:
    "ग्राम में उपलब्ध पेयजल सुविधा एवं संबंधित आवश्यकताएँ",
},
{
  id: "livelihood",
  number: 7,
  title: "रोजगार, आजीविका, पलायन एवं कौशल विकास",
  description:
    "ग्राम में रोजगार, आजीविका, पलायन एवं कौशल विकास से संबंधित जानकारी",
},
{
  id: "ladies",
  number: 8,
  title: "महिला स्वयं सहायता समूह एवं वित्तीय समावेशन",
  description:
    "महिला SHG एवं ग्राम की बैंकिंग सुविधाओं से संबंधित जानकारी",
},
{
  id: "cleanliness",
  number: 9,
  title: "स्वच्छता एवं अपशिष्ट प्रबंधन",
  description:
    "ग्राम की स्वच्छता, शौचालय एवं अपशिष्ट प्रबंधन से संबंधित जानकारी",
},
  {
  id: "pension",
  number: 10,
  title: "पेंशन एवं सामाजिक सुरक्षा",
  description:
    "विभिन्न पेंशन योजनाओं के पात्र लाभार्थियों एवं पेंशन प्राप्त करने वालों की जानकारी",
},
{
  id: "development",
  number: 11,
  title: "ग्राम की विकास आवश्यकताएँ",
  description:
    "ग्राम के लिए आवश्यक विकास कार्य एवं आधारभूत सुविधाओं की जानकारी",
},
];

const SectionCard: React.FC<SectionProps> = ({
  id,
  number,
  title,
  description,
  unlocked,
  completed,
  generalCompleted,
  onClick,
}) => (
  <button
    type="button"
    disabled={!unlocked}
    onClick={onClick}
    className={`w-full text-left rounded-xl border p-4 transition-all ${
      !unlocked
        ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-70"
        : completed
        ? "bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
        : "bg-white border-slate-300 hover:border-blue-400 hover:-translate-y-0.5 cursor-pointer"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
          completed
            ? "bg-emerald-100 text-emerald-700"
            : unlocked
            ? "bg-blue-50 text-blue-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : !unlocked ? (
          <Lock className="w-4 h-4" />
        ) : (
          number
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-900">
            {title}
          </h3>

          {!unlocked && (
            <span className="text-[10px] font-semibold text-slate-500">
              {!generalCompleted
                ? "पहले सामान्य जानकारी भरें"
                : id === "education"
                ? "कोई आंगनबाड़ी केंद्र नहीं"
                : id === "school"
                ? "कोई विद्यालय नहीं"
                : id === "hostel"
                ? "कोई आश्रम/छात्रावास नहीं"
                : id === "health"
                ? "कोई स्वास्थ्य केंद्र नहीं"
                : "लॉक है"}
            </span>
          )}

          {completed && (
            <span className="text-[10px] font-bold text-emerald-700">
              पूर्ण
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-1 leading-5">
          {description}
        </p>

        <p className="text-[10px] mt-2 font-semibold text-slate-500">
          खंड {number} •{" "}
          {id === "general"
            ? "अनिवार्य प्रथम चरण"
            : unlocked
            ? "खुला है"
            : "लॉक है"}
        </p>
      </div>
    </div>
  </button>
);

export const VillageSurveyForm: React.FC<{
  village: Village;
  blockName: string;
  panchayatName: string;
  initialData?: Record<string, unknown>;
  onBack: () => void;
  onComplete: (data: Record<string, unknown>) => void;
}> = ({
  village,
  blockName,
  panchayatName,
  initialData,
  onBack,
  onComplete,
}) => {
  const [activeSection, setActiveSection] =
    useState<string | null>(null);

    //Store selected photos
    const [villagePhotos, setVillagePhotos] = useState<File[]>([]);

  const [completedSections, setCompletedSections] = useState<string[]>(() => {
    if (!initialData) return [];
    const sectionFields: Record<string, string> = {
      education: "anganbadiData", school: "schoolData", hostel: "hostelData", health: "healthData",
      water: "waterData", livelihood: "employmentData", ladies: "ladiesData",
      cleanliness: "cleanlinessData", pension: "pensionData", development: "developmentData"
    };
    return [
      ...(initialData.totalHouseholds ? ["general"] : []),
      ...Object.entries(sectionFields)
        .filter(([, field]) => Object.prototype.hasOwnProperty.call(initialData, field))
        .map(([section]) => section)
    ];
  });

  const [formData, setFormData] = useState<GeneralInformationFormData & Record<string, unknown>>({
    totalHouseholds: "",
    totalPopulation: "",
    scPopulation: "",
    stPopulation: "",
    totalAgriculturalLand: "",

    totalSchools: "",
    totalAnganwadi: "",
    totalHealthFacilities: "",
    totalHostels: "",

    fairPriceShop: "",
    mobileNetwork: "",
    electricity: "",
    road: "",
    roadconnectivity: "",
    roadReasons: [],
    tapWater: "",
    ponds: "",

    puccaHouses: "",
    completedHouses: "",
    pendingHouses: "",
    odf: "",

    shopDistance: "",
    networkDistance: "",
    solarLight: "",
    rainCutoff: "",
    tapWaterExcludedFamilies: "",
    vet: "",
    rawHouses: "",
    housingNotSanctioned: "",
    banking: "",
    irrigatedLand: "",
    ...initialData,
  });

  const handlePhotoUpload = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const selectedFiles = Array.from(event.target.files || []);
  console.log("Selected photos:", selectedFiles);
  console.log("New photos selected:", selectedFiles.length);

  const MAX_PHOTOS = 5;
  const MAX_SIZE = 100 * 1024; // 100 KB

  // Check total number of photos
  if (villagePhotos.length + selectedFiles.length > MAX_PHOTOS) {
    alert("You can upload a maximum of 5 photos.");
    event.target.value = "";
    return;
  }

  // Check file types
  const invalidType = selectedFiles.find(
    (file) => !file.type.startsWith("image/")
  );

  if (invalidType) {
    alert("Only image files are allowed.");
    event.target.value = "";
    return;
  }

  // Check photo size
  const oversizedFile = selectedFiles.find(
    (file) => file.size >= MAX_SIZE
  );

  if (oversizedFile) {
    alert(
      `${oversizedFile.name} is too large. Each photo must be less than 100 KB.`
    );
    event.target.value = "";
    return;
  }

  // Store valid photos
  setVillagePhotos((prev) => [...prev, ...selectedFiles]);

  // Reset input so the same file can be selected again
  event.target.value = "";
};

  const setValue = <K extends keyof GeneralInformationFormData>(
    key: K,
    value: GeneralInformationFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const markCompleted = (
    sectionId: string
  ) => {
    setCompletedSections((prev) =>
      prev.includes(sectionId)
        ? prev
        : [...prev, sectionId]
    );
  };

  /*
   * General Information Save
   */
  const saveGeneral = () => {
    if (
      !formData.totalHouseholds ||
      Number(formData.totalHouseholds) <= 0
    ) {
      alert(
        "कृपया कुल घर / परिवार संख्या भरें।"
      );
      return;
    }

    markCompleted("general");

    // वापस section list पर
    setActiveSection(null);
  };

  /*
   * Normal Section Save
   *
   * Save के बाद automatically अगला section
   * open नहीं होगा।
   *
   * इससे अगर अगला section locked है
   * (जैसे totalSchools = 0) तो problem नहीं होगी।
   */
  const saveSection = (id: string) => {
    markCompleted(id);

    // Section save होने के बाद list पर वापस
    setActiveSection(null);
  };

  /*
   * Section Unlock Logic
   */
  const isUnlocked = (id: string) => {
    // General हमेशा available
    if (id === "general") {
      return true;
    }

    // General complete होने से पहले
    // बाकी sections locked
    if (!completedSections.includes("general")) {
      return false;
    }

    // Anganbadi
    if (id === "education") {
      return (
        Number(formData.totalAnganwadi) > 0
      );
    }

    // School
    if (id === "school") {
      return (
        Number(formData.totalSchools) > 0
      );
    }

    // Hostel
    if (id === "hostel") {
      return (
        Number(formData.totalHostels) > 0
      );
    }
if (id === "health") {
  return Number(formData.totalHealthFacilities) > 0;
}
    // बाकी sections
    return true;
  };

  /*
   * Active Section Name
   */
  const activeSectionData = sections.find(
    (section) =>
      section.id === activeSection
  );

  return (
    <div className="space-y-5">

      {/* ================= HEADER ================= */}
      <div className="bg-white border rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ग्राम सर्वेक्षण
            </span>

            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {village.nameHindi}
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              {panchayatName} • {blockName}
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            ग्राम मेनू
          </button>
        </div>
      </div>

      {/* ==================================================
          MAIN SURVEY CONTAINER
          Section List और Form दोनों इसी एक box में
      ================================================== */}
      <div className="bg-white border rounded-xl p-5 shadow-2xs">

        {/* ================= SECTION LIST ================= */}
        {activeSection === null && (
          <>
            <div className="mb-4">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                सर्वे प्रगति
              </span>

              <h3 className="text-lg font-bold text-slate-900 mt-1">
                ग्राम सर्वे के अनुभाग
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                पहले सामान्य जानकारी पूरी करें। उसके बाद
                उपलब्ध अनुभाग खुलेंगे।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  {...section}
                  unlocked={isUnlocked(section.id)}
                  completed={completedSections.includes(
                    section.id
                  )}
                  generalCompleted={completedSections.includes(
                    "general"
                  )}
                  onClick={() =>
                    isUnlocked(section.id) &&
                    setActiveSection(section.id)
                  }
                />
              ))}
            </div>
            {/* ============== VILLAGE PHOTO UPLOAD ============== */}

<div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">

  <h3 className="text-base font-bold text-slate-900 mb-2">
    ग्राम की तस्वीरें अपलोड करें
  </h3>

  <p className="text-xs text-slate-600 mb-4">
    अधिकतम 5 फोटो अपलोड करें। प्रत्येक फोटो का आकार 100 KB से कम होना चाहिए।
  </p>

<label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 cursor-pointer">

  <span>फोटो चुनें</span>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handlePhotoUpload}
    disabled={villagePhotos.length >= 5}
    className="hidden"
  />

</label>

  <p className="text-xs text-slate-500 mt-2">
    {villagePhotos.length} / 5 फोटो चयनित
  </p>

  {/* Photo Preview */}
  {villagePhotos.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">

      {villagePhotos.map((photo, index) => (
        <div
          key={`${photo.name}-${index}`}
          className="relative border rounded-lg overflow-hidden bg-white"
        >

          <img
            src={URL.createObjectURL(photo)}
            alt={`Village photo ${index + 1}`}
            className="w-full h-24 object-cover"
            onLoad={(e) => {
              URL.revokeObjectURL(e.currentTarget.src);
            }}
          />

          <button
            type="button"
            onClick={() => {
              setVillagePhotos((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
            className="absolute top-1 right-1 bg-red-600 text-white
              text-xs px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>

          <p className="text-[10px] text-center p-1 truncate">
            {photo.name}
          </p>

        </div>
      ))}

    </div>
  )}
{/* Submit Photos Button */}
<div className="mt-5 flex justify-end">
  <button
    type="button"
    disabled={villagePhotos.length === 0}
    onClick={() => {
      alert(
        `${villagePhotos.length} फोटो सफलतापूर्वक सबमिट की गईं।`
      );
    }}
    className="px-5 py-2.5 bg-emerald-600 text-white
      text-sm font-semibold rounded-lg
      hover:bg-emerald-700 transition-all
      disabled:bg-slate-300 disabled:cursor-not-allowed
      cursor-pointer"
  >
    फोटो सबमिट करें
  </button>
</div>
</div>
          </>
        )}

        {/* ================= ACTIVE FORM ================= */}
        {activeSection !== null && (
          <div>

            {/* Active Section Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
              <button
                type="button"
                onClick={() =>
                  setActiveSection(null)
                }
                className="px-3 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                अनुभाग सूची
              </button>

              <div className="text-right">
                <p className="text-[10px] text-slate-500">
                  ग्राम सर्वे
                </p>

                <span className="text-xs font-bold text-slate-700">
                  खंड{" "}
                  {activeSectionData?.number}
                  {" • "}
                  {activeSectionData?.title}
                </span>
              </div>
            </div>

            {/* ================= GENERAL ================= */}
            {activeSection === "general" && (
              <GeneralInformation
                villageName={village.nameHindi}
                blockName={blockName}
                panchayatName={panchayatName}
                formData={formData}
                setValue={setValue}
                onSave={saveGeneral}
              />
            )}

            {/* ================= ANGANBADI ================= */}
            {activeSection === "education" && (
              <AnganbadiSection
                totalAnganwadi={
                  Number(
                    formData.totalAnganwadi
                  ) || 0
                }
                onSave={(anganbadiData) => {
                  setFormData((prev) => ({
                    ...prev,
                    anganbadiData,
                  }));

                  saveSection("education");
                }}
              />
            )}

            {/* ================= SCHOOL ================= */}
            {activeSection === "school" && (
              <SchoolSection
                totalSchools={
                  Number(
                    formData.totalSchools
                  ) || 0
                }
                onSave={(schoolData) => {
                  setFormData((prev) => ({
                    ...prev,
                    schoolData,
                  }));

                  saveSection("school");
                }}
              />
            )}

            {/* ================= HOSTEL ================= */}
            {activeSection === "hostel" && (
              <HostelSection
                totalHostels={
                  Number(
                    formData.totalHostels
                  ) || 0
                }
                onSave={(hostelData) => {
                  setFormData((prev) => ({
                    ...prev,
                    hostelData,
                  }));

                  saveSection("hostel");
                }}
              />
            )}

             {/* ================= HEALTH ================= */}
          {activeSection === "health" && (
  <HealthSection
    totalHealthFacilities={
      Number(formData.totalHealthFacilities) || 0
    }
    onSave={(healthData) => {
      setFormData((prev) => ({
        ...prev,
        healthData,
      }));

      saveSection("health");
    }}
  />
)}

                {/* Water */}
 {activeSection === "water" && (
  <WaterSection
    onSave={(waterData) => {
      setFormData((prev) => ({
        ...prev,
        waterData,
      }));

      saveSection("water");
    }}
  />
)}
                        {/* LIVELIHOOD */}
                        {activeSection === "livelihood" && (
  <EmploymentSection
    onSave={(employmentData) => {
      setFormData((prev) => ({
        ...prev,
        employmentData,
      }));

      saveSection("livelihood");
    }}
  />
)}
    {/* Ladies */}
{activeSection === "ladies" && (
  <LadiesSection
    onSave={(ladiesData) => {
      setFormData((prev) => ({
        ...prev,
        ladiesData,
      }));

      saveSection("ladies");
    }}
  />
)}


      {/* Cleanliness */}
{activeSection === "cleanliness" && (
  <CleanlinessSection
    onSave={(cleanlinessData) => {
      setFormData((prev) => ({
        ...prev,
        cleanlinessData,
      }));

      saveSection("cleanliness");
    }}
  />
)}

           {/* Pension */}
    {activeSection === "pension" && (
  <PensionSection
    onSave={(pensionData) => {
      setFormData((prev) => ({
        ...prev,
        pensionData,
      }));

      saveSection("pension");
    }}
  />
)}

    {/* Development - Final Section */}
    {activeSection === "development" && (
      <DevelopmentSection
        onSave={(developmentData) => {
          const finalData = {
            ...formData,
            developmentData,
            villagePhotos,
            villageName: village.nameHindi,
            block: blockName,
            panchayat: panchayatName,
          };

          setFormData(finalData);
          markCompleted("development");
          onComplete(finalData);
        }}
      />
    )}
          </div>
        )}
      </div>
    </div>
  );
};