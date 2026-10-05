import React, { useMemo, useState } from "react";
import type { HouseholdItem } from "../household/HouseholdSurvey";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Search,
  Home,
  Users,
  ChevronRight,
  X,
  CircleCheck,
  CircleX,
  FileWarning,
  ClipboardList,
} from "lucide-react";

interface HouseholdOverviewProps {
  villageName: string;
  blockName: string;
  panchayatName: string;
  households: HouseholdItem[];
  onBack: () => void;
}

/* =========================================================
   HELPERS
========================================================= */

const getValue = (data: Record<string, unknown> | undefined, keys: string[]): unknown => {
  if (!data) return "";

  for (const key of keys) {
    const value = data?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
};

const getHeadName = (house: HouseholdItem) =>
  house.headName ||
  formatValue(getValue(house.data, [
    "headName",
    "head_name",
    "familyHeadName",
    "family_head_name",
    "मुखिया",
    "मुखिया का नाम",
  ])) ||
  "नाम उपलब्ध नहीं";

const getMemberCount = (house: HouseholdItem) => {
  const value = getValue(house.data, [
    "totalMembers",
    "memberCount",
    "familyMembers",
    "totalFamilyMembers",
    "totalPopulation",
    "membersCount",
    "numberOfMembers",
  ]);

  return value !== "" ? formatValue(value) : "—";
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "उपलब्ध नहीं";
  }

  if (typeof value === "boolean") {
    return value ? "हाँ" : "नहीं";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "कोई जानकारी नहीं";

    return value
      .map((item) =>
        typeof item === "object" ? JSON.stringify(item) : String(item)
      )
      .join(", ");
  }

  if (typeof value === "object") return "";

  return String(value);
};

/* =========================================================
   BASIC HOUSEHOLD SUMMARY
   Only explicit yes/no style fields are counted.
========================================================= */

type SummaryStatus = "yes" | "no" | "missing";

interface SummaryItem {
  key: string;
  label: string;
  value: unknown;
  status: SummaryStatus;
}

const YES_NO_FIELDS: Array<{
  key: string;
  label: string;
}> = [
  { key: "hasRationCard", label: "राशन कार्ड" },
  { key: "hasMNREGA", label: "मनरेगा" },
  { key: "hasShramikCard", label: "श्रमिक कार्ड" },
  { key: "hasJanDhan", label: "जनधन खाता" },
  { key: "hasKCC", label: "KCC" },
  { key: "hasFreeRation", label: "निःशुल्क राशन" },
  { key: "hasPMKisan", label: "PM किसान" },
  { key: "jsyReceived", label: "जननी सुरक्षा योजना" },
  { key: "pmmvyReceived", label: "प्रधानमंत्री मातृ वंदना योजना" },
  { key: "mahtariVandana", label: "महतारी वंदना योजना" },
  { key: "widowPension", label: "विधवा पेंशन" },
  { key: "hasBirthCert", label: "जन्म प्रमाण पत्र" },
  { key: "childrenVaccinated", label: "बच्चों का टीकाकरण" },
  { key: "hotMealAWC", label: "आंगनवाड़ी गर्म भोजन" },
  { key: "childrenGoSchool", label: "बच्चे स्कूल जाते हैं" },
  { key: "isMiningWorker", label: "खनन कार्य से जुड़ा परिवार" },
  { key: "hasGovtHousing", label: "शासकीय आवास" },
  { key: "hasToilet", label: "शौचालय" },
  { key: "hasTapWater", label: "नल का पानी" },
  { key: "hasElectricity", label: "बिजली" },
  { key: "usesSolar", label: "सौर ऊर्जा" },
  { key: "chronicIllness", label: "दीर्घकालिक बीमारी" },
  { key: "freeMedicine", label: "निःशुल्क दवा" },
];

const normalizeYesNo = (value: unknown): SummaryStatus => {
  if (value === undefined || value === null || value === "") return "missing";

  const v = String(value).trim().toLowerCase();

  if (
    v === "हाँ" ||
    v === "हां" ||
    v === "yes" ||
    v === "true" ||
    v === "1"
  ) {
    return "yes";
  }

  if (
    v === "नहीं" ||
    v === "नही" ||
    v === "no" ||
    v === "false" ||
    v === "0"
  ) {
    return "no";
  }

  // Values such as "लागू नहीं" are not treated as yes/no.
  return "missing";
};

const buildSummary = (data: Record<string, unknown> | undefined) => {
  const items: SummaryItem[] = YES_NO_FIELDS.map(({ key, label }) => ({
    key,
    label,
    value: data?.[key],
    status: normalizeYesNo(data?.[key]),
  }));

  const yesCount = items.filter((item) => item.status === "yes").length;
  const noCount = items.filter((item) => item.status === "no").length;
  const missingCount = items.filter(
    (item) => item.status === "missing"
  ).length;

  const missingDocuments = [
    {
      label: "आधार कार्ड",
      value: Number(data?.missingAadhaar) || 0,
    },
    {
      label: "जाति प्रमाण पत्र",
      value: Number(data?.missingCasteCert) || 0,
    },
    {
      label: "आयुष्मान कार्ड",
      value: Number(data?.missingAyushman) || 0,
    },
    {
      label: "मतदाता पहचान पत्र",
      value: Number(data?.missingVoterId) || 0,
    },
  ];

  const missingDocumentCount = missingDocuments.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return {
    items,
    yesCount,
    noCount,
    missingCount,
    missingDocuments,
    missingDocumentCount,
  };
};


/* =========================================================
   ENGLISH FIELD LABEL -> HINDI LABEL
========================================================= */

const FIELD_LABELS: Record<string, string> = {
  houseNumber: "मकान क्रमांक",
  headName: "परिवार के मुखिया का नाम",
  mobile: "मोबाइल नंबर",
  surveyDate: "सर्वेक्षण दिनांक",
  surveyorName: "सर्वेक्षक का नाम",

  totalMembers: "कुल परिवार सदस्य",
  eldersCount: "वृद्ध सदस्यों की संख्या",
  childrenCount: "बच्चों की संख्या",
  unemployedCount: "बेरोजगार सदस्यों की संख्या",
  incomeSource: "आय का मुख्य स्रोत",
  caste: "जाति",
  isBPL: "बीपीएल परिवार",

  missingAadhaar: "आधार कार्ड से वंचित सदस्य",
  missingCasteCert: "जाति प्रमाण पत्र से वंचित सदस्य",
  missingAyushman: "आयुष्मान कार्ड से वंचित सदस्य",
  missingVoterId: "मतदाता पहचान पत्र से वंचित सदस्य",

  hasRationCard: "राशन कार्ड",
  hasMNREGA: "मनरेगा",
  hasShramikCard: "श्रमिक कार्ड",
  hasJanDhan: "जनधन खाता",
  hasKCC: "किसान क्रेडिट कार्ड (KCC)",
  hasFreeRation: "निःशुल्क राशन",
  hasPMKisan: "पीएम किसान योजना",

  deathOccurred: "परिवार में मृत्यु हुई है",
  hasDeathCert: "मृत्यु प्रमाण पत्र",
  hasBirthCert: "जन्म प्रमाण पत्र",

  jsyReceived: "जननी सुरक्षा योजना",
  pmmvyReceived: "प्रधानमंत्री मातृ वंदना योजना",
  mahtariVandana: "महतारी वंदना योजना",
  widowPension: "विधवा पेंशन",
  divyangPension: "दिव्यांग पेंशन",

  childrenVaccinated: "बच्चों का टीकाकरण",
  hotMealAWC: "आंगनवाड़ी से गर्म भोजन",
  childrenGoSchool: "बच्चे स्कूल जाते हैं",
  schoolDropReason: "स्कूल छोड़ने का कारण",

  isMiningWorker: "खनन कार्य से जुड़ा परिवार",

  houseType: "मकान का प्रकार",
  hasGovtHousing: "शासकीय आवास",
  hasToilet: "शौचालय",
  hasTapWater: "नल का पानी",
  waterSource: "पानी का स्रोत",
  hasElectricity: "बिजली",
  usesSolar: "सौर ऊर्जा",

  chronicIllness: "दीर्घकालिक बीमारी",
  freeMedicine: "निःशुल्क दवा",

  trackingId: "सर्वेक्षण पहचान क्रमांक",
  submittedAt: "सर्वेक्षण जमा करने का समय",

  generalCompleted: "सामान्य जानकारी पूर्ण",
  demographyCompleted: "जनसांख्यिकी पूर्ण",
  documentsCompleted: "दस्तावेज एवं योजनाएँ पूर्ण",
  womenCompleted: "महिला एवं सामाजिक सुरक्षा पूर्ण",
  disabilityCompleted: "दिव्यांगता संबंधी जानकारी पूर्ण",
  educationCompleted: "शिक्षा संबंधी जानकारी पूर्ण",
  employmentCompleted: "रोजगार एवं कृषि संबंधी जानकारी पूर्ण",
  housingCompleted: "आवास एवं सुविधाएँ पूर्ण",
  healthCompleted: "स्वास्थ्य संबंधी जानकारी पूर्ण",
  shgCompleted: "स्वयं सहायता समूह संबंधी जानकारी पूर्ण",
  otherCompleted: "अन्य जानकारी पूर्ण",
};

const getHindiLabel = (key: string): string => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];

  // camelCase -> readable Hindi fallback
  const fallback = key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

  return fallback;
};

/* =========================================================
   DETAIL RENDERER
========================================================= */

interface DataRendererProps {
  data: unknown;
  level?: number;
}

const DataRenderer: React.FC<DataRendererProps> = ({
  data,
  level = 0,
}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  return (
    <div
      className={
        level > 0
          ? "ml-3 border-l border-slate-200 pl-4"
          : ""
      }
    >
      {Object.entries(data).map(([key, value]) => {
        if (
          key.toLowerCase().includes("completed") &&
          typeof value === "boolean"
        ) {
          return null;
        }

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          return (
            <div key={key} className="mb-4">
              <h4 className="text-sm font-bold text-slate-800 mb-2">
                {getHindiLabel(key)}
              </h4>

              <DataRenderer
                data={value}
                level={level + 1}
              />
            </div>
          );
        }

        return (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 py-2.5 border-b border-slate-100 last:border-b-0"
          >
            <span className="text-sm text-slate-500 break-words">
              {getHindiLabel(key)}
            </span>

            <span className="text-sm font-semibold text-slate-900 sm:text-right break-words">
              {formatValue(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   SUMMARY STATUS ITEM
========================================================= */

const StatusRow: React.FC<{
  label: string;
  value: unknown;
  status: SummaryStatus;
}> = ({ label, value, status }) => {
  const config = {
    yes: {
      text: "हाँ",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CircleCheck size={16} />,
    },
    no: {
      text: "नहीं",
      className:
        "bg-red-50 text-red-700 border-red-200",
      icon: <CircleX size={16} />,
    },
    missing: {
      text:
        value === "लागू नहीं"
          ? "लागू नहीं"
          : "जानकारी नहीं",
      className:
        "bg-slate-50 text-slate-600 border-slate-200",
      icon: <Clock3 size={15} />,
    },
  }[status];

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-700">
        {label}
      </span>

      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 ${config.className}`}
      >
        {config.icon}
        {config.text}
      </span>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const HouseholdOverview: React.FC<HouseholdOverviewProps> = ({
  villageName,
  blockName,
  panchayatName,
  households,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const [selectedHouse, setSelectedHouse] =
    useState<HouseholdItem | null>(null);

  const totalHouseholds = households.length;

  const completedHouseholds = households.filter(
    (house) => house.isCompleted
  ).length;

  const pendingHouseholds =
    totalHouseholds - completedHouseholds;

  const totalMembers = useMemo(() => {
    return households.reduce((total, house) => {
      const count = Number(getMemberCount(house));
      return total + (Number.isFinite(count) ? count : 0);
    }, 0);
  }, [households]);

  const filteredHouseholds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return households.filter((house) => {
      if (
        statusFilter === "completed" &&
        !house.isCompleted
      ) {
        return false;
      }

      if (
        statusFilter === "pending" &&
        house.isCompleted
      ) {
        return false;
      }

      if (!query) return true;

      const houseNumber = String(house.houseNumber);
      const headName = getHeadName(house).toLowerCase();

      return (
        houseNumber.includes(query) ||
        `मकान #${houseNumber}`
          .toLowerCase()
          .includes(query) ||
        headName.includes(query)
      );
    });
  }, [households, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">

        {/* HEADER */}
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">
          <div className="px-5 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                रिपोर्ट पर वापस जाएँ
              </button>

              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mt-4">
                परिवार अवलोकन
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                प्रत्येक मकान में उपलब्ध एवं अनुपलब्ध सुविधाओं का संक्षिप्त विवरण
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500">
                ग्राम
              </p>
              <p className="text-base font-bold text-slate-900">
                {villageName}
              </p>
            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">ग्राम</p>
              <p className="text-sm font-bold text-slate-900">
                {villageName}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                ग्राम पंचायत
              </p>
              <p className="text-sm font-bold text-slate-900">
                {panchayatName}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                विकासखंड
              </p>
              <p className="text-sm font-bold text-slate-900">
                {blockName}
              </p>
            </div>
          </div>
        </div>

        {/* VILLAGE SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  कुल मकान
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {totalHouseholds}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                <Home size={21} className="text-slate-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  सर्वे पूर्ण
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-2">
                  {completedHouseholds}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={21} className="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  सर्वे लंबित
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-2">
                  {pendingHouseholds}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock3 size={21} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  कुल परिवार सदस्य
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  {totalMembers}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={21} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="मकान नंबर या मुखिया का नाम खोजें..."
                className="w-full h-11 pl-10 pr-4 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "सभी"],
                ["completed", "पूर्ण"],
                ["pending", "लंबित"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      value as "all" | "completed" | "pending"
                    )
                  }
                  className={`px-4 h-11 rounded-lg text-sm font-bold border transition-colors ${
                    statusFilter === value
                      ? value === "completed"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : value === "pending"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {filteredHouseholds.length} मकान दिखाई दे रहे हैं
          </div>
        </div>

        {/* HOUSEHOLD LIST */}
        <div className="mt-5">
          {filteredHouseholds.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                <Search size={21} className="text-slate-500" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-4">
                कोई मकान नहीं मिला
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                खोज या फिल्टर बदलकर दोबारा प्रयास करें।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHouseholds.map((house) => {
                const headName = getHeadName(house);
                const memberCount = getMemberCount(house);
                const summary = buildSummary(house.data);

                return (
                  <button
                    key={house.houseNumber}
                    type="button"
                    onClick={() => setSelectedHouse(house)}
                    className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Home size={20} className="text-slate-700" />
                        </div>

                        <div>
                          <p className="text-base font-bold text-slate-900">
                            मकान #{house.houseNumber}
                          </p>

                          <p className="text-xs text-slate-500 mt-0.5">
                            {headName}
                          </p>
                        </div>
                      </div>

                      {house.isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          <CheckCircle2 size={13} />
                          पूर्ण
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                          <Clock3 size={13} />
                          लंबित
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                        <p className="text-[10px] text-emerald-700">
                          उपलब्ध
                        </p>
                        <p className="text-lg font-bold text-emerald-800">
                          {summary.yesCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                        <p className="text-[10px] text-red-700">
                          नहीं
                        </p>
                        <p className="text-lg font-bold text-red-800">
                          {summary.noCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                        <p className="text-[10px] text-slate-600">
                          जानकारी नहीं
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                          {summary.missingCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2">
                        <p className="text-[10px] text-orange-700">
                          छूटे दस्तावेज़
                        </p>
                        <p className="text-lg font-bold text-orange-800">
                          {summary.missingDocumentCount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] text-slate-400">
                          परिवार के सदस्य
                        </p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {memberCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-400">
                          मुख्य स्थिति
                        </p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {summary.noCount > 0
                            ? "कुछ सुविधाएँ नहीं"
                            : summary.yesCount > 0
                            ? "सुविधाएँ उपलब्ध"
                            : "जानकारी लंबित"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900">
                        पूरा विवरण देखें
                      </span>

                      <ChevronRight
                        size={17}
                        className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">

              {/* MODAL HEADER */}
              <div className="px-5 lg:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    परिवार विवरण
                  </p>

                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    मकान #{selectedHouse.houseNumber}
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    {getHeadName(selectedHouse)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHouse(null)}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* LOCATION */}
              <div className="px-5 lg:px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] text-slate-500">ग्राम</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {villageName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-500">
                      ग्राम पंचायत
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {panchayatName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-500">
                      विकासखंड
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {blockName}
                    </p>
                  </div>
                </div>
              </div>

              {/* BASIC SUMMARY */}
              {(() => {
                const summary = buildSummary(
                  selectedHouse.data
                );

                return (
                  <div className="px-5 lg:px-6 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList
                        size={18}
                        className="text-slate-700"
                      />
                      <h3 className="text-base font-bold text-slate-900">
                        इस घर की मूल स्थिति
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-xs text-emerald-700">
                          उपलब्ध सुविधाएँ
                        </p>
                        <p className="text-2xl font-bold text-emerald-800 mt-1">
                          {summary.yesCount}
                        </p>
                      </div>

                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-xs text-red-700">
                          उपलब्ध नहीं
                        </p>
                        <p className="text-2xl font-bold text-red-800 mt-1">
                          {summary.noCount}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-600">
                          जानकारी नहीं
                        </p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                          {summary.missingCount}
                        </p>
                      </div>

                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <p className="text-xs text-orange-700">
                          छूटे दस्तावेज़
                        </p>
                        <p className="text-2xl font-bold text-orange-800 mt-1">
                          {summary.missingDocumentCount}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* WHAT IS / IS NOT */}
              {selectedHouse.data && (
                <div className="px-5 lg:px-6 py-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="border border-emerald-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
                        <CircleCheck
                          size={18}
                          className="text-emerald-700"
                        />
                        <h3 className="font-bold text-emerald-800">
                          घर में उपलब्ध
                        </h3>
                      </div>

                      <div className="px-4">
                        {buildSummary(selectedHouse.data).items
                          .filter((item) => item.status === "yes")
                          .map((item) => (
                            <StatusRow
                              key={item.label}
                              label={item.label}
                              value={item.value}
                              status={item.status}
                            />
                          ))}

                        {buildSummary(selectedHouse.data).items.filter(
                          (item) => item.status === "yes"
                        ).length === 0 && (
                          <p className="py-6 text-sm text-slate-500 text-center">
                            कोई स्पष्ट उपलब्ध सुविधा दर्ज नहीं है।
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
                        <CircleX
                          size={18}
                          className="text-red-700"
                        />
                        <h3 className="font-bold text-red-800">
                          घर में उपलब्ध नहीं
                        </h3>
                      </div>

                      <div className="px-4">
                        {buildSummary(selectedHouse.data).items
                          .filter((item) => item.status === "no")
                          .map((item) => (
                            <StatusRow
                              key={item.label}
                              label={item.label}
                              value={item.value}
                              status={item.status}
                            />
                          ))}

                        {buildSummary(selectedHouse.data).items.filter(
                          (item) => item.status === "no"
                        ).length === 0 && (
                          <p className="py-6 text-sm text-slate-500 text-center">
                            कोई स्पष्ट अनुपलब्ध सुविधा दर्ज नहीं है।
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MISSING DOCUMENTS */}
                  <div className="mt-5 border border-orange-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-orange-50 border-b border-orange-200 flex items-center gap-2">
                      <FileWarning
                        size={18}
                        className="text-orange-700"
                      />
                      <h3 className="font-bold text-orange-800">
                        छूटे हुए दस्तावेज़
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                      {buildSummary(selectedHouse.data)
                        .missingDocuments.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            <p className="text-xs text-slate-500">
                              {item.label}
                            </p>
                            <p
                              className={`text-xl font-bold mt-1 ${
                                item.value > 0
                                  ? "text-orange-700"
                                  : "text-emerald-700"
                              }`}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* COMPLETE RAW DETAILS */}
                  <div className="mt-5">
                    <details className="border border-slate-200 rounded-xl">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-800">
                        पूरा सर्वे विवरण देखें
                      </summary>

                      <div className="px-4 pb-4">
                        <DataRenderer data={selectedHouse.data} />
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {!selectedHouse.data && (
                <div className="px-5 lg:px-6 py-10 text-center text-sm text-slate-500">
                  इस मकान का कोई विवरण उपलब्ध नहीं है।
                </div>
              )}

              {/* FOOTER */}
              <div className="px-5 lg:px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedHouse(null)}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdOverview;
