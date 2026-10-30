
import { useMemo, useState } from "react";
import { ChevronRight, FileQuestion, ArrowLeft } from "lucide-react";
import { SurveyAnalysisControls } from "./SurveyAnalysisControls";
import { useAdminSurveyAnalysis } from "./useAdminSurveyAnalysis";

type HouseholdRecord = Record<string, unknown> & {
  id?: string;
  isCompleted?: boolean;
  completed?: boolean;
  houseNumber?: number | string;
  headName?: string;
  mobileNumber?: string;
  villageName?: string;
  blockName?: string;
  panchayatName?: string;
  totalMembers?: number | string | null;
};

type Props = {
  onBack?: () => void;
};

type Metric = {
  key: string;
  label: string;
  kind: "count" | "choice" | "text" | "multi";
  options?: string[];
};

type Group = {
  title: string;
  metrics: Metric[];
};

type Page = {
  title: string;
  subtitle: string;
  groups: Group[];
};

const yesNo = ["हाँ", "नहीं"];
const eligible = ["हाँ", "नहीं", "पात्रता नहीं"];

const pages: Page[] = [
  {
    title: "सामान्य जानकारी एवं जनसांख्यिकी",
    subtitle: "परिवार की पहचान और सदस्य संख्या",
    groups: [
      {
        title: "परिवार की सामान्य जानकारी",
        metrics: [
          { key: "headName", label: "परिवार के मुखिया का नाम", kind: "text" },
          { key: "surveyDate", label: "सर्वेक्षण की तारीख", kind: "text" },
          { key: "surveyorName", label: "सर्वेक्षक का नाम", kind: "text" },
        ],
      },
      {
        title: "परिवार की जनसांख्यिकी",
        metrics: [
          {
            key: "caste",
            label: "जाति के अनुसार परिवार",
            kind: "choice",
            options: [
              "सामान्य",
              "अन्य पिछड़ा वर्ग",
              "अनुसूचित जाति",
              "अनुसूचित जनजाति",
              "अबूझमाड़िया अनुसूचित जनजाति",
            ],
          },
          { key: "isBpl", label: "BPL परिवार", kind: "choice", options: yesNo },
          { key: "totalMembers", label: "परिवार के कुल सदस्य", kind: "count" },
          { key: "elderly", label: "बुजुर्ग सदस्यों की संख्या", kind: "count" },
          { key: "children", label: "बच्चों की संख्या", kind: "count" },
          { key: "women", label: "महिला सदस्यों की संख्या", kind: "count" },
        ],
      },
    ],
  },
  {
    title: "दस्तावेज़ एवं दिव्यांग सहायता",
    subtitle: "दस्तावेज़ और शासकीय योजनाओं का विवरण",
    groups: [
      {
        title: "दस्तावेज़ एवं शासकीय योजनाएँ",
        metrics: [
          { key: "rationCard", label: "राशन कार्ड उपलब्धता", kind: "choice", options: yesNo },
          { key: "noAadhaarMembers", label: "आधार कार्ड नहीं रखने वाले सदस्य", kind: "count" },
          { key: "aadhaarEkyc", label: "राशन कार्ड के सभी सदस्यों का आधार e-KYC", kind: "choice", options: yesNo },
          { key: "noCasteCertificateMembers", label: "जाति प्रमाण-पत्र नहीं रखने वाले सदस्य", kind: "count" },
          { key: "noAyushmanMembers", label: "आयुष्मान कार्ड नहीं रखने वाले सदस्य", kind: "count" },
          { key: "noVoterIdMembers", label: "18+ आयु में वोटर ID नहीं रखने वाले सदस्य", kind: "count" },
          { key: "mnregaJobCard", label: "वीबी–जी राम जी जॉब कार्ड", kind: "choice", options: yesNo },
          { key: "noShramikCardMembers", label: "पात्र 18–40 वर्ष के श्रमिक कार्ड नहीं रखने वाले सदस्य", kind: "count" },
          { key: "janDhanAccount", label: "जन-धन खाता उपलब्धता", kind: "choice", options: yesNo },
          { key: "bankName", label: "जन-धन खाते का बैंक", kind: "text" },
          { key: "kcc", label: "किसान क्रेडिट कार्ड (KCC)", kind: "choice", options: eligible },
          { key: "forestRightsPatta", label: "व्यक्तिगत वनाधिकार पट्टा", kind: "choice", options: eligible },
          { key: "marriagecertificate", label: "विवाह प्रमाण-पत्र उपलब्धता", kind: "choice", options: yesNo },
        ],
      },
      {
        title: "दिव्यांगता एवं अन्य सहायता",
        metrics: [
          { key: "needsAssistiveDevice", label: "सहायक उपकरण / विशेष सहायता की जरूरत", kind: "choice", options: yesNo },
          {
            key: "assistanceTypes",
            label: "आवश्यक सहायता के प्रकार",
            kind: "multi",
            options: ["बैसाखी / छड़ी", "व्हीलचेयर", "श्रवण यंत्र", "ट्राइसाइकिल", "कृत्रिम अंग", "दृष्टि सहायक उपकरण", "अन्य"],
          },
          { key: "deathInLastYear", label: "पिछले 1 वर्ष में परिवार में मृत्यु", kind: "choice", options: yesNo },
          { key: "deathCertificateReceived", label: "मृत्यु प्रमाण-पत्र प्राप्त हुआ", kind: "choice", options: yesNo },
          { key: "pmGaribKalyanRation", label: "PM गरीब कल्याण योजना के तहत निःशुल्क राशन", kind: "choice", options: eligible },
        ],
      },
    ],
  },
  {
    title: "शिक्षा एवं रोजगार",
    subtitle: "बच्चों की शिक्षा और परिवार की आजीविका",
    groups: [
      {
        title: "बच्चे एवं शिक्षा",
        metrics: [
          { key: "childrenWithoutBirthCertificate", label: "जन्म प्रमाण-पत्र नहीं रखने वाले बच्चे", kind: "count" },
          { key: "vaccinationStatus", label: "0–5 वर्ष के बच्चों का टीकाकरण", kind: "choice", options: ["सभी", "आंशिक", "नहीं", "लागू नहीं"] },
          { key: "anganwadiMeal", label: "3–5 वर्ष के बच्चों को आंगनवाड़ी में पका भोजन", kind: "choice", options: ["हाँ", "नहीं", "लागू नहीं"] },
          { key: "childrenSchoolStatus", label: "परिवार के बच्चों का स्कूल जाना", kind: "choice", options: ["सभी", "कुछ", "कोई नहीं", "लागू नहीं"] },
          { key: "schoolNotGoingReason", label: "स्कूल नहीं जाने के कारण", kind: "multi", options: ["दूरी", "अध्यापक की कमी", "गरीबी", "घर के काम/धंधे में सहयोग", "अन्य"] },
          { key: "otherSchoolReason", label: "स्कूल नहीं जाने का अन्य कारण", kind: "text" },
        ],
      },
      {
        title: "कृषि एवं रोजगार",
        metrics: [
          { key: "unemployedMembers", label: "18–45 वर्ष के बेरोजगार सदस्य", kind: "count" },
          { key: "pmKisan", label: "पिछले वर्ष PM-KISAN की राशि मिली", kind: "choice", options: eligible },
          { key: "miningEmployment", label: "परिवार का कोई सदस्य खनन में कार्यरत", kind: "choice", options: yesNo },
          { key: "annualIncome", label: "परिवार की कुल वार्षिक आय (₹)", kind: "count" },
          { key: "mainIncomeSource", label: "परिवार की आय का मुख्य स्रोत", kind: "text" },
          { key: "livestockSource", label: "आजीविका पशुपालन से जुड़ी है", kind: "choice", options: yesNo },
          { key: "otherLivestockSource", label: "पशुपालन का विवरण", kind: "text" },
          { key: "animalEmployment", label: "पशु-आधारित कार्य से रोजगार", kind: "choice", options: eligible },
        ],
      },
    ],
  },

  {
    title: "आवास, पानी एवं स्वास्थ्य",
    subtitle: "परिवार की मूलभूत सुविधाएँ",
    groups: [
      {
        title: "आवास एवं बुनियादी सुविधाएँ",
        metrics: [
          { key: "houseType", label: "मकान का प्रकार", kind: "choice", options: ["कच्चा", "अर्ध-पक्का", "पक्का", "अन्य"] },
          { key: "housingSchemeBenefit", label: "आवास योजना का लाभ मिला", kind: "choice", options: eligible },
          { key: "toiletStatus", label: "घर में शौचालय उपलब्धता", kind: "choice", options: yesNo },
          { key: "tapWaterConnection", label: "नल से जल कनेक्शन उपलब्धता", kind: "choice", options: yesNo },
          { key: "drinkingWaterSource", label: "पीने के पानी का मुख्य स्रोत", kind: "choice", options: ["नल", "हैंडपंप", "कुआँ", "बोरवेल", "नदी/तालाब", "अन्य"] },
          { key: "electricityConnection", label: "बिजली कनेक्शन उपलब्धता", kind: "choice", options: yesNo },
          { key: "solarEnergy", label: "सौर ऊर्जा की सुविधा", kind: "choice", options: yesNo },
        ],
      },
      {
        title: "स्वास्थ्य सुविधाएँ",
        metrics: [
          { key: "familyDisease", label: "परिवार में किसी सदस्य को गंभीर बीमारी", kind: "choice", options: yesNo },
          { key: "freeMedicines", label: "निःशुल्क दवाइयाँ प्राप्त होती हैं", kind: "choice", options: eligible },
        ],
      },
    ],
  },
  {
    title: "महिला, SHG एवं प्राथमिक जरूरतें",
    subtitle: "महिला कल्याण, पेंशन और अन्य आवश्यकताएँ",
    groups: [
      {
        title: "महिला एवं मातृत्व योजनाएँ",
        metrics: [
          { key: "jsy", label: "जननी सुरक्षा योजना का लाभ", kind: "choice", options: eligible },
          { key: "pmmvy", label: "प्रधानमंत्री मातृ वंदना योजना का लाभ", kind: "choice", options: eligible },
          { key: "mahtariVandana", label: "महतारी वंदन योजना का लाभ", kind: "choice", options: eligible },
        ],
      },
      {
        title: "पेंशन एवं स्व-सहायता समूह",
        metrics: [
          { key: "widowPension", label: "विधवा पेंशन का लाभ", kind: "choice", options: eligible },
          { key: "disabilityPension", label: "दिव्यांग पेंशन का लाभ", kind: "choice", options: eligible },
          { key: "shgMember", label: "परिवार की महिला SHG की सदस्य है", kind: "choice", options: yesNo },
        ],
      },
      {
        title: "प्राथमिक जरूरतें एवं योजनाएँ",
        metrics: [
          { key: "priorityNeed1", label: "प्राथमिक आवश्यकता 1", kind: "text" },
          { key: "priorityNeed2", label: "प्राथमिक आवश्यकता 2", kind: "text" },
          { key: "priorityNeed3", label: "प्राथमिक आवश्यकता 3", kind: "text" },
          { key: "eligibleSchemeNotReceived", label: "पात्र होने पर भी योजना का लाभ नहीं मिला", kind: "choice", options: yesNo },
          { key: "schemeBenefitName", label: "जिस योजना का लाभ नहीं मिला उसका नाम", kind: "text" },
        ],
      },
    ],
  },
];

const asText = (value: unknown): string =>
  value == null ? "" : String(value).trim();

const isAnswered = (value: unknown): boolean =>
  Array.isArray(value) ? value.length > 0 : asText(value) !== "";

function QuestionRow({
  metric,
  onClick,
}: {
  metric: Metric;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <FileQuestion className="h-5 w-5 shrink-0 text-blue-600" />
        <span className="font-medium text-gray-800">{metric.label}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-sm text-blue-600">
        विवरण देखें
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function QuestionDetailPage({
  metric,
  households,
  onBack,
}: {
  metric: Metric;
  households: HouseholdRecord[];
  onBack: () => void;
}) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [selectedPanchayat, setSelectedPanchayat] = useState<string | null>(null);

  const blocks = Array.from(
    new Set(households.map((household) => asText(household.blockName)).filter(Boolean)),
  );

  const blockHouseholds = households.filter(
    (household) => asText(household.blockName) === selectedBlock
  );

  const villageRows = useMemo(() => {
    if (!selectedBlock) return [];

    const pairs = new Map<
      string,
      { panchayat: string; village: string; count: number }
    >();

    blockHouseholds.forEach((household) => {
      const panchayat = asText(household.panchayatName);
      const village = asText(household.villageName);

      if (!panchayat || !village) return;

      const key = `${panchayat}__${village}`;
      const existing = pairs.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        pairs.set(key, { panchayat, village, count: 1 });
      }
    });

    return Array.from(pairs.values());
  }, [blockHouseholds, selectedBlock]);

  const villageHouseholds = blockHouseholds.filter(
    (household) =>
      asText(household.villageName) === selectedVillage &&
      asText(household.panchayatName) === selectedPanchayat
  );

  const goBack = () => {
    if (selectedVillage !== null) {
      setSelectedVillage(null);
      setSelectedPanchayat(null);
    } else if (selectedBlock !== null) {
      setSelectedBlock(null);
    } else {
      onBack();
    }
  };

  const heading = selectedVillage
    ? `गाँव: ${selectedVillage}`
    : selectedBlock
      ? `ब्लॉक: ${selectedBlock}`
      : metric.label;

  const formatCount = (household: HouseholdRecord) => {
    const value = household[metric.key];

    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return asText(value);
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        {selectedVillage
          ? "गाँव की टेबल पर वापस जाएँ"
          : selectedBlock
            ? "ब्लॉक की टेबल पर वापस जाएँ"
            : "प्रश्नों पर वापस जाएँ"}
      </button>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>
        {(selectedBlock || selectedVillage) && (
          <p className="mt-1 text-sm text-gray-500">{metric.label}</p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          प्रश्न का सारांश वर्तमान सर्वर-पेज के वास्तविक रिकॉर्ड पर आधारित है।
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-50">
            {selectedVillage ? (
              <tr>
                <th className="border-b px-5 py-3 font-semibold">मकान नंबर</th>
                <th className="border-b px-5 py-3 font-semibold">
                  परिवार के मुखिया का नाम
                </th>
                <th className="border-b px-5 py-3 font-semibold">मोबाइल नंबर</th>
                <th className="border-b px-5 py-3 font-semibold">काउंट</th>
              </tr>
            ) : selectedBlock ? (
              <tr>
                <th className="border-b px-5 py-3 font-semibold">ग्राम पंचायत</th>
                <th className="border-b px-5 py-3 font-semibold">गाँव</th>
                <th className="border-b px-5 py-3 font-semibold">काउंट</th>
              </tr>
            ) : (
              <tr>
                <th className="border-b px-5 py-3 font-semibold">ब्लॉक</th>
                <th className="border-b px-5 py-3 font-semibold">उत्तर वाले परिवार</th>
                <th className="border-b px-5 py-3 font-semibold">इस पेज के रिकॉर्ड</th>
                <th className="border-b px-5 py-3 text-right font-semibold">
                  विवरण
                </th>
              </tr>
            )}
          </thead>

          <tbody>
            {selectedVillage ? (
              villageHouseholds.length > 0 ? (
                villageHouseholds.map((household, index) => (
                  <tr
                    key={`${asText(household.houseNumber)}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-5 py-3">
                      {asText(household.houseNumber) || "—"}
                    </td>
                    <td className="border-b px-5 py-3">
                      {asText(household.headName) || "—"}
                    </td>
                    <td className="border-b px-5 py-3">
                      {asText(household.mobileNumber) || "—"}
                    </td>
                    <td className="border-b px-5 py-3">
                      {formatCount(household)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                    इस गाँव के मकान रिकॉर्ड उपलब्ध नहीं हैं।
                  </td>
                </tr>
              )
            ) : selectedBlock ? (
              villageRows.length > 0 ? (
                villageRows.map((row) => (
                  <tr
                    key={`${row.panchayat}-${row.village}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b px-5 py-3">{row.panchayat}</td>
                    <td className="border-b px-5 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPanchayat(row.panchayat);
                          setSelectedVillage(row.village);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {row.village}
                      </button>
                    </td>
                    <td className="border-b px-5 py-3">{row.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-500">
                    इस ब्लॉक के रिकॉर्ड उपलब्ध नहीं हैं।
                  </td>
                </tr>
              )
            ) : (
              blocks.map((block) => {
                const records = households.filter(
                  (household) => asText(household.blockName) === block
                );
                const answered = records.filter((household) =>
                  isAnswered(household[metric.key]),
                ).length;

                return (
                  <tr key={block} className="hover:bg-gray-50">
                    <td className="border-b px-5 py-3 font-medium">
                      ब्लॉक: {block}
                    </td>
                    <td className="border-b px-5 py-3">{answered}</td>
                    <td className="border-b px-5 py-3">{records.length}</td>
                    <td className="border-b px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBlock(block)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        विवरण देखें →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HouseholdSurveyAnalysis({
  onBack,
}: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const analysis = useAdminSurveyAnalysis<HouseholdRecord>("households");
  const safeHouseholds = analysis.result?.records ?? [];
  const stats = analysis.result?.stats;

  const currentPage = pages[pageIndex];
  const filters = (
    <SurveyAnalysisControls
      kind="households"
      {...analysis}
      onRefresh={analysis.retry}
    />
  );
  const retryMessage = analysis.error || analysis.hierarchyError;
  const statusView = (
    <>
      {retryMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <span>{retryMessage}</span>
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
          परिवार सर्वे रिकॉर्ड लोड हो रहे हैं...
        </p>
      )}
      {!analysis.loading && !analysis.error && safeHouseholds.length === 0 && (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
          चुने गए फ़िल्टर में कोई परिवार सर्वे रिकॉर्ड नहीं मिला।
        </p>
      )}
    </>
  );
  const pagination = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-500">
        कुल {analysis.result?.total ?? 0} रिकॉर्ड · पेज{" "}
        {analysis.page} / {Math.max(analysis.result?.totalPages ?? 0, 1)}
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
  );

  if (selectedMetric) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Survey Analysis
          </h1>
          <p className="mt-1 text-gray-500">
            विश्लेषण शुरू करने के लिए सर्वे प्रश्न चुनें।
          </p>
        </div>
        {filters}
        {statusView}
        <QuestionDetailPage
          metric={selectedMetric}
          households={safeHouseholds}
          onBack={() => setSelectedMetric(null)}
        />
        {pagination}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Household Analysis
          </h1>
          <p className="mt-1 text-gray-500">
            प्रश्न चुनें और ब्लॉक से ग्राम पंचायत, गाँव एवं परिवार-वार उत्तरों का विश्लेषण देखें।
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            ← वापस जाएँ
          </button>
        )}
      </div>

      {filters}
      {statusView}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">कुल परिवार रिकॉर्ड</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats?.total ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">पूर्ण सर्वेक्षण</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats?.completed ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">अपूर्ण सर्वेक्षण</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats?.incomplete ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">पूर्णता प्रतिशत</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats?.completionPercent ?? 0}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">
          इस पेज पर रिकॉर्ड: {safeHouseholds.length}
        </p>
        {safeHouseholds.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3">मकान नंबर</th>
                  <th className="border-b px-4 py-3">मुखिया का नाम</th>
                  <th className="border-b px-4 py-3">मोबाइल नंबर</th>
                  <th className="border-b px-4 py-3">ब्लॉक</th>
                  <th className="border-b px-4 py-3">ग्राम पंचायत</th>
                  <th className="border-b px-4 py-3">गाँव</th>
                  <th className="border-b px-4 py-3">सदस्य</th>
                  <th className="border-b px-4 py-3">स्थिति</th>
                </tr>
              </thead>

              <tbody>
                {safeHouseholds.map((household, index) => (
                  <tr key={household.id ?? `${asText(household.houseNumber)}-${index}`}>
                    <td className="border-b px-4 py-3">
                      {asText(household.houseNumber) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {asText(household.headName) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {asText(household.mobileNumber) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {asText(household.blockName) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {asText(household.panchayatName) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {asText(household.villageName) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {asText(household.totalMembers) || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {household.isCompleted ? "पूर्ण" : "अपूर्ण"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentPage.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentPage.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pages.map((page, index) => (
            <button
              key={page.title}
              type="button"
              onClick={() => setPageIndex(index)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                pageIndex === index
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {index + 1}. {page.title}
            </button>
          ))}
        </div>

        {currentPage.groups.map((group) => (
          <section
            key={group.title}
            className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="font-semibold text-gray-800">{group.title}</h3>

            <div className="space-y-3">
              {group.metrics.map((metric) => (
                <QuestionRow
                  key={metric.key}
                  metric={metric}
                  onClick={() => setSelectedMetric(metric)}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() =>
              setPageIndex((index) => Math.max(0, index - 1))
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← पिछला सेक्शन
          </button>

          <span className="text-sm text-gray-500">
            सेक्शन {pageIndex + 1} / {pages.length}
          </span>

          <button
            type="button"
            disabled={pageIndex === pages.length - 1}
            onClick={() =>
              setPageIndex((index) =>
                Math.min(pages.length - 1, index + 1)
              )
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            अगला सेक्शन →
          </button>
        </div>
      </div>
    </div>
  );
}
