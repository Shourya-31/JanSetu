import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileQuestion,
  MapPinned,
  Search,
} from "lucide-react";
import { SurveyAnalysisControls } from "./SurveyAnalysisControls";
import { useAdminSurveyAnalysis } from "./useAdminSurveyAnalysis";

type QuestionType = "count" | "yesno" | "choice" | "text";

type Question = {
  key: string;
  label: string;
  type: QuestionType;
  options?: string[];
};

type Section = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  questions: Question[];
};

const yesNo = ["हाँ", "नहीं"];

const sections: Section[] = [
  {
    id: "general",
    number: 1,
    title: "ग्राम की सामान्य जानकारी",
    subtitle: "परिवार, जनसंख्या एवं भूमि",
    questions: [
      { key: "totalHouseholds", label: "ग्राम में कुल घर / परिवारों की संख्या कितनी है?", type: "count" },
      { key: "totalPopulation", label: "ग्राम की कुल जनसंख्या कितनी है?", type: "count" },
      { key: "scPopulation", label: "अनुसूचित जाति की जनसंख्या कितनी है?", type: "count" },
      { key: "stPopulation", label: "अनुसूचित जनजाति की जनसंख्या कितनी है?", type: "count" },
      { key: "totalAgriculturalLand", label: "कुल कृषि भूमि कितनी है?", type: "text" },
      { key: "puccaHouses", label: "पक्के मकानों की संख्या", type: "count" },
      { key: "rawHouses", label: "कच्चे मकानों की संख्या", type: "count" },
      { key: "completedHouses", label: "पूर्ण आवासों की संख्या", type: "count" },
      { key: "pendingHouses", label: "लंबित आवासों की संख्या", type: "count" },
      { key: "housingNotSanctioned", label: "आवास स्वीकृत नहीं हुए ऐसे परिवार", type: "count" },
      { key: "totalAnganwadi", label: "ग्राम में कुल आंगनबाड़ी केंद्र", type: "count" },
      { key: "totalSchools", label: "ग्राम में कुल विद्यालय", type: "count" },
      { key: "totalHostels", label: "ग्राम में कुल आश्रम / छात्रावास", type: "count" },
      { key: "totalHealthFacilities", label: "ग्राम में कुल स्वास्थ्य सुविधाएँ / केंद्र", type: "count" },
      { key: "fairPriceShop", label: "क्या उचित मूल्य की दुकान उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "mobileNetwork", label: "क्या मोबाइल नेटवर्क उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "electricity", label: "क्या बिजली उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "road", label: "क्या सड़क सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "roadconnectivity", label: "क्या ग्राम सड़क से जुड़ा हुआ है?", type: "yesno", options: yesNo },
      { key: "roadReasons", label: "सड़क सुविधा नहीं होने के कारण", type: "text" },
      { key: "tapWater", label: "क्या नल जल सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "tapWaterExcludedFamilies", label: "नल जल से वंचित परिवारों की संख्या", type: "count" },
      { key: "ponds", label: "ग्राम में तालाबों की संख्या", type: "count" },
      { key: "odf", label: "क्या ग्राम खुले में शौच से मुक्त (ODF) है?", type: "yesno", options: yesNo },
      { key: "shopDistance", label: "उचित मूल्य की दुकान की दूरी", type: "text" },
      { key: "networkDistance", label: "नेटवर्क सुविधा की दूरी / स्थिति", type: "text" },
      { key: "solarLight", label: "सोलर लाइट से संबंधित जानकारी", type: "text" },
      { key: "rainCutoff", label: "वर्षा के कारण संपर्क बाधित होने की जानकारी", type: "text" },
      { key: "vet", label: "क्या पशु चिकित्सा सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "banking", label: "क्या बैंकिंग सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "irrigatedLand", label: "सिंचित भूमि की जानकारी", type: "text" },
    ],
  },
  {
    id: "anganwadi",
    number: 2,
    title: "आंगनबाड़ी",
    subtitle: "आंगनबाड़ी केंद्र एवं सुविधाएँ",
    questions: [
      { key: "anganwadiCount", label: "कुल आंगनबाड़ी केंद्र कितने हैं?", type: "count" },
      { key: "anganwadiBuilding", label: "क्या केंद्र के लिए भवन उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "anganwadiWater", label: "क्या पेयजल सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "anganwadiToilet", label: "क्या शौचालय उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "anganwadiNutrition", label: "क्या पोषण संबंधी सेवाएँ उपलब्ध हैं?", type: "yesno", options: yesNo },
    ],
  },
  {
    id: "school",
    number: 3,
    title: "विद्यालय एवं शिक्षा",
    subtitle: "विद्यालयों की उपलब्धता एवं कमियाँ",
    questions: [
      { key: "schoolCount", label: "ग्राम में विद्यालयों की संख्या", type: "count" },
      { key: "schoolBuilding", label: "क्या विद्यालय का भवन उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "teacherShortage", label: "क्या शिक्षकों की कमी है?", type: "yesno", options: yesNo },
      { key: "schoolToilet", label: "क्या विद्यालय में शौचालय उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "schoolDrinkingWater", label: "क्या विद्यालय में पेयजल उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "schoolElectricity", label: "क्या विद्यालय में बिजली उपलब्ध है?", type: "yesno", options: yesNo },
    ],
  },
  {
    id: "hostel",
    number: 4,
    title: "आश्रम / छात्रावास",
    subtitle: "छात्रावास एवं बुनियादी सुविधाएँ",
    questions: [
      { key: "hostelCount", label: "कुल आश्रम / छात्रावासों की संख्या", type: "count" },
      { key: "hostelBuilding", label: "क्या भवन की सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "hostelWater", label: "क्या पेयजल उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "hostelToilet", label: "क्या शौचालय उपलब्ध है?", type: "yesno", options: yesNo },
    ],
  },
  {
    id: "health",
    number: 5,
    title: "स्वास्थ्य एवं पोषण",
    subtitle: "स्वास्थ्य सेवाएँ एवं उपलब्धता",
    questions: [
      { key: "healthCenterCount", label: "स्वास्थ्य केंद्रों की संख्या", type: "count" },
      { key: "healthWorkerAvailable", label: "क्या स्वास्थ्य कार्यकर्ता उपलब्ध हैं?", type: "yesno", options: yesNo },
      { key: "ambulanceAvailable", label: "क्या एम्बुलेंस सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "medicineAvailable", label: "क्या आवश्यक दवाएँ उपलब्ध हैं?", type: "yesno", options: yesNo },
    ],
  },
  {
    id: "water",
    number: 6,
    title: "पेयजल सुविधा",
    subtitle: "जल स्रोत एवं पेयजल संबंधी समस्याएँ",
    questions: [
      { key: "waterSource", label: "पेयजल के मुख्य स्रोत कौन-कौन से हैं?", type: "choice", options: ["हैंडपंप", "नल जल", "कुआँ", "बोरवेल", "अन्य"] },
      { key: "waterAvailability", label: "क्या पर्याप्त पेयजल उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "waterQuality", label: "क्या पेयजल की गुणवत्ता संतोषजनक है?", type: "yesno", options: yesNo },
      { key: "waterProblem", label: "पेयजल से संबंधित प्रमुख समस्या", type: "text" },
    ],
  },
  {
    id: "livelihood",
    number: 7,
    title: "रोजगार, आजीविका एवं पलायन",
    subtitle: "रोजगार के अवसर एवं कौशल विकास",
    questions: [
      { key: "employmentAvailability", label: "क्या पर्याप्त रोजगार के अवसर उपलब्ध हैं?", type: "yesno", options: yesNo },
      { key: "migration", label: "क्या रोजगार के लिए पलायन होता है?", type: "yesno", options: yesNo },
      { key: "skillTraining", label: "क्या कौशल विकास प्रशिक्षण उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "livelihoodProblem", label: "रोजगार एवं आजीविका की प्रमुख समस्या", type: "text" },
    ],
  },
  {
    id: "ladies",
    number: 8,
    title: "महिला स्वयं सहायता समूह",
    subtitle: "महिला SHG एवं वित्तीय समावेशन",
    questions: [
      { key: "shgAvailable", label: "क्या महिला स्वयं सहायता समूह उपलब्ध हैं?", type: "yesno", options: yesNo },
      { key: "shgCount", label: "महिला स्वयं सहायता समूहों की संख्या", type: "count" },
      { key: "bankingAccess", label: "क्या महिलाओं को बैंकिंग सुविधाएँ उपलब्ध हैं?", type: "yesno", options: yesNo },
      { key: "womenFinancialProblem", label: "महिलाओं की वित्तीय सुविधा से संबंधित समस्या", type: "text" },
    ],
  },
  {
    id: "cleanliness",
    number: 9,
    title: "स्वच्छता एवं अपशिष्ट प्रबंधन",
    subtitle: "सफाई, शौचालय एवं कचरा प्रबंधन",
    questions: [
      { key: "publicCleanliness", label: "क्या ग्राम में नियमित साफ-सफाई होती है?", type: "yesno", options: yesNo },
      { key: "wasteManagement", label: "क्या कचरा प्रबंधन की व्यवस्था है?", type: "yesno", options: yesNo },
      { key: "drainage", label: "क्या उचित नाली एवं जल निकासी व्यवस्था है?", type: "yesno", options: yesNo },
      { key: "cleanlinessProblem", label: "स्वच्छता से संबंधित प्रमुख समस्या", type: "text" },
    ],
  },
  {
    id: "pension",
    number: 10,
    title: "पेंशन एवं सामाजिक सुरक्षा",
    subtitle: "पात्र लाभार्थी एवं पेंशन योजनाएँ",
    questions: [
      { key: "pensionAwareness", label: "क्या लोगों को पेंशन योजनाओं की जानकारी है?", type: "yesno", options: yesNo },
      { key: "pensionBeneficiaries", label: "पेंशन प्राप्त करने वाले लाभार्थियों की संख्या", type: "count" },
      { key: "pensionIssues", label: "क्या पेंशन प्राप्त करने में समस्या आती है?", type: "yesno", options: yesNo },
      { key: "pensionProblem", label: "पेंशन से संबंधित प्रमुख समस्या", type: "text" },
    ],
  },
  {
    id: "development",
    number: 11,
    title: "ग्राम की विकास आवश्यकताएँ",
    subtitle: "आधारभूत सुविधाएँ एवं विकास कार्य",
    questions: [
      { key: "roadAvailability", label: "क्या उचित सड़क सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "electricityAvailability", label: "क्या बिजली की सुविधा उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "internetAvailability", label: "क्या इंटरनेट / मोबाइल नेटवर्क उपलब्ध है?", type: "yesno", options: yesNo },
      { key: "developmentNeeds", label: "ग्राम की प्रमुख विकास आवश्यकताएँ", type: "text" },
    ],
  },
];

export type VillageSurveyRecord = Record<string, unknown> & {
  id?: number;
  blockId?: number;
  panchayatId?: number;
  villageId?: number;
  blockName?: string;
  panchayatName?: string;
  villageName?: string;
  affectedStatus?: string;
  surveyStatus?: "completed" | "incomplete" | "pending";
  isCompleted?: boolean;
  progress?: number;
  formData?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

const textValue = (value: unknown) =>
  value == null ? "" : String(value).trim();

const normalizeBlock = (value: unknown) => {
  const normalized = textValue(value).toLocaleLowerCase("hi");

  if (["नारायणपुर", "narayanpur"].includes(normalized)) {
    return "नारायणपुर";
  }

  if (["ओरछा", "orchha", "orcha"].includes(normalized)) {
    return "ओरछा";
  }

  return textValue(value);
};

const getValue = (
  record: VillageSurveyRecord,
  key: string
): unknown => {
  if (Object.prototype.hasOwnProperty.call(record, key)) {
    return record[key];
  }

  if (
    record.formData &&
    Object.prototype.hasOwnProperty.call(record.formData, key)
  ) {
    return record.formData[key];
  }

  if (
    record.data &&
    Object.prototype.hasOwnProperty.call(record.data, key)
  ) {
    return record.data[key];
  }

  return undefined;
};

const getAffectedStatus = (record: VillageSurveyRecord) => {
  const value =
    record.affectedStatus ??
    record.formData?.affectedStatus ??
    record.data?.affectedStatus;

  const status = textValue(value).toLocaleLowerCase("hi");

  if (status.includes("indirect") || status.includes("अप्रत्यक्ष")) {
    return "indirect";
  }

  if (status.includes("direct") || status.includes("प्रत्यक्ष")) {
    return "direct";
  }

  return "unknown";
};

const isAnsweredValue = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : textValue(value) !== "";

const numericValue = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
export default function VillageSurveyAnalysis() {
  const analysis = useAdminSurveyAnalysis<VillageSurveyRecord>("villages");
  const surveys = analysis.result?.records ?? [];
  const [questionSearch, setQuestionSearch] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<{
    section: Section;
    question: Question;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const allQuestions = useMemo(
    () =>
      sections.flatMap((section) =>
        section.questions.map((question) => ({
          section,
          question,
        }))
      ),
    []
  );

  const sectionPages = [
    ["general"],
    ["anganwadi", "school", "hostel"],
    ["health", "water", "livelihood"],
    ["ladies", "cleanliness"],
    ["pension", "development"],
  ];

  const filteredQuestions = useMemo(() => {
    const term = questionSearch.trim().toLocaleLowerCase("hi");

    return allQuestions.filter(({ section, question }) => {
      const matchesSection =
        selectedSectionId === "all" ||
        section.id === selectedSectionId;

      const matchesSearch =
        !term ||
        question.label.toLocaleLowerCase("hi").includes(term) ||
        section.title.toLocaleLowerCase("hi").includes(term);

      return matchesSection && matchesSearch;
    });
  }, [allQuestions, questionSearch, selectedSectionId]);

  const visibleSections = sections
    .filter((section) =>
      sectionPages[currentPage - 1]?.includes(section.id)
    )
    .filter(
      (section) =>
        selectedSectionId === "all" ||
        section.id === selectedSectionId
    )
    .map((section) => ({
      section,
      questions: filteredQuestions.filter(
        (item) => item.section.id === section.id
      ),
    }))
    .filter(({ questions }) => questions.length > 0);

  const totalPages = 5;

  const openQuestion = (
    section: Section,
    question: Question
  ) => {
    setSelectedQuestion({ section, question });
    setSelectedBlock(null);
  };

  const goBack = () => {
    if (selectedBlock) {
      setSelectedBlock(null);
    } else {
      setSelectedQuestion(null);
    }
  };

  // Count question: answers ka sum.
  // Yes/No question: Yes aur No responses ki sankhya.
  // Choice/Text: har distinct answer ki frequency.
  const summarize = (
    records: VillageSurveyRecord[],
    question: Question
  ): string => {
    const values = records.map((record) =>
      getValue(record, question.key)
    );

    const answeredValues = values.filter(isAnsweredValue);

    if (question.type === "count") {
      const numbers = values
        .map(numericValue)
        .filter((number): number is number => number !== null);

      return numbers.length
        ? numbers
            .reduce((sum, number) => sum + number, 0)
            .toLocaleString("en-IN")
        : "—";
    }

    if (question.type === "yesno") {
      const normalizeYesNo = (value: unknown) => {
        const answer = textValue(value).toLocaleLowerCase("hi");
        if (["हाँ", "हां", "yes", "true", "1"].includes(answer)) return "yes";
        if (["नहीं", "नही", "no", "false", "0"].includes(answer)) return "no";
        return "unknown";
      };

      const yes = values.filter((value) => normalizeYesNo(value) === "yes").length;
      const no = values.filter((value) => normalizeYesNo(value) === "no").length;

      return answeredValues.length
        ? `हाँ: ${yes} · नहीं: ${no}`
        : "—";
    }

    if (question.type === "choice") {
      if (!answeredValues.length) return "—";

      // Har configured option show hoga, chahe uska count 0 hi kyon na ho.
      const frequencies = new Map<string, number>(
        (question.options ?? []).map((option) => [option, 0])
      );

      answeredValues.forEach((value) => {
        const answers = Array.isArray(value) ? value : [value];

        answers.forEach((answer) => {
          const label = textValue(answer);
          if (label) {
            frequencies.set(label, (frequencies.get(label) ?? 0) + 1);
          }
        });
      });

      return frequencies.size
        ? Array.from(frequencies.entries())
            .map(([answer, count]) => `${answer}: ${count}`)
            .join(" · ")
        : "—";
    }

    return answeredValues.length
      ? `${answeredValues.length} उत्तर`
      : "—";
  };

  const getCategorySummary = (
    records: VillageSurveyRecord[],
    question: Question
  ) => ({
    direct: summarize(
      records.filter(
        (record) => getAffectedStatus(record) === "direct"
      ),
      question
    ),
    indirect: summarize(
      records.filter(
        (record) => getAffectedStatus(record) === "indirect"
      ),
      question
    ),
  });

  const blocks = Array.from(
    new Set(surveys.map((record) => normalizeBlock(record.blockName)).filter(Boolean)),
  );
  const blockRows = selectedQuestion
    ? blocks.map((block) => {
        const records = surveys.filter(
          (record) => normalizeBlock(record.blockName) === block
        );

        return {
          block,
          ...getCategorySummary(
            records,
            selectedQuestion.question
          ),
        };
      })
    : [];

  // Block select karne par us block ke har panchayat ke saare gaon ek table mein dikhte hain.
  const villageRows =
    selectedBlock && selectedQuestion
      ? Array.from(
          new Map(
            surveys
              .filter(
                (record) => normalizeBlock(record.blockName) === selectedBlock
              )
              .filter((record) => textValue(record.panchayatName) && textValue(record.villageName))
              .map((record) => [
                `${textValue(record.panchayatName)}::${textValue(record.villageName)}`,
                {
                  panchayat: textValue(record.panchayatName),
                  village: textValue(record.villageName),
                },
              ])
          ).values()
        ).map(({ panchayat, village }) => {
          const records = surveys.filter(
            (record) =>
              normalizeBlock(record.blockName) === selectedBlock &&
              textValue(record.panchayatName) === panchayat &&
              textValue(record.villageName) === village
          );

          return {
            panchayat,
            village,
            answer: summarize(records, selectedQuestion.question),
          };
        })
      : [];

  const hasAnyFilteredQuestions = filteredQuestions.length > 0;
  const stats = analysis.result?.stats;

  return (
    <div className="space-y-5 text-slate-900">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <MapPinned className="h-4 w-4" />
              ग्राम सर्वेक्षण विश्लेषण
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Village Survey Analysis
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              प्रश्न चुनें और ब्लॉक से ग्राम पंचायत एवं गाँव-वार उत्तरों का विश्लेषण देखें।
            </p>
          </div>

          {selectedQuestion && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              वापस जाएँ
            </button>
          )}
        </div>
      </header>

      <SurveyAnalysisControls
        kind="villages"
        {...analysis}
        onRefresh={analysis.retry}
      />

      {(analysis.error || analysis.hierarchyError) && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <span>{analysis.error || analysis.hierarchyError}</span>
          <button
            type="button"
            onClick={analysis.retry}
            className="rounded-md border border-rose-300 px-3 py-1.5 font-semibold hover:bg-white"
          >
            फिर कोशिश करें
          </button>
        </div>
      )}
      {analysis.loading && (
        <p role="status" className="text-sm text-slate-500">
          ग्राम सर्वे रिकॉर्ड लोड हो रहे हैं...
        </p>
      )}

      {!selectedQuestion ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-4">
              <MapPinned className="mb-3 h-5 w-5 text-blue-600" />
              <p className="text-sm text-slate-500">कुल गाँव</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.total ?? 0}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <FileQuestion className="mb-3 h-5 w-5 text-violet-600" />
              <p className="text-sm text-slate-500">पूर्ण ग्राम सर्वे</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.completed ?? 0}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <FileQuestion className="mb-3 h-5 w-5 text-amber-600" />
              <p className="text-sm text-slate-500">अपूर्ण ग्राम सर्वे</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.incomplete ?? 0}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <MapPinned className="mb-3 h-5 w-5 text-emerald-600" />
              <p className="text-sm text-slate-500">लंबित / शुरू नहीं हुए</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.pending ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                पूर्णता {stats?.completionPercent ?? 0}%
              </p>
            </div>
          </div>

          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b px-4 py-3">गाँव</th>
                  <th className="border-b px-4 py-3">ब्लॉक / ग्राम पंचायत</th>
                  <th className="border-b px-4 py-3">प्रभावित स्थिति</th>
                  <th className="border-b px-4 py-3">सर्वे स्थिति</th>
                  <th className="border-b px-4 py-3">प्रगति</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((record, index) => (
                  <tr key={record.id ?? `${record.villageName}-${index}`}>
                    <td className="border-b px-4 py-3 font-medium">
                      {textValue(record.villageName) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {textValue(record.blockName)} / {textValue(record.panchayatName)}
                    </td>
                    <td className="border-b px-4 py-3">
                      {textValue(record.affectedStatus) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {record.surveyStatus === "completed"
                        ? "पूर्ण"
                        : record.surveyStatus === "incomplete"
                          ? "अपूर्ण"
                          : "लंबित"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {Number(record.progress ?? 0)}%
                    </td>
                  </tr>
                ))}
                {!analysis.loading && surveys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      चुने गए फ़िल्टर में कोई ग्राम रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={questionSearch}
                  onChange={(event) => {
                    setQuestionSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="प्रश्न खोजें..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <select
                value={selectedSectionId}
                onChange={(event) => {
                  const sectionId = event.target.value;
                  setSelectedSectionId(sectionId);

                  const matchingPage = sectionPages.findIndex(
                    (ids) => ids.includes(sectionId)
                  );

                  setCurrentPage(
                    sectionId === "all" ? 1 : matchingPage + 1
                  );
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">सभी अनुभाग</option>

                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.number}. {section.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-6">
              {visibleSections.map(({ section, questions }) => (
                <div key={section.id}>
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                      {section.number}
                    </div>

                    <div>
                      <h2 className="font-bold">{section.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {questions.map(({ question }) => (
                      <button
                        key={question.key}
                        type="button"
                        onClick={() =>
                          openQuestion(section, question)
                        }
                        className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
                      >
                        <FileQuestion className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />

                        <span className="min-w-0 flex-1 text-sm font-medium">
                          {question.label}
                        </span>

                        <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500 sm:inline">
                          {question.type === "count"
                            ? "संख्या"
                            : question.type === "yesno"
                              ? "हाँ / नहीं"
                              : question.type === "choice"
                                ? "विकल्प"
                                : "विवरण"}
                        </span>

                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
                            {hasAnyFilteredQuestions && visibleSections.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                  इस पेज पर कोई प्रश्न नहीं मिला। दूसरे पेज पर जाएँ या खोज बदलें।
                </div>
              )}

              {hasAnyFilteredQuestions && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    पेज {currentPage} / {totalPages} · कुल{" "}
                    {filteredQuestions.length} प्रश्न
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
                    >
                      पिछला
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        aria-current={
                          currentPage === page ? "page" : undefined
                        }
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
                    >
                      अगला
                    </button>
                  </div>
                </div>
              )}

              {!hasAnyFilteredQuestions && (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <Search className="mx-auto h-7 w-7 text-slate-300" />
                  <p className="mt-3 font-semibold">
                    कोई प्रश्न नहीं मिला
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    खोज का शब्द बदलें या दूसरा अनुभाग चुनें।
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={goBack}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {selectedBlock
                ? "ब्लॉक सूची पर वापस जाएँ"
                : "सभी प्रश्नों पर वापस जाएँ"}
            </button>

            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {selectedQuestion.section.title}
            </p>

            <h2 className="mt-2 text-lg font-bold leading-7">
              {selectedQuestion.question.label}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {selectedBlock
                ? `ब्लॉक ${selectedBlock} की ग्राम पंचायत और गाँव-वार जानकारी`
                : "Direct और Indirect के अनुसार उत्तर"}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                {selectedBlock ? (
                  <tr>
                    <th className="border-b px-5 py-3 font-semibold">ग्राम पंचायत</th>
                    <th className="border-b px-5 py-3 font-semibold">गाँव</th>
                    <th className="border-b px-5 py-3 font-semibold">उत्तर</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="border-b px-5 py-3 font-semibold">ब्लॉक</th>
                    <th className="border-b px-5 py-3 font-semibold">Direct</th>
                    <th className="border-b px-5 py-3 font-semibold">Indirect</th>
                    <th className="border-b px-5 py-3 text-right font-semibold">विवरण</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {selectedBlock ? (
                  villageRows.length > 0 ? (
                    villageRows.map((row) => (
                      <tr key={`${row.panchayat}-${row.village}`} className="hover:bg-slate-50">
                        <td className="border-b px-5 py-3 font-medium">{row.panchayat}</td>
                        <td className="border-b px-5 py-3">{row.village}</td>
                        <td className="border-b px-5 py-3">{row.answer}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                        इस ब्लॉक के लिए ग्राम पंचायत और गाँव का survey data उपलब्ध नहीं है।
                      </td>
                    </tr>
                  )
                ) : (
                  blockRows.map((row) => (
                    <tr key={row.block} className="hover:bg-slate-50">
                      <td className="border-b px-5 py-3 font-semibold">{row.block}</td>
                      <td className="border-b px-5 py-3">{row.direct}</td>
                      <td className="border-b px-5 py-3">{row.indirect}</td>
                      <td className="border-b px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedBlock(row.block)}
                          className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
                        >
                          ग्राम पंचायत देखें
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500">
            प्रश्न के उत्तर इस समय प्रदर्शित सर्वर-पेज के रिकॉर्ड से calculate होते हैं।
          </p>
        </section>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">
          कुल {analysis.result?.total ?? 0} रिकॉर्ड · पेज {analysis.page} /{" "}
          {Math.max(analysis.result?.totalPages ?? 0, 1)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={analysis.page <= 1 || analysis.loading}
            onClick={() => analysis.setPage(analysis.page - 1)}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
          >
            पिछला
          </button>
          <button
            type="button"
            disabled={
              analysis.page >= (analysis.result?.totalPages ?? 0) ||
              analysis.loading
            }
            onClick={() => analysis.setPage(analysis.page + 1)}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
          >
            अगला
          </button>
        </div>
      </div>
    </div>
  );
}