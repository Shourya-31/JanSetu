import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  MapPinned,
  Building2,
  House,
  Store,
  Signal,
  Zap,
  Route,
  Droplets,
  Toilet,
  Stethoscope,
  ClipboardList,
  Baby,
  GraduationCap,
  School,
  HeartPulse,
  BriefcaseBusiness,
  Users,
  Trash2,
  HandCoins,
  Construction,
  Accessibility,
  Pill,
  Sun,
  Landmark,
  Waves,
  HeartHandshake,
  FileText,
} from "lucide-react";

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
    subtitle: "आवास एवं ग्राम की बुनियादी सुविधाओं में कमी",
    questions: [
      { key: "fairPriceShop", label: "कितने ग्रामों में शासकीय उचित मूल्य की दुकान संचालित नहीं है?", type: "yesno", options: yesNo },
      { key: "mobileNetwork", label: "कितने ग्रामों में मोबाइल नेटवर्क की सुविधा उपलब्ध नहीं है?", type: "yesno", options: yesNo },
      { key: "electricity", label: "कितने ग्रामों में बिजली की सुविधा उपलब्ध नहीं है?", type: "yesno", options: yesNo },
      { key: "road", label: "कितने ग्राम ब्लॉक से पक्की सड़क से जुड़े नहीं हैं?", type: "yesno", options: yesNo },
      { key: "odf", label: "कितने ग्राम ODF स्थिति में नहीं हैं?", type: "choice", options: ["ODF", "ODF+", "ODF++", "Not ODF"] },
      { key: "vet", label: "कितने ग्रामों में पशु चिकित्सक नहीं आते हैं?", type: "yesno", options: yesNo },
      { key: "rainCutoff", label: "कितने ग्रामों का संपर्क बारिश के कारण कट जाता है?", type: "yesno", options: yesNo },
    ],
  },
  {
    id: "anganwadi",
    number: 2,
    title: "आंगनबाड़ी",
    subtitle: "केंद्रों में बुनियादी सुविधाओं एवं सेवाओं की कमी",
    questions: [
      { key: "buildingAvailability", label: "कितने आंगनबाड़ी केंद्रों में अपना भवन उपलब्ध नहीं है?", type: "choice" },
      { key: "buildingCondition", label: "कितने आंगनबाड़ी केंद्रों के भवन की स्थिति खराब है?", type: "choice" },
      { key: "operation", label: "कितने आंगनबाड़ी केंद्र नियमित रूप से संचालित नहीं होते हैं?", type: "choice" },
      { key: "nutritionServices", label: "कितने आंगनबाड़ी केंद्रों में पोषण आहार एवं अन्य सेवाएँ पर्याप्त नहीं हैं?", type: "choice" },
      { key: "toiletCondition", label: "कितने आंगनबाड़ी केंद्रों में उपयोग योग्य शौचालय नहीं है?", type: "choice" },
      { key: "drinkingWater", label: "कितने आंगनबाड़ी केंद्रों में पेयजल सुविधा उपलब्ध नहीं है?", type: "choice" },
      { key: "watersupply", label: "कितने आंगनबाड़ी केंद्रों में चालू जलापूर्ति नहीं है?", type: "choice" },
      { key: "electricity", label: "कितने आंगनबाड़ी केंद्रों में बिजली सुविधा उपलब्ध नहीं है?", type: "choice" },
    ],
  },
  {
    id: "children",
    number: 3,
    title: "बच्चे एवं शिक्षा",
    subtitle: "बच्चों के दस्तावेज़ एवं शिक्षा से जुड़ी कमियाँ",
    questions: [
      { key: "childrenWithoutAadhaar", label: "कितने बच्चों के पास आधार कार्ड नहीं है?", type: "count" },
      { key: "childrenWithoutAPAAR", label: "कितने बच्चों के पास APAAR ID नहीं है?", type: "count" },
      { key: "childrenNotAttendingSchool", label: "6–18 वर्ष के कितने बच्चे विद्यालय नहीं जाते हैं?", type: "count" },
      { key: "dropoutChildren", label: "कितने बच्चों ने विद्यालय छोड़ दिया है?", type: "count" },
    ],
  },
  {
    id: "school",
    number: 4,
    title: "विद्यालय की बुनियादी सुविधाएँ",
    subtitle: "विद्यालयों में आधारभूत सुविधाओं की कमी",
    questions: [
      { key: "building", label: "कितने विद्यालयों का अपना भवन नहीं है?", type: "choice" },
      { key: "buildingCondition", label: "कितने विद्यालयों के भवन की स्थिति खराब है?", type: "choice" },
      { key: "toilets", label: "कितने विद्यालयों में बालक-बालिका के अलग उपयोग योग्य शौचालय नहीं हैं?", type: "choice" },
      { key: "drinkingWater", label: "कितने विद्यालयों में पेयजल सुविधा उपलब्ध नहीं है?", type: "choice" },
      { key: "electricity", label: "कितने विद्यालयों में बिजली सुविधा उपलब्ध नहीं है?", type: "choice" },
      { key: "ramp", label: "कितने विद्यालयों में दिव्यांग बच्चों के लिए रैंप नहीं है?", type: "choice" },
    ],
  },
  {
    id: "hostel",
    number: 5,
    title: "आश्रम / छात्रावास",
    subtitle: "छात्रावासों की स्थिति एवं मूलभूत सुविधाएँ",
    questions: [
      { key: "condition", label: "कितने आश्रम / छात्रावासों की स्थिति जर्जर है या नए भवन की आवश्यकता है?", type: "choice" },
      { key: "washrooms", label: "कितने आश्रम / छात्रावासों में उपयोग योग्य शौचालय नहीं हैं?", type: "choice" },
    ],
  },
  {
    id: "health",
    number: 6,
    title: "स्वास्थ्य एवं पोषण",
    subtitle: "स्वास्थ्य केंद्रों की उपलब्धता एवं सेवाओं में कमी",
    questions: [
      { key: "healthCenterType", label: "कितने ग्रामों में स्वास्थ्य केंद्र उपलब्ध नहीं है?", type: "choice" },
      { key: "regularOperation", label: "कितने स्वास्थ्य केंद्र नियमित रूप से संचालित नहीं होते हैं?", type: "choice" },
      { key: "medicinesEquipment", label: "कितने स्वास्थ्य केंद्रों में आवश्यक दवाइयाँ एवं उपकरण उपलब्ध नहीं हैं?", type: "choice" },
      { key: "medicalStaff", label: "कितने स्वास्थ्य केंद्रों में चिकित्सा कर्मचारी नियमित उपलब्ध नहीं हैं?", type: "choice" },
    ],
  },
  {
    id: "water",
    number: 7,
    title: "पेयजल सुविधा",
    subtitle: "पेयजल की उपलब्धता एवं गुणवत्ता संबंधी समस्याएँ",
    questions: [
      { key: "tapWaterAvailability", label: "कितने ग्रामों में नल-जल योजना से कार्यशील नल द्वारा पेयजल उपलब्ध नहीं है?", type: "choice" },
      { key: "summerWaterCondition", label: "कितने ग्रामों में गर्मियों के दौरान पेयजल की गंभीर समस्या या पूर्ण अनुपलब्धता है?", type: "choice" },
      { key: "drinkingQuality", label: "कितने ग्रामों में उपलब्ध पेयजल पीने योग्य नहीं है?", type: "choice" },
      { key: "waterQualityProblem", label: "कितने ग्रामों में पेयजल की गुणवत्ता संबंधी समस्या दर्ज है?", type: "choice" },
    ],
  },
  {
    id: "livelihood",
    number: 8,
    title: "रोजगार, आजीविका एवं पलायन",
    subtitle: "बेरोजगारी, पलायन एवं कौशल प्रशिक्षण की स्थिति",
    questions: [
      { key: "unemployedYouth", label: "ग्राम में 18–45 वर्ष के कितने युवा बेरोजगार हैं?", type: "count" },
      { key: "migration", label: "कितने ग्रामों में रोजगार के लिए पलायन होता है?", type: "choice" },
      { key: "migrantPersons", label: "रोजगार के लिए पलायन करने वाले व्यक्तियों की संख्या कितनी है?", type: "count" },
      { key: "skillTraining", label: "कितने ग्रामों में कौशल प्रशिक्षण की सुविधा उपलब्ध नहीं है?", type: "choice" },
      { key: "employmentAfterTraining", label: "कितने प्रशिक्षित युवाओं को प्रशिक्षण के बाद रोजगार नहीं मिला है?", type: "choice" },
    ],
  },
  {
    id: "ladies",
    number: 9,
    title: "महिला स्वयं सहायता समूह एवं वित्तीय समावेशन",
    subtitle: "महिला समूहों की सक्रियता एवं बैंकिंग सुविधा",
    questions: [
      { key: "shgOperated", label: "कितने ग्रामों में महिला स्वयं सहायता समूह संचालित नहीं हैं?", type: "choice" },
      { key: "totalSHG", label: "महिला स्वयं सहायता समूहों की कुल संख्या कितनी है?", type: "count" },
      { key: "activeSHG", label: "सक्रिय महिला स्वयं सहायता समूहों की संख्या कितनी है?", type: "count" },
      { key: "bankingFacility", label: "कितने ग्रामों में बैंकिंग सुविधा उपलब्ध नहीं है?", type: "choice" },
    ],
  },
  {
    id: "cleanliness",
    number: 10,
    title: "स्वच्छता एवं अपशिष्ट प्रबंधन",
    subtitle: "शौचालय, कचरा प्रबंधन एवं जल निकासी की कमियाँ",
    questions: [
      { key: "solidWasteManagement", label: "कितने ग्रामों में ठोस अपशिष्ट संग्रह एवं निपटान की नियमित व्यवस्था नहीं है?", type: "choice" },
      { key: "drainageSystem", label: "कितने ग्रामों में पर्याप्त नाली एवं जल निकासी व्यवस्था नहीं है?", type: "choice" },
    ],
  },
  {
    id: "pension",
    number: 11,
    title: "पेंशन एवं सामाजिक सुरक्षा",
    subtitle: "पात्र लाभार्थी जिन्हें पेंशन नहीं मिल रही है",
    questions: [
      { key: "disabledNotReceiving", label: "कितने पात्र दिव्यांग व्यक्तियों को पेंशन नहीं मिल रही है?", type: "count" },
      { key: "widowNotReceiving", label: "कितनी पात्र विधवा महिलाओं को पेंशन नहीं मिल रही है?", type: "count" },
      { key: "elderlyNotReceiving", label: "कितने पात्र वृद्ध व्यक्तियों को पेंशन नहीं मिल रही है?", type: "count" },
    ],
  },
  {
    id: "development",
    number: 12,
    title: "ग्राम की विकास आवश्यकताएँ",
    subtitle: "आवश्यक आधारभूत विकास कार्य",
    questions: [
      { key: "handpumpRequirement", label: "कितने नए हैंडपंपों की आवश्यकता है?", type: "count" },
      { key: "borewellRequirement", label: "कितने नए बोरवेल / नलकूपों की आवश्यकता है?", type: "count" },
      { key: "solarPumpRequirement", label: "कितने नए सोलर पंपों की आवश्यकता है?", type: "count" },
      { key: "solarStreetLightRequirement", label: "कितनी सोलर स्ट्रीट लाइटों की आवश्यकता है?", type: "count" },
      { key: "roadRequirement", label: "कितने सड़क निर्माण / मरम्मत कार्यों की आवश्यकता है?", type: "count" },
      { key: "otherInfrastructureRequirement", label: "अन्य कितने आधारभूत विकास कार्यों की आवश्यकता है?", type: "count" },
    ],
  },
];

const questionIcons: Record<string, React.ElementType> = {
  fairPriceShop: Store,
  mobileNetwork: Signal,
  electricity: Zap,
  road: Route,
  odf: Toilet,
  vet: Stethoscope,
  rainCutoff: Route,
  buildingAvailability: House,
  buildingCondition: House,
  operation: ClipboardList,
  nutritionServices: Baby,
  toiletCondition: Toilet,
  drinkingWater: Droplets,
  watersupply: Droplets,
  childrenWithoutAadhaar: FileText,
  childrenWithoutAPAAR: FileText,
  childrenNotAttendingSchool: GraduationCap,
  dropoutChildren: GraduationCap,
  building: School,
  toilets: Toilet,
  ramp: Accessibility,
  condition: Building2,
  washrooms: Toilet,
  healthCenterType: HeartPulse,
  regularOperation: ClipboardList,
  medicinesEquipment: Pill,
  medicalStaff: Stethoscope,
  tapWaterAvailability: Droplets,
  summerWaterCondition: Sun,
  drinkingQuality: Droplets,
  waterQualityProblem: Droplets,
  unemployedYouth: BriefcaseBusiness,
  migration: Route,
  migrantPersons: Users,
  skillTraining: GraduationCap,
  employmentAfterTraining: BriefcaseBusiness,
  shgOperated: Users,
  totalSHG: Users,
  activeSHG: Users,
  bankingFacility: Landmark,
  solidWasteManagement: Trash2,
  drainageSystem: Waves,
  disabledNotReceiving: Accessibility,
  widowNotReceiving: HeartHandshake,
  elderlyNotReceiving: HandCoins,
  handpumpRequirement: Droplets,
  borewellRequirement: Droplets,
  solarPumpRequirement: Sun,
  solarStreetLightRequirement: Sun,
  roadRequirement: Construction,
  otherInfrastructureRequirement: ClipboardList,
};

type Level = "block" | "panchayat" | "village";

export default function VillageSurveyAnalysis() {
  const [selectedQuestion, setSelectedQuestion] = useState<{
    section: Section;
    question: Question;
  } | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedPanchayat, setSelectedPanchayat] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const allQuestions = useMemo(
    () =>
      sections.flatMap((section) =>
        section.questions.map((question) => ({ section, question }))
      ),
    []
  );

  // Keep sections together and spread the larger sections across more pages.
  const sectionPages = [
    ["general"],
    ["anganwadi"],
    ["children"],
    ["school"],
    ["hostel", "health"],
    ["water", "livelihood"],
    ["ladies", "cleanliness"],
    ["pension", "development"],
  ];

  const visibleSections = sections
    .filter((section) => sectionPages[currentPage - 1]?.includes(section.id))
    .map((section) => ({
      section,
      questions: section.questions,
    }));

  const totalPages = sectionPages.length;

  const openQuestion = (section: Section, question: Question) => {
    setSelectedQuestion({ section, question });
    setSelectedBlock(null);
    setSelectedPanchayat(null);
  };

  const goBack = () => {
    if (selectedPanchayat) setSelectedPanchayat(null);
    else if (selectedBlock) setSelectedBlock(null);
    else setSelectedQuestion(null);
  };

  // Frontend-only sample hierarchy. Replace this with API data later.
  const hierarchy = [
    { block: "अभनपुर", panchayats: [
      { name: "पंचायत - कुर्रा", villages: [{ name: "कुर्रा", affectedStatus: "Direct Affected" }, { name: "खोरपा", affectedStatus: "Indirect Affected" }] },
      { name: "पंचायत - नवागांव", villages: [{ name: "नवागांव", affectedStatus: "Direct Affected" }, { name: "पचेड़ा", affectedStatus: "Indirect Affected" }] },
    ]},
    { block: "आरंग", panchayats: [
      { name: "पंचायत - भिलाई", villages: [{ name: "भिलाई", affectedStatus: "Direct Affected" }, { name: "गुल्लू", affectedStatus: "Indirect Affected" }] },
      { name: "पंचायत - चंदखुरी", villages: [{ name: "चंदखुरी", affectedStatus: "Direct Affected" }, { name: "समोदा", affectedStatus: "Indirect Affected" }] },
    ]},
    { block: "तिल्दा", panchayats: [
      { name: "पंचायत - सिलयारी", villages: [{ name: "सिलयारी", affectedStatus: "Direct Affected" }, { name: "मोहदा", affectedStatus: "Indirect Affected" }] },
      { name: "पंचायत - खरोरा", villages: [{ name: "खरोरा", affectedStatus: "Direct Affected" }, { name: "माठ", affectedStatus: "Indirect Affected" }] },
    ]},
  ];

  const sampleAnswer = (villageIndex: number) => {
    const keySeed = selectedQuestion?.question.key
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) ?? 0;
    const value = (keySeed + villageIndex * 7) % 18;
    return selectedQuestion?.question.type === "count" ? value + 1 : value % 2 === 0 ? "हाँ" : "नहीं";
  };

  // Count answers separately for Direct Affected and Indirect Affected villages.
  // For count-type questions, add the numeric answers. For yes/no/choice questions,
  // count villages that have a recorded answer (the actual answer remains visible at village level).
  const allVillageNames = hierarchy.flatMap((block) =>
    block.panchayats.flatMap((panchayat) => panchayat.villages.map((village) => village.name))
  );

  const getAnswerCount = (
    villages: { name: string; affectedStatus: string }[],
    status: string
  ) => {
    const matchingVillages = villages.filter((village) => village.affectedStatus === status);

    if (selectedQuestion?.question.type === "count") {
      return matchingVillages.reduce((total, village) => {
        const answerIndex = allVillageNames.indexOf(village.name);
        const answer = sampleAnswer(answerIndex);
        return total + (typeof answer === "number" ? answer : 0);
      }, 0);
    }

    // Yes/No and choice questions: count only negative ("नहीं") answers.
    return matchingVillages.reduce((total, village) => {
      const answerIndex = allVillageNames.indexOf(village.name);
      return total + (sampleAnswer(answerIndex) === "नहीं" ? 1 : 0);
    }, 0);
  };

  const selectedBlockData = hierarchy.find((item) => item.block === selectedBlock);
  const selectedPanchayatData = selectedBlockData?.panchayats.find(
    (item) => item.name === selectedPanchayat
  );
  const currentLevel: Level = selectedPanchayat ? "village" : selectedBlock ? "panchayat" : "block";
  const levelTitle = currentLevel === "block" ? "ब्लॉक-वार विवरण" : currentLevel === "panchayat" ? "ग्राम पंचायत-वार विवरण" : "ग्राम-वार विवरण";

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
              प्रश्न चुनें और ब्लॉक से ग्राम स्तर तक विश्लेषण देखें।
            </p>
          </div>
          {selectedQuestion && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              सभी प्रश्न
            </button>
          )}
        </div>
      </header>
            {!selectedQuestion ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="space-y-6">
              {visibleSections.map(({ section, questions }) => (
                <div key={section.id}>
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                      {section.number}
                    </div>
                    <div>
                      <h2 className="font-bold">{section.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {questions.map((question) => {
                      const Icon = questionIcons[question.key] ?? ClipboardList;
                      return (
                        <button
                          key={question.key}
                          type="button"
                          onClick={() => openQuestion(section, question)}
                          className="group flex min-h-[96px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-6 text-slate-800">{question.label}</p>
                            <span className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600">
                              विवरण देखें
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {allQuestions.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    पेज {currentPage} / {totalPages} · कुल {allQuestions.length} प्रश्न · अनुभाग पूरे रखे गए हैं
                  </p>
                  <div className="flex flex-wrap items-center gap-2" aria-label="Question pages">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      पिछला
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        aria-current={currentPage === page ? "page" : undefined}
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
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
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      अगला
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {selectedQuestion.section.title}
            </p>
            <h2 className="mt-2 text-lg font-bold leading-7">{selectedQuestion.question.label}</h2>
            <p className="mt-2 text-xs text-amber-700">डेमो डेटा · यह केवल frontend navigation दिखाने के लिए है।</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <button onClick={() => { setSelectedBlock(null); setSelectedPanchayat(null); }} className={`font-semibold ${!selectedBlock ? "text-blue-700" : "text-slate-500 hover:text-blue-700"}`}>सभी ब्लॉक</button>
            {selectedBlock && <><ChevronRight className="h-4 w-4 text-slate-400" /><button onClick={() => setSelectedPanchayat(null)} className={`font-semibold ${!selectedPanchayat ? "text-blue-700" : "text-slate-500 hover:text-blue-700"}`}>{selectedBlock}</button></>}
            {selectedPanchayat && <><ChevronRight className="h-4 w-4 text-slate-400" /><span className="font-semibold text-blue-700">{selectedPanchayat}</span></>}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{levelTitle}</h3>
                <p className="mt-1 text-xs text-slate-500">{currentLevel === "block" ? "किस ब्लॉक में कितने गाँव प्रभावित हैं" : currentLevel === "panchayat" ? "चुने गए ब्लॉक की ग्राम पंचायतों का विवरण" : "चुनी गई ग्राम पंचायत के गाँवों के उत्तर"}</p>
              </div>
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{currentLevel === "block" ? "3 ब्लॉक" : currentLevel === "panchayat" ? "2 ग्राम पंचायत" : "2 गाँव"}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  {currentLevel === "block" ? (
                    <tr><th className="px-5 py-3 font-semibold">ब्लॉक का नाम</th><th className="px-5 py-3 font-semibold">प्रत्यक्ष प्रभावित</th><th className="px-5 py-3 font-semibold">अप्रत्यक्ष प्रभावित</th><th className="px-5 py-3 text-right font-semibold">विवरण</th></tr>
                  ) : currentLevel === "panchayat" ? (
                    <tr><th className="px-5 py-3 font-semibold">ग्राम पंचायत</th><th className="px-5 py-3 font-semibold">प्रत्यक्ष प्रभावित</th><th className="px-5 py-3 font-semibold">अप्रत्यक्ष प्रभावित</th><th className="px-5 py-3 text-right font-semibold">विवरण</th></tr>
                  ) : (
                    <tr><th className="px-5 py-3 font-semibold">गाँव का नाम</th><th className="px-5 py-3 font-semibold">प्रभावित श्रेणी</th><th className="px-5 py-3 font-semibold">उत्तर / संख्या</th></tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentLevel === "block" && hierarchy.map((item) => {
                    const villages = item.panchayats.flatMap((panchayat) => panchayat.villages);
                    return (
                      <tr key={item.block} onClick={() => setSelectedBlock(item.block)} className="cursor-pointer transition hover:bg-blue-50/60">
                        <td className="px-5 py-4 font-semibold text-slate-800">{item.block}</td>
                        <td className="px-5 py-4 font-bold text-rose-600">{getAnswerCount(villages, "Direct Affected")}</td>
                        <td className="px-5 py-4 font-bold text-amber-600">{getAnswerCount(villages, "Indirect Affected")}</td>
                        <td className="px-5 py-4 text-right"><span className="inline-flex items-center gap-1 font-semibold text-blue-700">खोलें <ChevronRight className="h-4 w-4" /></span></td>
                      </tr>
                    );
                  })}
                  {currentLevel === "panchayat" && selectedBlockData?.panchayats.map((item) => (
                    <tr key={item.name} onClick={() => setSelectedPanchayat(item.name)} className="cursor-pointer transition hover:bg-blue-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-5 py-4 font-bold text-rose-600">{getAnswerCount(item.villages, "Direct Affected")}</td>
                      <td className="px-5 py-4 font-bold text-amber-600">{getAnswerCount(item.villages, "Indirect Affected")}</td>
                      <td className="px-5 py-4 text-right"><span className="inline-flex items-center gap-1 font-semibold text-blue-700">खोलें <ChevronRight className="h-4 w-4" /></span></td>
                    </tr>
                  ))}
                  {currentLevel === "village" && selectedPanchayatData?.villages
                    .filter((village) => {
                      const answerIndex =
                        hierarchy.findIndex((item) => item.block === selectedBlock) * 4 +
                        (selectedBlockData?.panchayats.indexOf(selectedPanchayatData) ?? 0) * 2 +
                        selectedPanchayatData.villages.indexOf(village);
                      const answer = sampleAnswer(answerIndex);
                      return selectedQuestion.question.type === "count" || answer === "नहीं";
                    })
                    .map((village, index) => {
                    const globalIndex =
                      hierarchy.findIndex((item) => item.block === selectedBlock) * 4 +
                      (selectedBlockData?.panchayats.indexOf(selectedPanchayatData) ?? 0) * 2 +
                      index;
                    return (
                      <tr key={village.name} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-800">{village.name}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${village.affectedStatus === "Direct Affected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                            प्रत्यक्ष प्रभावित
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {sampleAnswer(globalIndex)}{selectedQuestion.question.type === "count" ? " व्यक्ति / कार्य" : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {currentLevel !== "village" && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">पूरी row पर क्लिक करके अगले स्तर का विवरण खोलें।</p>}
          </div>
          <button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> {selectedPanchayat ? "ग्राम पंचायत सूची" : selectedBlock ? "ब्लॉक सूची" : "प्रश्न सूची"} पर वापस जाएँ
          </button>
        </section>
      )}
    </div>
  );
}