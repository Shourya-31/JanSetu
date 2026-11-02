
import { useMemo, useState } from "react";
import {
  ChevronRight,
  MapPinned,
  FileQuestion,
  ArrowLeft,
  CreditCard,
  Fingerprint,
  BadgeCheck,
  Vote,
  BriefcaseBusiness,
  Landmark,
  Sprout,
  HeartHandshake,
  Accessibility,
  HeartPulse,
  Baby,
  Syringe,
  School,
  GraduationCap,
  House,
  Toilet,
  Droplets,
  Lightbulb,
  Stethoscope,
  Pill,
  Users,
  HandHeart,
  FileText,
  Banknote,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

type HouseholdRecord = Record<string, unknown> & {
  id?: string | number;
  blockId?: string | number;
  panchayatId?: string | number;
  villageId?: string | number;
  houseNumber?: number | string;
  headName?: string;
  mobile?: string;
  mobileNumber?: string;
  villageName?: string;
  blockName?: string;
  panchayatName?: string;
  totalMembers?: number | string | null;
  direct?: number | string;
  indirect?: number | string;
  affectedStatus?: string;
  village?: {
    nameHindi?: string;
    affectedStatus?: string;
    gramPanchayat?: {
      nameHindi?: string;
      block?: { nameHindi?: string };
    };
  };
};

type Props = {
  households: HouseholdRecord[];
  onBack?: () => void;
  loading?: boolean;
  error?: Error | null;
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
  icon: LucideIcon;
  groups: Group[];
};

const yesNo = ["हाँ", "नहीं"];
const eligible = ["हाँ", "नहीं", "पात्रता नहीं"];

const pages: Page[] = [
  {
    title: "दस्तावेज़ एवं शासकीय योजनाएँ",
    icon: FileText,
    subtitle: "दस्तावेज़ और शासकीय योजनाओं का विवरण",
    groups: [
      {
        title: "दस्तावेज़ एवं शासकीय योजनाएँ",
        metrics: [
          { key: "rationCard", label: "कितने परिवारों के पास राशन कार्ड नहीं है?", kind: "choice", options: yesNo },
          { key: "noAadhaarMembers", label: "कितने सदस्यों के पास आधार कार्ड नहीं है?", kind: "count" },
          { key: "aadhaarEkyc", label: "कितने राशन कार्ड धारक परिवारों में सभी सदस्यों का आधार e-KYC नहीं हुआ है?", kind: "choice", options: yesNo },
          { key: "noCasteCertificateMembers", label: "कितने सदस्यों के पास जाति प्रमाण-पत्र नहीं है?", kind: "count" },
          { key: "noAyushmanMembers", label: "कितने पात्र सदस्यों के पास आयुष्मान कार्ड नहीं है?", kind: "count" },
          { key: "noVoterIdMembers", label: "कितने 18 वर्ष या उससे अधिक आयु के सदस्यों के पास वोटर ID नहीं है?", kind: "count" },
          { key: "mnregaJobCard", label: "कितने पात्र परिवारों के पास बीवी-जी राम जी जॉब कार्ड नहीं है?", kind: "choice", options: yesNo },
          { key: "noShramikCardMembers", label: "कितने पात्र 18–40 वर्ष के सदस्यों के पास श्रमिक कार्ड नहीं है?", kind: "count" },
          { key: "janDhanAccount", label: "कितने पात्र सदस्यों का जन-धन बैंक खाता नहीं है?", kind: "choice", options: yesNo },
          { key: "bankName", label: "जन-धन खाता किस बैंक में है?", kind: "text" },
          { key: "kcc", label: "कितने पात्र किसानों के पास किसान क्रेडिट कार्ड (KCC) नहीं है?", kind: "choice", options: eligible },
          { key: "forestRightsPatta", label: "कितने पात्र परिवारों को व्यक्तिगत वनाधिकार पट्टा नहीं मिला है?", kind: "choice", options: eligible },
          { key: "marriagecertificate", label: "कितने विवाहित सदस्यों के पास विवाह प्रमाण-पत्र नहीं है?", kind: "choice", options: yesNo },
        ],
      },
    ],
  },
  {
    title: "दिव्यांगता एवं अन्य सहायता",
    icon: Accessibility,
    subtitle: "दिव्यांग सहायता, मृत्यु प्रमाण-पत्र और राशन सुविधा का विवरण",
    groups: [
      {
        title: "दिव्यांगता एवं अन्य सहायता",
        metrics: [
          { key: "needsAssistiveDevice", label: "कितने दिव्यांग सदस्यों को आवश्यक सहायक उपकरण / विशेष सहायता नहीं मिली है?", kind: "choice", options: yesNo },
          {
            key: "assistanceTypes",
            label: "किस प्रकार के सहायक उपकरण / विशेष सहायता की आवश्यकता है?",
            kind: "multi",
            options: ["बैसाखी / छड़ी", "व्हीलचेयर", "श्रवण यंत्र", "ट्राइसाइकिल", "कृत्रिम अंग", "दृष्टि सहायक उपकरण", "अन्य"],
          },
          { key: "deathInLastYear", label: "कितने परिवारों में पिछले 1 वर्ष में मृत्यु हुई है?", kind: "choice", options: yesNo },
          { key: "deathCertificateReceived", label: "कितने परिवारों में मृत्यु होने के बाद भी मृत्यु प्रमाण-पत्र प्राप्त नहीं हुआ है?", kind: "choice", options: yesNo },
          { key: "pmGaribKalyanRation", label: "कितने पात्र परिवारों को PM गरीब कल्याण योजना के तहत निःशुल्क राशन नहीं मिल रहा है?", kind: "choice", options: eligible },
        ],
      },
    ],
  },
  {
    title: "शिक्षा एवं रोजगार",
    icon: GraduationCap,
    subtitle: "बच्चों की शिक्षा और परिवार की आजीविका",
    groups: [
      {
        title: "बच्चे एवं शिक्षा",
        metrics: [
          { key: "childrenWithoutBirthCertificate", label: "कितने बच्चों के पास जन्म प्रमाण-पत्र नहीं है?", kind: "count" },
          { key: "vaccinationStatus", label: "कितने 0–5 वर्ष के बच्चों का पूर्ण टीकाकरण नहीं हुआ है?", kind: "choice", options: ["सभी", "आंशिक", "नहीं", "लागू नहीं"] },
          { key: "anganwadiMeal", label: "कितने 3–5 वर्ष के बच्चों को आंगनवाड़ी से पका भोजन नहीं मिल रहा है?", kind: "choice", options: ["हाँ", "नहीं", "लागू नहीं"] },
          { key: "childrenSchoolStatus", label: "कितने बच्चे स्कूल नहीं जाते हैं?", kind: "choice", options: ["सभी", "कुछ", "कोई नहीं", "लागू नहीं"] },
        ],
      },
      {
        title: "कृषि एवं रोजगार",
        metrics: [
          { key: "unemployedMembers", label: "18–45 वर्ष के कितने सदस्य बेरोजगार हैं?", kind: "count" },
          { key: "pmKisan", label: "कितने पात्र किसानों को पिछले वर्ष PM-KISAN की राशि नहीं मिली?", kind: "choice", options: eligible },
        ],
      },
    ],
  },

  {
    title: "आवास, पानी एवं स्वास्थ्य",
    icon: House,
    subtitle: "परिवार की मूलभूत सुविधाएँ",
    groups: [
      {
        title: "आवास एवं बुनियादी सुविधाएँ",
        metrics: [
          { key: "houseType", label: "कितने परिवार कच्चे या अर्ध-पक्के मकानों में रहते हैं?", kind: "choice", options: ["कच्चा", "अर्ध-पक्का", "पक्का", "अन्य"] },
          { key: "housingSchemeBenefit", label: "कितने पात्र परिवारों को आवास योजना का लाभ नहीं मिला है?", kind: "choice", options: eligible },
          { key: "toiletStatus", label: "कितने परिवारों के घर में शौचालय नहीं है या शौचालय उपयोग में नहीं है?", kind: "choice", options: ["हाँ, उपयोग में", "हाँ, उपयोग में नहीं", "नहीं"] },
          { key: "tapWaterConnection", label: "कितने परिवारों के घर में नल से जल कनेक्शन नहीं है?", kind: "choice", options: yesNo },
          { key: "electricityConnection", label: "कितने परिवारों के घर में बिजली कनेक्शन नहीं है?", kind: "choice", options: yesNo },
        ],
      },
      {
        title: "स्वास्थ्य सुविधाएँ",
        metrics: [
          { key: "familyDisease", label: "कितने परिवारों में कोई सदस्य खाँसी, दमा, TB आदि रोग से ग्रसित है?", kind: "choice", options: yesNo },
          { key: "freeMedicines", label: "कितने परिवारों को गाँव के पास अस्पताल / स्वास्थ्य केंद्र से निःशुल्क दवाइयाँ नहीं मिलती हैं?", kind: "choice", options: ["हाँ", "कभी-कभी", "नहीं"] },
        ],
      },
    ],
  },
  {
    title: "महिला एवं सामाजिक सुरक्षा योजनाएँ",
    icon: HeartHandshake,
    subtitle: "महिला कल्याण, मातृत्व और पेंशन योजनाओं का विवरण",
    groups: [
      {
        title: "महिला एवं मातृत्व योजनाएँ",
        metrics: [
          { key: "jsy", label: "कितनी पात्र महिलाओं को जननी सुरक्षा योजना (JSY) का लाभ नहीं मिला है?", kind: "choice", options: eligible },
          { key: "pmmvy", label: "कितनी पात्र महिलाओं को प्रधानमंत्री मातृ वंदना योजना (PMMVY) का लाभ नहीं मिला है?", kind: "choice", options: eligible },
          { key: "mahtariVandana", label: "कितनी पात्र महिलाओं को महतारी वंदन योजना की राशि नहीं मिली है?", kind: "choice", options: eligible },
        ],
      },
      {
        title: "पेंशन योजनाएँ",
        metrics: [
          { key: "widowPension", label: "कितनी पात्र विधवा महिलाओं को विधवा पेंशन नहीं मिल रही है?", kind: "choice", options: eligible },
          { key: "disabilityPension", label: "कितने पात्र दिव्यांग व्यक्तियों को दिव्यांग पेंशन नहीं मिल रही है?", kind: "choice", options: eligible },
        ],
      },
      {
        title: "अन्य शासकीय योजनाएँ",
        metrics: [
          { key: "eligibleSchemeNotReceived", label: "कितने पात्र परिवारों को किसी सरकारी योजना का लाभ नहीं मिल रहा है?", kind: "choice", options: yesNo },
          { key: "schemeBenefitName", label: "किन सरकारी योजनाओं का लाभ पात्र परिवारों को नहीं मिला है?", kind: "text" },
        ],
      },
    ],
  },
];

const asText = (value: unknown): string =>
  value == null ? "" : String(value).trim();


const questionIcons: Record<string, LucideIcon> = {
  rationCard: CreditCard,
  noAadhaarMembers: Fingerprint,
  aadhaarEkyc: BadgeCheck,
  noCasteCertificateMembers: FileText,
  noAyushmanMembers: HeartPulse,
  noVoterIdMembers: Vote,
  mnregaJobCard: BriefcaseBusiness,
  noShramikCardMembers: Accessibility,
  janDhanAccount: Landmark,
  bankName: Banknote,
  kcc: Sprout,
  forestRightsPatta: Sprout,
  marriagecertificate: FileText,
  needsAssistiveDevice: Accessibility,
  assistanceTypes: Accessibility,
  deathInLastYear: HeartPulse,
  deathCertificateReceived: FileText,
  pmGaribKalyanRation: HandHeart,

  childrenWithoutBirthCertificate: Baby,
  vaccinationStatus: Syringe,
  anganwadiMeal: HandHeart,
  childrenSchoolStatus: School,
  schoolNotGoingReason: GraduationCap,
  otherSchoolReason: FileText,
  unemployedMembers: BriefcaseBusiness,
  pmKisan: Sprout,

  houseType: House,
  housingSchemeBenefit: House,
  toiletStatus: Toilet,
  tapWaterConnection: Droplets,
  electricityConnection: Lightbulb,
  familyDisease: Stethoscope,
  freeMedicines: Pill,

  jsy: Baby,
  pmmvy: Baby,
  mahtariVandana: HandHeart,
  widowPension: HandHeart,
  disabilityPension: Accessibility,
  shgMember: Users,
  priorityNeed1: ClipboardList,
  priorityNeed2: ClipboardList,
  priorityNeed3: ClipboardList,
  eligibleSchemeNotReceived: FileText,
  schemeBenefitName: FileText,
};

function QuestionRow({
  metric,
  onClick,
}: {
  metric: Metric;
  onClick: () => void;
}) {
  const Icon = questionIcons[metric.key] ?? FileQuestion;

  return (
    <button
      type="button"
      onClick={onClick}
      title={metric.label}
      className="group flex min-h-[76px] w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5 text-gray-800">
          {metric.label}
        </span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
          विवरण देखें
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

const getLocation = (household: HouseholdRecord) => {
  const village = asText(household.villageName || household.village?.nameHindi);
  const panchayat = asText(
    household.panchayatName || household.village?.gramPanchayat?.nameHindi
  );
  const block = asText(
    household.blockName || household.village?.gramPanchayat?.block?.nameHindi
  );
  const affectedStatus = asText(
    household.affectedStatus || household.village?.affectedStatus
  ).toLowerCase();
  const affectedGroup: "direct" | "indirect" | null =
    affectedStatus.includes("indirect") || affectedStatus.includes("अप्रत्यक्ष")
      ? "indirect"
      : affectedStatus.includes("direct") || affectedStatus.includes("प्रत्यक्ष")
        ? "direct"
        : null;

  return {
    blockId: asText(household.blockId) || block,
    panchayatId: asText(household.panchayatId) || panchayat,
    villageId: asText(household.villageId) || village,
    block: block || "ब्लॉक उपलब्ध नहीं",
    panchayat: panchayat || "ग्राम पंचायत उपलब्ध नहीं",
    village: village || "गाँव उपलब्ध नहीं",
    affectedStatus: affectedGroup,
  };
};

const isDeficiencyAnswer = (metric: Metric, value: unknown) => {
  if (value === null || value === undefined || value === "") return false;

  if (metric.kind === "count") {
    return Number(value) > 0;
  }

  const answer = asText(value).toLowerCase();

  if (metric.kind === "choice") {
    if (metric.key === "houseType") {
      return ["कच्चा", "अर्ध-पक्का"].includes(answer);
    }
    if (metric.key === "needsAssistiveDevice" || metric.key === "familyDisease" || metric.key === "deathInLastYear") {
      return ["हाँ", "yes"].includes(answer);
    }
    if (["नहीं", "no"].includes(answer)) return true;
    // These options indicate a partial or missing service in this survey.
    if (
      metric.key === "vaccinationStatus" &&
      ["आंशिक", "partial"].includes(answer)
    ) return true;
    if (
      metric.key === "childrenSchoolStatus" &&
      ["कुछ", "some"].includes(answer)
    ) return true;
    if (
      metric.key === "toiletStatus" &&
      answer.includes("उपयोग में नहीं")
    ) return true;
    if (
      metric.key === "freeMedicines" &&
      ["कभी-कभी", "sometimes"].includes(answer)
    ) return true;
    return false;
  }

  // Text and multi-select responses are descriptive, not deficiency flags.
  return false;
};

const getDeficiencyContribution = (metric: Metric, value: unknown) => {
  if (!isDeficiencyAnswer(metric, value)) return 0;
  // Numeric answers represent affected people/children, while yes/no answers
  // represent one affected household.
  return metric.kind === "count" ? Math.max(0, Number(value) || 0) : 1;
};

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
  const [selectedPanchayat, setSelectedPanchayat] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);

  const deficiencyHouseholds = useMemo(
    () => households.filter((household) =>
      getDeficiencyContribution(metric, household[metric.key]) > 0
    ),
    [households, metric]
  );

  const blockRows = useMemo(() => {
    const grouped = new Map<string, {
      id: string; name: string; direct: number; indirect: number;
    }>();
    deficiencyHouseholds.forEach((household) => {
      const location = getLocation(household);
      if (!location.affectedStatus) return;
      const row = grouped.get(location.blockId) ?? {
        id: location.blockId, name: location.block, direct: 0, indirect: 0,
      };
      row[location.affectedStatus] += getDeficiencyContribution(metric, household[metric.key]);
      grouped.set(location.blockId, row);
    });
    return Array.from(grouped.values())
      .sort((a, b) => a.name.localeCompare(b.name, "hi"));
  }, [deficiencyHouseholds, metric]);

  const panchayatRows = useMemo(() => {
    if (!selectedBlock) return [];
    const grouped = new Map<string, {
      id: string; name: string; direct: number; indirect: number;
    }>();
    deficiencyHouseholds.forEach((household) => {
      const location = getLocation(household);
      if (location.blockId !== selectedBlock || !location.affectedStatus) return;
      const row = grouped.get(location.panchayatId) ?? {
        id: location.panchayatId, name: location.panchayat, direct: 0, indirect: 0,
      };
      row[location.affectedStatus] += getDeficiencyContribution(metric, household[metric.key]);
      grouped.set(location.panchayatId, row);
    });
    return Array.from(grouped.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "hi")
    );
  }, [deficiencyHouseholds, selectedBlock, metric]);

  const blockVillageRows = useMemo(() => {
    if (!selectedBlock) return [];
    const grouped = new Map<string, {
      panchayatId: string; villageId: string; panchayat: string; village: string;
      direct: number; indirect: number;
    }>();

    deficiencyHouseholds.forEach((household) => {
      const location = getLocation(household);
      if (location.blockId !== selectedBlock || !location.affectedStatus) return;
      const key = `${location.panchayatId}:${location.villageId}`;
      const row = grouped.get(key) ?? {
        panchayatId: location.panchayatId,
        villageId: location.villageId,
        panchayat: location.panchayat,
        village: location.village,
        direct: 0,
        indirect: 0,
      };
      row[location.affectedStatus] += getDeficiencyContribution(metric, household[metric.key]);
      grouped.set(key, row);
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.panchayat.localeCompare(b.panchayat, "hi") ||
      a.village.localeCompare(b.village, "hi")
    );
  }, [deficiencyHouseholds, selectedBlock, metric]);

  const villageRows = useMemo(() => {
    if (!selectedBlock || !selectedPanchayat) return [];
    const grouped = new Map<string, {
      id: string; name: string; direct: number; indirect: number;
    }>();
    deficiencyHouseholds.forEach((household) => {
      const location = getLocation(household);
      if (
        location.blockId !== selectedBlock ||
        location.panchayatId !== selectedPanchayat ||
        !location.affectedStatus
      ) return;
      const row = grouped.get(location.villageId) ?? {
        id: location.villageId, name: location.village, direct: 0, indirect: 0,
      };
      row[location.affectedStatus] += getDeficiencyContribution(metric, household[metric.key]);
      grouped.set(location.villageId, row);
    });
    return Array.from(grouped.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "hi")
    );
  }, [deficiencyHouseholds, selectedBlock, selectedPanchayat, metric]);

  const villageHouseholds = useMemo(
    () => deficiencyHouseholds.filter((household) => {
      const location = getLocation(household);
      return location.blockId === selectedBlock &&
        location.panchayatId === selectedPanchayat &&
        location.villageId === selectedVillage;
    }),
    [deficiencyHouseholds, selectedBlock, selectedPanchayat, selectedVillage]
  );

  const goBack = () => {
    if (selectedVillage !== null) setSelectedVillage(null);
    else if (selectedPanchayat !== null) setSelectedPanchayat(null);
    else if (selectedBlock !== null) setSelectedBlock(null);
    else onBack();
  };

  const selectedBlockName = blockRows.find((row) => row.id === selectedBlock)?.name;
  const selectedPanchayatName = panchayatRows.find((row) => row.id === selectedPanchayat)?.name;
  const selectedVillageName = villageRows.find((row) => row.id === selectedVillage)?.name;
  const heading = selectedVillage
    ? `गाँव: ${selectedVillageName ?? selectedVillage}`
    : selectedPanchayat
      ? `ग्राम पंचायत: ${selectedPanchayatName ?? selectedPanchayat}`
      : selectedBlock
        ? `ब्लॉक: ${selectedBlockName ?? selectedBlock}`
        : metric.label;

  const displayCount = (household: HouseholdRecord) => {
    const value = household[metric.key];
    return value == null || value === "" ? "—" : asText(value);
  };

  const totalCount = (row: { direct: number; indirect: number }) =>
    row.direct + row.indirect;

  return (
    <div className="space-y-5 text-slate-900">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Household Survey Analysis
            </p>
            <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-xs text-amber-700">
              केवल कमी दर्शाने वाले उत्तर दिखाए जा रहे हैं।
            </p>
          </div>
          <button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            {selectedVillage ? "गाँव सूची" : selectedPanchayat ? "ग्राम पंचायत सूची" : selectedBlock ? "ब्लॉक सूची" : "प्रश्न सूची"} पर वापस जाएँ
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <button onClick={() => { setSelectedBlock(null); setSelectedPanchayat(null); setSelectedVillage(null); }} className={`font-semibold ${!selectedBlock ? "text-blue-700" : "text-slate-500 hover:text-blue-700"}`}>सभी ब्लॉक</button>
        {selectedBlock && <><ChevronRight className="h-4 w-4 text-slate-400" /><button onClick={() => { setSelectedPanchayat(null); setSelectedVillage(null); }} className={`font-semibold ${!selectedPanchayat ? "text-blue-700" : "text-slate-500 hover:text-blue-700"}`}>{selectedBlockName ?? selectedBlock}</button></>}
        {selectedPanchayat && <><ChevronRight className="h-4 w-4 text-slate-400" /><button onClick={() => setSelectedVillage(null)} className={`font-semibold ${!selectedVillage ? "text-blue-700" : "text-slate-500 hover:text-blue-700"}`}>{selectedPanchayatName ?? selectedPanchayat}</button></>}
        {selectedVillage && <><ChevronRight className="h-4 w-4 text-slate-400" /><span className="font-semibold text-blue-700">{selectedVillageName ?? selectedVillage}</span></>}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{selectedVillage ? "परिवार-वार विवरण" : selectedPanchayat ? "ग्राम-वार विवरण" : selectedBlock ? "ग्राम पंचायत एवं गाँव-वार विवरण" : "ब्लॉक-वार विवरण"}</h3>
            <p className="mt-1 text-xs text-slate-500">चयनित प्रश्न के अनुसार कमी वाले उत्तरों का विवरण</p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {selectedVillage ? `${villageHouseholds.length} परिवार` : selectedPanchayat ? `${villageRows.length} गाँव` : selectedBlock ? `${blockVillageRows.length} गाँव` : `${blockRows.length} ब्लॉक`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              {selectedVillage ? (
                <tr>
                  <th className="px-5 py-3 font-semibold">मकान नंबर</th>
                  <th className="px-5 py-3 font-semibold">परिवार के मुखिया का नाम</th>
                  <th className="px-5 py-3 font-semibold">मोबाइल नंबर</th>
                  <th className="px-5 py-3 font-semibold">उत्तर / कमी की संख्या</th>
                </tr>
              ) : selectedPanchayat ? (
                <tr>
                  <th className="px-5 py-3 font-semibold">गाँव</th>
                  <th className="px-5 py-3 font-semibold">उत्तर / कमी की संख्या</th>
                  <th className="px-5 py-3 text-right font-semibold">विवरण</th>
                </tr>
              ) : selectedBlock ? (
                <tr>
                  <th className="px-5 py-3 font-semibold">ग्राम पंचायत</th>
                  <th className="px-5 py-3 font-semibold">गाँव</th>
                  <th className="px-5 py-3 font-semibold">उत्तर / कमी की संख्या</th>
                  <th className="px-5 py-3 text-right font-semibold">विवरण</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-3 font-semibold">ब्लॉक</th>
                  <th className="px-5 py-3 font-semibold">Direct Affected</th>
                  <th className="px-5 py-3 font-semibold">Indirect Affected</th>
                  <th className="px-5 py-3 text-right font-semibold">विवरण</th>
                </tr>
              )}
            </thead>
            <tbody>
              {selectedVillage ? (
                villageHouseholds.length ? villageHouseholds.map((household, index) => (
                  <tr key={asText(household.id) || `${asText(household.houseNumber)}-${index}`} className="transition hover:bg-blue-50/60">
                    <td className="px-5 py-4">{asText(household.houseNumber) || "—"}</td>
                    <td className="px-5 py-4">{asText(household.headName) || "—"}</td>
                    <td className="px-5 py-4">{asText(household.mobile || household.mobileNumber) || "—"}</td>
                    <td className="px-5 py-4 font-semibold">{displayCount(household)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">इस गाँव में इस प्रश्न से संबंधित कमी का रिकॉर्ड नहीं है।</td></tr>
                )
              ) : selectedPanchayat ? (
                villageRows.length ? villageRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-blue-50/60">
                    <td className="px-5 py-4">{row.name}</td>
                    <td className="px-5 py-4 font-semibold">{totalCount(row)}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => setSelectedVillage(row.id)} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900">खोलें <ChevronRight className="h-4 w-4" /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-500">इस ग्राम पंचायत में कोई संबंधित कमी दर्ज नहीं है।</td></tr>
                )
              ) : selectedBlock ? (
                blockVillageRows.length ? blockVillageRows.map((row) => (
                  <tr key={`${row.panchayatId}:${row.villageId}`} className="transition hover:bg-blue-50/60">
                    <td className="px-5 py-4 font-medium">{row.panchayat}</td>
                    <td className="px-5 py-4">{row.village}</td>
                    <td className="px-5 py-4 font-semibold">{totalCount(row)}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => { setSelectedPanchayat(row.panchayatId); setSelectedVillage(row.villageId); }} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900">खोलें <ChevronRight className="h-4 w-4" /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">इस ब्लॉक में कोई संबंधित कमी दर्ज नहीं है।</td></tr>
                )
              ) : blockRows.length ? blockRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-blue-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-800">{row.name}</td>
                  <td className="px-5 py-4 font-semibold">{row.direct}</td>
                  <td className="px-5 py-4 font-semibold">{row.indirect}</td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => setSelectedBlock(row.id)} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900">खोलें <ChevronRight className="h-4 w-4" /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">इस प्रश्न के लिए कोई कमी वाला रिकॉर्ड उपलब्ध नहीं है।</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!selectedVillage && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">ग्राम पंचायत और गाँव के सामने दिए गए विवरण बटन से संबंधित परिवारों के उत्तर देखें।</p>}
      </div>
    </div>
  );
}

export default function HouseholdSurveyAnalysis({
  households,
  onBack,
  loading = false,
  error = null,
}: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  if (error) throw error;
  const currentPage = pages[pageIndex];

  if (selectedMetric) {
    return (
      <div className="space-y-6" aria-busy={loading}>
        <QuestionDetailPage
          metric={selectedMetric}
          households={households}
          onBack={() => setSelectedMetric(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-busy={loading}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          सर्वे प्रकार चुनें
        </button>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <MapPinned className="h-4 w-4" />
          परिवार सर्वेक्षण विश्लेषण
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Household Survey Analysis
        </h1>
        <p className="mt-1 text-gray-500">
          प्रश्न चुनें और ब्लॉक से ग्राम स्तर तक विश्लेषण देखें।
        </p>
      </section>

      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
            {pageIndex + 1}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentPage.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        {currentPage.groups.map((group) => (
          <section
            key={group.title}
            className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="font-semibold text-gray-800">{group.title}</h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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