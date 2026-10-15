// Generated from existing Surveyor labels and interfaces. Run node scripts/generate-admin-catalog.mjs after form changes.
export interface ReportField {
  key: string;
  label: string;
  type: "text" | "numeric" | "categorical" | "multi-select";
  options: string[];
}
export interface ReportSection {
  id: string;
  title: string;
  repeated: boolean;
  fields: ReportField[];
  source: string;
}
export const villageSections: ReportSection[] = [
  {
    id: "general",
    title: "ग्राम की सामान्य जानकारी",
    repeated: false,
    fields: [
      {
        key: "totalHouseholds",
        label: "कुल घर / परिवार संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "scPopulation",
        label: "अनुसूचित जाति (SC) की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "totalSchools",
        label:
          "गाँव में कुल उपलब्ध कुल स्कूल (प्राथमिक, उच्च प्राथमिक हाई स्कूल, उच्चतर माध्यमिक) संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "totalAnganwadi",
        label: "गाँव में उपलब्ध कुल आंगनबाड़ी केंद्र संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "fairPriceShop",
        label: "क्या ग्राम में शासकीय उचित मूल्य की दुकान संचालित है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "mobileNetwork",
        label: "क्या ग्राम में मोबाइल नेटवर्क की सुविधा उपलब्ध है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "electricity",
        label: "क्या गाँव में बिजली की सुविधा उपलब्ध है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "road",
        label: "क्या गाँव ब्लॉक से पक्की सड़क से जुड़ा है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "roadconnectivity",
        label:
          "मुख्य सड़क से ग्राम तक पहुँचने के लिए 12 माह (बारहों महीने) कितने मार्ग उपलब्ध हैं? संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "roadReasons",
        label: "यदि नहीं, तो मुख्य कारण क्या है?",
        type: "multi-select",
        options: [
          "सड़क की खराब स्थिति",
          "बारिश के दौरान सड़क पर पानी भरना",
          "पुलिया/पुल का अभाव",
          "कच्ची सड़क",
          "मार्ग अवरुद्ध होना",
        ],
      },
      {
        key: "tapWater",
        label: "क्या नल-जल योजना के तहत पेयजल उपलब्ध है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "ponds",
        label: "ग्राम में उपलब्ध तालाबों की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "puccaHouses",
        label: "गाँव में कुल पक्के घरों की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "completedHouses",
        label:
          "प्रधानमंत्री आवास योजना के अंतर्गत कितने आवासों का निर्माण पूर्ण हो चुका है? संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "pendingHouses",
        label:
          "कितने परिवारों को आवास स्वीकृत हो चुका है, परंतु निर्माण अभी तक पूर्ण नहीं हुआ है? संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "totalAgriculturalLand",
        label: "ग्राम में कुल कृषि योग्य भूमि",
        type: "text",
        options: [],
      },
      {
        key: "odf",
        label: "गाँव की ODF स्थिति",
        type: "categorical",
        options: ["ODF", "ODF+", "ODF++", "Not ODF"],
      },
      {
        key: "totalPopulation",
        label: "कुल जनसंख्या संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "stPopulation",
        label: "अनुसूचित जनजाति (ST) की संख्या संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "totalHealthFacilities",
        label:
          "गाँव में कुल उपलब्ध कुल अस्पताल (उप-स्वास्थ्य केंद्र, प्राथमिक स्वास्थ्य, सामुदायिक स्वास्थ्य केंद्र) संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "totalHostels",
        label: "गाँव में कुल उपलब्ध कुल आश्रम/छात्रावास संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "shopDistance",
        label: "यदि नहीं, तो निकटतम उचित मूल्य की दुकान की दूरी",
        type: "text",
        options: [],
      },
      {
        key: "networkDistance",
        label:
          "यदि नहीं, तो मोबाइल नेटवर्क की सुविधा प्राप्त करने के लिए ग्रामवासियों को लगभग तय करनी पड़ती है दूरी",
        type: "text",
        options: [],
      },
      {
        key: "solarLight",
        label: "क्या गाँव में सोलर स्ट्रीट लाइटिंग प्रणाली है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "rainCutoff",
        label: "क्या बारिश के कारण गाँव का संपर्क कट जाता है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "tapWaterExcludedFamilies",
        label:
          "यदि हाँ, तो ग्राम में कितने परिवार नल-जल सुविधा से वंचित हैं? संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "vet",
        label: "क्या गाँव में पशु चिकित्सक आते हैं या नहीं?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "rawHouses",
        label: "गाँव में कुल कच्चे घरों की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "housingNotSanctioned",
        label:
          "योजना के लिए पात्र कितने परिवारों को अभी तक आवास स्वीकृत नहीं हुआ है? संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "banking",
        label: "ग्राम में बैंकिंग सुविधा",
        type: "categorical",
        options: ["बैंक शाखा", "बैंक मित्र/BC", "दोनों", "नहीं"],
      },
      {
        key: "irrigatedLand",
        label: "कुल सिंचित भूमि",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/village-survey/general/GeneralInformation.tsx",
  },
  {
    id: "anganbadiData",
    title: "आंगनबाड़ी",
    repeated: true,
    fields: [
      {
        key: "centerName",
        label: "आंगनबाड़ी केंद्र का नाम / क्रमांक",
        type: "text",
        options: [],
      },
      {
        key: "buildingAvailability",
        label: "1. भवन की उपलब्धता",
        type: "categorical",
        options: ["भवन युक्त", "भवन विहीन", "भवन स्वीकृत", "भवन निर्माणाधीन"],
      },
      {
        key: "buildingCondition",
        label: "2. भवन की स्थिति",
        type: "categorical",
        options: ["अच्छी", "जर्जर", "नवीन निर्माण योग्य"],
      },
      {
        key: "operation",
        label: "3. केंद्र का संचालन",
        type: "categorical",
        options: ["हाँ, नियमित", "कभी-कभी", "नहीं"],
      },
      {
        key: "nutritionServices",
        label: "4. पोषण आहार एवं अन्य सेवाएँ",
        type: "categorical",
        options: ["हाँ, नियमित", "कभी-कभी", "नहीं"],
      },
      {
        key: "toiletCondition",
        label: "5. शौचालय की स्थिति",
        type: "categorical",
        options: ["है एवं उपयोग योग्य", "है लेकिन उपयोग योग्य नहीं", "नहीं है"],
      },
      {
        key: "drinkingWater",
        label: "6. पेयजल सुविधा",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "watersupply",
        label:
          "9. क्या आंगनबाड़ी केंद्र में चालू जलापूर्ति की सुविधा उपलब्ध है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "electricity",
        label: "7. विद्युत सुविधा",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "nutritionGarden",
        label: "8. पोषण वाटिका",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
    ],
    source:
      "src/components/surveyor/village-survey/anganbadi/AnganbadiForm.tsx",
  },
  {
    id: "schoolData",
    title: "विद्यालय एवं शिक्षा",
    repeated: true,
    fields: [
      {
        key: "schoolName",
        label: "विद्यालय का नाम",
        type: "text",
        options: [],
      },
      {
        key: "udiseCode",
        label: "UDISE कोड",
        type: "text",
        options: [],
      },
      {
        key: "schoolType",
        label: "विद्यालय का प्रकार",
        type: "text",
        options: [],
      },
      {
        key: "building",
        label: "1. क्या विद्यालय का अपना भवन है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "निर्माणाधीन", "स्वीकृत"],
      },
      {
        key: "buildingCondition",
        label: "2. भवन की स्थिति",
        type: "categorical",
        options: ["अच्छी", "जर्जर", "पुनर्निर्माण योग्य"],
      },
      {
        key: "seatingArrangement",
        label: "3. बैठने की व्यवस्था",
        type: "categorical",
        options: ["पर्याप्त एवं अच्छी", "पर्याप्त लेकिन खराब", "अपर्याप्त"],
      },
      {
        key: "toilets",
        label: "4. अलग-अलग बालक/बालिका शौचालय",
        type: "categorical",
        options: [
          "हाँ, दोनों",
          "केवल बालक",
          "केवल बालिका",
          "अलग नहीं",
          "नहीं है",
        ],
      },
      {
        key: "drinkingWater",
        label: "5. पेयजल",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "watersupply",
        label: "18. क्या विद्यालय में चालू जलापूर्ति की सुविधा उपलब्ध है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "electricity",
        label: "6. विद्युत सुविधा",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "ramp",
        label: "7. रैंप की सुविधा",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "sports",
        label: "8. खेल-कूद सुविधा",
        type: "categorical",
        options: ["हाँ, पर्याप्त", "हाँ, अपर्याप्त", "नहीं"],
      },
      {
        key: "uniform",
        label: "9. नि:शुल्क 2 सेट गणवेश",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "textbooks",
        label: "10. नि:शुल्क पाठ्य-पुस्तक",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "totalChildren",
        label: "11. कुल बच्चे संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "childrenWithoutAadhaar",
        label: "12. आधार कार्ड नहीं रखने वाले बच्चे संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "childrenWithoutAPAAR",
        label: "13. APAAR ID नहीं रखने वाले बच्चे संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "disabledChildren",
        label: "14. दिव्यांग बच्चे संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "childrenNotAttendingSchool",
        label: "15. 6-18 वर्ष के विद्यालय न जाने वाले बच्चे संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "dropoutChildren",
        label: "16. विद्यालय छोड़ चुके बच्चे (Dropout) संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "dropoutReason",
        label: "17. Dropout का प्रमुख कारण",
        type: "categorical",
        options: [
          "आर्थिक कठिनाई",
          "दूरी",
          "परिवार की आवश्यकता",
          "पलायन",
          "रुचि की कमी",
          "अन्य",
        ],
      },
      {
        key: "majorShortcoming",
        label: "19. विद्यालय में प्रमुख कमी",
        type: "text",
        options: [],
      },
    ],
    source: "src/components/surveyor/village-survey/school/SchoolForm.tsx",
  },
  {
    id: "hostelData",
    title: "आश्रम/छात्रावास",
    repeated: true,
    fields: [
      {
        key: "facilityType",
        label: "Q1. ग्राम में उपलब्ध आश्रम/छात्रावास की सुविधा",
        type: "categorical",
        options: ["आश्रम", "प्री-मैट्रिक छात्रावास", "पोस्ट-मैट्रिक छात्रावास"],
      },
      {
        key: "condition",
        label: "Q2. ग्राम में उपलब्ध आश्रम/छात्रावास की स्थिति क्या है?",
        type: "categorical",
        options: ["अच्छी", "जर्जर", "नवीन निर्माण योग्य"],
      },
      {
        key: "washrooms",
        label: "Q3: छात्रावास में शौचालय की स्थिति:",
        type: "categorical",
        options: ["है एवं उपयोग योग्य", "है लेकिन उपयोग योग्य नहीं", "नहीं है"],
      },
    ],
    source: "src/components/surveyor/village-survey/hostel/HostelForm.tsx",
  },
  {
    id: "healthData",
    title: "स्वास्थ्य एवं पोषण",
    repeated: true,
    fields: [
      {
        key: "healthCenterType",
        label: "Q1. स्वास्थ्य केंद्र का प्रकार",
        type: "categorical",
        options: [
          "उप-स्वास्थ्य केंद्र",
          "प्राथमिक स्वास्थ्य केंद्र",
          "सामुदायिक स्वास्थ्य केंद्र",
          "नहीं है",
        ],
      },
      {
        key: "regularOperation",
        label: "Q2. नियमित संचालन",
        type: "categorical",
        options: ["हाँ, नियमित", "कभी-कभी बंद", "अक्सर बंद", "हमेशा बंद"],
      },
      {
        key: "medicinesEquipment",
        label: "Q3. दवाइयाँ एवं उपकरण",
        type: "categorical",
        options: ["हाँ, पर्याप्त", "आंशिक", "उपलब्ध नहीं", "जानकारी नहीं"],
      },
      {
        key: "medicalStaff",
        label: "Q4. चिकित्सा कर्मचारी",
        type: "categorical",
        options: ["हाँ, नियमित", "कभी-कभी", "नहीं"],
      },
      {
        key: "majorShortcoming",
        label: "Q5. स्वास्थ्य केंद्र की प्रमुख कमी",
        type: "text",
        options: [],
      },
    ],
    source: "src/components/surveyor/village-survey/health/HealthForm.tsx",
  },
  {
    id: "waterData",
    title: "पेयजल सुविधा",
    repeated: false,
    fields: [
      {
        key: "tapWaterAvailability",
        label:
          "Q1. क्या ग्राम में नल-जल योजना के अंतर्गत कार्यशील नल से पेयजल उपलब्ध है?",
        type: "categorical",
        options: ["हाँ", "आंशिक रूप से", "नहीं"],
      },
      {
        key: "summerWaterCondition",
        label: "Q2. गर्मियों में पेयजल की स्थिति:",
        type: "categorical",
        options: [
          "पर्याप्त",
          "कभी-कभी समस्या",
          "गंभीर समस्या",
          "पूर्णतः अनुपलब्ध",
        ],
      },
      {
        key: "drinkingQuality",
        label: "Q3. क्या उपलब्ध पेयजल पीने योग्य है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "जाँच नहीं हुई", "जानकारी नहीं"],
      },
      {
        key: "waterQualityProblem",
        label: "Q4. क्या पानी की गुणवत्ता से संबंधित कोई समस्या है?",
        type: "categorical",
        options: [
          "नहीं",
          "गंदलापन",
          "दुर्गंध/खराब स्वाद",
          "आयरन",
          "फ्लोराइड",
          "अन्य",
        ],
      },
      {
        key: "otherWaterQualityProblem",
        label: "अन्य समस्या",
        type: "text",
        options: [],
      },
      {
        key: "waterDistance",
        label:
          "Q5. पेयजल लाने के लिए परिवारों को औसतन कितनी दूरी तय करनी पड़ती है?",
        type: "numeric",
        options: [],
      },
      {
        key: "pipelineRequirement",
        label: "पाइपलाइन विस्तार/मरम्मत",
        type: "numeric",
        options: [],
      },
      {
        key: "waterTankRequirement",
        label: "पानी की टंकी",
        type: "numeric",
        options: [],
      },
    ],
    source: "src/components/surveyor/village-survey/water/WaterForm.tsx",
  },
  {
    id: "employmentData",
    title: "रोजगार, आजीविका, पलायन एवं कौशल विकास",
    repeated: false,
    fields: [
      {
        key: "unemployedYouth",
        label: "Q1. ग्राम में बेरोजगार युवाओं (18–45 वर्ष) की संख्या:",
        type: "numeric",
        options: [],
      },
      {
        key: "livelihoodActivities",
        label: "Q2. ग्राम के परिवारों की प्रमुख आजीविका/आर्थिक गतिविधियाँ:",
        type: "multi-select",
        options: [
          "कृषि",
          "कृषि मजदूरी",
          "पशुपालन",
          "पोषण",
          "सरकारी नौकरी",
          "निजी नौकरी",
          "स्वरोजगार/व्यवसाय",
          "अन्य",
        ],
      },
      {
        key: "migration",
        label: "Q3. क्या ग्राम के लोग रोजगार के लिए बाहर पलायन करते हैं?",
        type: "categorical",
        options: ["नहीं", "हाँ, मौसमी", "हाँ, स्थायी", "दोनों"],
      },
      {
        key: "migrantPersons",
        label: "अनुमानित प्रवासी व्यक्तियों की संख्या",
        type: "numeric",
        options: ["नहीं", "हाँ, मौसमी", "हाँ, स्थायी", "दोनों"],
      },
      {
        key: "migrationDestination",
        label: "प्रमुख गंतव्य",
        type: "text",
        options: [],
      },
      {
        key: "migrationReason",
        label: "मुख्य कारण",
        type: "categorical",
        options: ["रोजगार", "अधिक मजदूरी", "शिक्षा", "अन्य"],
      },
      {
        key: "migrationDuration",
        label: "बाहर रहने की औसत अवधि",
        type: "text",
        options: [],
      },
      {
        key: "nearestITICollegeDistance",
        label: "Q5. निकटतम ITI/पॉलिटेक्निक/महाविद्यालय की दूरी:",
        type: "numeric",
        options: [],
      },
      {
        key: "skillTraining",
        label:
          "Q6. क्या ग्राम के युवाओं ने पिछले तीन वर्षों में कौशल प्रशिक्षण प्राप्त किया है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "majorTraining",
        label:
          "Q6. क्या ग्राम के युवाओं ने पिछले तीन वर्षों में कौशल प्रशिक्षण प्राप्त किया है?",
        type: "text",
        options: [],
      },
      {
        key: "employmentAfterTraining",
        label: "Q7. क्या प्रशिक्षण के बाद रोजगार/स्वरोजगार प्राप्त हुआ?",
        type: "categorical",
        options: ["हाँ", "आंशिक रूप से", "नहीं"],
      },
      {
        key: "requiredTraining1",
        label:
          "Q8. कौशल एवं आजीविका हेतु आवश्यक अधिकतम दो प्रशिक्षण कार्यक्रम:",
        type: "text",
        options: [],
      },
      {
        key: "requiredTraining2",
        label:
          "Q8. कौशल एवं आजीविका हेतु आवश्यक अधिकतम दो प्रशिक्षण कार्यक्रम:",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/village-survey/employment/EmploymentForm.tsx",
  },
  {
    id: "ladiesData",
    title: "महिला स्वयं सहायता समूह एवं वित्तीय समावेशन",
    repeated: false,
    fields: [
      {
        key: "shgOperated",
        label: "Q1. क्या ग्राम में महिला स्वयं सहायता समूह (SHG) संचालित है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "totalSHG",
        label: "Q2. कुल SHG संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "activeSHG",
        label: "Q3. सक्रिय SHG संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "majorSHGActivities",
        label: "Q4. प्रमुख SHG गतिविधियाँ",
        type: "text",
        options: [],
      },
      {
        key: "shgSupport",
        label: "Q5. क्या SHG को बैंक ऋण/सरकारी सहायता मिली है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "जानकारी नहीं"],
      },
      {
        key: "bankingFacility",
        label: "Q6. ग्राम में बैंकिंग सुविधा",
        type: "categorical",
        options: ["बैंक शाखा", "बैंक मित्र/BC", "दोनों", "नहीं"],
      },
      {
        key: "nearestBankDistance",
        label: "Q7. निकटतम बैंक/BC की दूरी",
        type: "numeric",
        options: [],
      },
      {
        key: "familyBankAccounts",
        label: "Q8. क्या अधिकांश परिवारों के बैंक खाते हैं?",
        type: "categorical",
        options: ["हाँ", "नहीं", "जानकारी नहीं"],
      },
    ],
    source: "src/components/surveyor/village-survey/ladies/LadiesForm.tsx",
  },
  {
    id: "cleanlinessData",
    title: "स्वच्छता एवं अपशिष्ट प्रबंधन",
    repeated: false,
    fields: [
      {
        key: "toiletAvailability",
        label: "Q1. घरों में व्यक्तिगत शौचालय की उपलब्धता",
        type: "categorical",
        options: ["सभी", "अधिकांश", "कुछ", "नहीं"],
      },
      {
        key: "solidWasteManagement",
        label: "Q2. ठोस अपशिष्ट संग्रह/निपटान व्यवस्था",
        type: "categorical",
        options: ["नियमित", "कभी-कभी", "नहीं"],
      },
      {
        key: "drainageSystem",
        label: "Q3. नाली/जल निकासी व्यवस्था",
        type: "categorical",
        options: ["पर्याप्त", "आंशिक", "नहीं"],
      },
    ],
    source:
      "src/components/surveyor/village-survey/cleanliness/CleanlinessForm.tsx",
  },
  {
    id: "pensionData",
    title: "पेंशन एवं सामाजिक सुरक्षा",
    repeated: false,
    fields: [
      {
        key: "disabledEligible",
        label: "Q1. दिव्यांग पेंशन के लिए कुल पात्र व्यक्तियों की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "disabledNotReceiving",
        label:
          "इनमें से पेंशन प्राप्त नहीं करने वाले पात्र व्यक्तियों की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "widowEligible",
        label: "Q2. विधवा पेंशन के लिए कुल पात्र महिलाओं की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "widowNotReceiving",
        label: "इनमें से पेंशन प्राप्त नहीं करने वाली पात्र महिलाओं की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "elderlyEligible",
        label:
          "Q3. वृद्धजन पेंशन (60 वर्ष एवं अधिक) के लिए कुल पात्र व्यक्तियों की संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "elderlyNotReceiving",
        label:
          "इनमें से पेंशन प्राप्त नहीं करने वाले पात्र व्यक्तियों की संख्या",
        type: "numeric",
        options: [],
      },
    ],
    source: "src/components/surveyor/village-survey/pension/PensionForm.tsx",
  },
  {
    id: "developmentData",
    title: "ग्राम की विकास आवश्यकताएँ",
    repeated: false,
    fields: [
      {
        key: "handpumpRequirement",
        label: "1. नए हैंडपंप की आवश्यकता संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "borewellRequirement",
        label: "2. नए बोरवेल/नलकूप की आवश्यकता संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "solarPumpRequirement",
        label: "3. नए सोलर पंप की आवश्यकता संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "solarStreetLightRequirement",
        label: "4. सोलर स्ट्रीट लाइट की आवश्यकता संख्या",
        type: "numeric",
        options: [],
      },
      {
        key: "roadRequirement",
        label: "5. नई/सुधार योग्य सड़क की आवश्यकता",
        type: "numeric",
        options: [],
      },
      {
        key: "otherInfrastructureRequirement",
        label: "6. अन्य प्रमुख आधारभूत आवश्यकता",
        type: "text",
        options: [],
      },
      {
        key: "priorityWork1",
        label:
          "यदि अगले 5 वर्षों में केवल तीन कार्य तत्काल किए जाएँ, तो वे कौन-से होंगे?",
        type: "text",
        options: [],
      },
      {
        key: "priorityWork2",
        label:
          "यदि अगले 5 वर्षों में केवल तीन कार्य तत्काल किए जाएँ, तो वे कौन-से होंगे?",
        type: "text",
        options: [],
      },
      {
        key: "priorityWork3",
        label:
          "यदि अगले 5 वर्षों में केवल तीन कार्य तत्काल किए जाएँ, तो वे कौन-से होंगे?",
        type: "text",
        options: [],
      },
      {
        key: "additionalRemarks",
        label: "अतिरिक्त टिप्पणी / अन्य महत्वपूर्ण समस्या",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/village-survey/development/DevelopmentForm.tsx",
  },
];
export const householdSections: ReportSection[] = [
  {
    id: "general",
    title: "परिवार की सामान्य जानकारी",
    repeated: false,
    fields: [
      {
        key: "houseNumber",
        label: "मकान नं.",
        type: "text",
        options: [],
      },
      {
        key: "headName",
        label: "परिवार मुखिया",
        type: "text",
        options: [],
      },
      {
        key: "mobile",
        label: "मोबाइल नं.",
        type: "text",
        options: [],
      },
      {
        key: "surveyDate",
        label: "सर्वेक्षण दिनांक",
        type: "text",
        options: [],
      },
      {
        key: "surveyorName",
        label: "सर्वेक्षक",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/household/general/HouseholdGeneralInformation.tsx",
  },
  {
    id: "demography",
    title: "जनसांख्यिकी",
    repeated: false,
    fields: [
      {
        key: "caste",
        label: "1. जाति",
        type: "categorical",
        options: [
          "सामान्य",
          "अन्य पिछड़ा वर्ग",
          "अनुसूचित जाति",
          "अनुसूचित जनजाति",
          "अबूझमाड़िया अनुसूचित जनजाति",
        ],
      },
      {
        key: "isBpl",
        label: "2. क्या परिवार गरीबी रेखा के नीचे (BPL) है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "elderly",
        label: "बुजुर्ग",
        type: "numeric",
        options: [],
      },
      {
        key: "children",
        label: "बच्चे",
        type: "numeric",
        options: [],
      },
      {
        key: "women",
        label: "महिला",
        type: "numeric",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/household/demography/HouseholdDemography.tsx",
  },
  {
    id: "documents",
    title: "दस्तावेज़ एवं योजनाएं",
    repeated: false,
    fields: [
      {
        key: "rationCard",
        label: "1. राशन कार्ड है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "noAadhaarMembers",
        label: "2. आधार कार्ड नहीं रखने वाले सदस्य",
        type: "numeric",
        options: [],
      },
      {
        key: "aadhaarEkyc",
        label: "3. राशन कार्ड में दर्ज सभी सदस्यों का आधार e-KYC हुआ है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "noCasteCertificateMembers",
        label: "4. जाति प्रमाण-पत्र नहीं रखने वाले सदस्य",
        type: "numeric",
        options: [],
      },
      {
        key: "noAyushmanMembers",
        label: "5. आयुष्मान कार्ड (PM-JAY) नहीं रखने वाले सदस्य",
        type: "numeric",
        options: [],
      },
      {
        key: "noVoterIdMembers",
        label: "6. 18+ आयु में मतदाता पहचान-पत्र नहीं रखने वाले सदस्य",
        type: "numeric",
        options: [],
      },
      {
        key: "mnregaJobCard",
        label: "7. वीबी–जी राम जी जॉब कार्ड",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "noShramikCardMembers",
        label: "8. पात्र 18-40 वर्ष श्रमिक कार्ड नहीं रखने वाले सदस्य",
        type: "numeric",
        options: [],
      },
      {
        key: "janDhanAccount",
        label: "9. जन-धन खाता है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "kcc",
        label: "10. किसान क्रेडिट कार्ड (KCC)",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "forestRightsPatta",
        label: "11. व्यक्तिगत वनाधिकार पट्टा",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "marriagecertificate",
        label: "12. विवाह प्रमाण-पत्र है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "bankName",
        label: "यदि जन-धन खाता है, तो वह किस बैंक में है?",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/household/documents/HouseholdDocumentsSchemes.tsx",
  },
  {
    id: "women",
    title: "महिला एवं सामाजिक सुरक्षा",
    repeated: false,
    fields: [
      {
        key: "jsy",
        label: "1. पात्र महिला को जननी सुरक्षा योजना (JSY) का लाभ मिला?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "pmmvy",
        label: "2. पात्र महिला को PM मातृवंदना योजना (PMMVY) का लाभ मिला?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "mahtariVandana",
        label: "3. पात्र महिला को महतारी वंदना योजना की राशि मिली?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "widowPension",
        label: "4. 40-79 वर्ष की पात्र विधवा महिला को विधवा पेंशन मिल रही है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "disabilityPension",
        label: "5. पात्र दिव्यांग व्यक्ति को दिव्यांग पेंशन मिल रही है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
    ],
    source:
      "src/components/surveyor/household/women/HouseholdWomenSocialSecurity.tsx",
  },
  {
    id: "disability",
    title: "दिव्यांगता दस्तावेज़",
    repeated: false,
    fields: [
      {
        key: "needsAssistiveDevice",
        label:
          "1. किसी दिव्यांग सदस्य को तत्काल सहायक उपकरण / विशेष सहायता चाहिए?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "assistanceTypes",
        label: "यदि हाँ, सहायता का प्रकार",
        type: "multi-select",
        options: [
          "बैसाखी / छड़ी",
          "व्हीलचेयर",
          "श्रवण यंत्र",
          "ट्राइसाइकिल",
          "कृत्रिम अंग",
          "दृष्टि सहायक उपकरण",
          "अन्य",
        ],
      },
      {
        key: "otherAssistance",
        label: "यदि हाँ, सहायता का प्रकार",
        type: "text",
        options: [],
      },
      {
        key: "deathInLastYear",
        label: "2. पिछले 1 वर्ष में परिवार में मृत्यु हुई?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "deathCertificateReceived",
        label: "यदि हाँ, मृत्यु प्रमाण-पत्र प्राप्त हुआ?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "pmGaribKalyanRation",
        label: "3. PM गरीब कल्याण योजना के अंतर्गत निःशुल्क राशन मिल रहा है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
    ],
    source:
      "src/components/surveyor/household/disability/HouseholdDisabilityDocuments.tsx",
  },
  {
    id: "education",
    title: "बच्चों की शिक्षा",
    repeated: false,
    fields: [
      {
        key: "childrenWithoutBirthCertificate",
        label:
          "1. परिवार में ऐसे बच्चों की संख्या, जिनके पास जन्म प्रमाण-पत्र नहीं है",
        type: "numeric",
        options: [],
      },
      {
        key: "vaccinationStatus",
        label: "2. 0-5 वर्ष के बच्चों का टीकाकरण हुआ है?",
        type: "categorical",
        options: ["सभी", "आंशिक", "नहीं", "लागू नहीं"],
      },
      {
        key: "anganwadiMeal",
        label: "3. 3-5 वर्ष के बच्चों को आंगनवाड़ी में गर्म/पका भोजन मिलता है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "लागू नहीं"],
      },
      {
        key: "childrenSchoolStatus",
        label: "4. परिवार के बच्चे स्कूल जाते हैं?",
        type: "categorical",
        options: ["सभी", "कुछ", "कोई नहीं", "लागू नहीं"],
      },
      {
        key: "schoolNotGoingReason",
        label: "यदि नहीं/कुछ नहीं जाते, मुख्य कारण",
        type: "multi-select",
        options: [
          "दूरी",
          "अध्यापक की कमी",
          "गरीबी",
          "घर के काम/धंधे में सहयोग",
          "अन्य",
        ],
      },
      {
        key: "otherSchoolReason",
        label: "यदि नहीं/कुछ नहीं जाते, मुख्य कारण",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/household/education/HouseholdChildrenEducation.tsx",
  },
  {
    id: "employment",
    title: "कृषि एवं रोजगार",
    repeated: false,
    fields: [
      {
        key: "unemployedMembers",
        label: "1. परिवार में कितने सदस्य वर्तमान में बेरोजगार हैं?",
        type: "numeric",
        options: [],
      },
      {
        key: "pmKisan",
        label: "2. क्या परिवार को PM किसान योजना का लाभ मिल रहा है?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "miningEmployment",
        label: "3. क्या परिवार का कोई सदस्य खनन कार्य में रोजगार करता है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "annualIncome",
        label: "4. परिवार की अनुमानित वार्षिक आय",
        type: "numeric",
        options: [],
      },
      {
        key: "mainIncomeSource",
        label: "5. परिवार की आय का मुख्य स्रोत क्या है?",
        type: "text",
        options: [],
      },
      {
        key: "livestockSource",
        label: "6. क्या परिवार की आजीविका पशुपालन से जुड़ी है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "otherLivestockSource",
        label: "पशुपालन का विवरण",
        type: "text",
        options: [],
      },
      {
        key: "animalEmployment",
        label:
          "7. क्या परिवार के सदस्य पशुपालन/पशु आधारित कार्य से रोजगार प्राप्त करते हैं?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
    ],
    source:
      "src/components/surveyor/household/employment/HouseholdAgricultureEmployment.tsx",
  },
  {
    id: "housing",
    title: "आवास एवं सुविधाएं",
    repeated: false,
    fields: [
      {
        key: "houseType",
        label: "1. घर का प्रकार",
        type: "categorical",
        options: ["कच्चा", "पक्का", "अर्ध-पक्का"],
      },
      {
        key: "housingSchemeBenefit",
        label: "2. ग्रामीण आवास/अन्य सरकारी आवास योजना का लाभ मिला?",
        type: "categorical",
        options: ["हाँ", "नहीं", "पात्रता नहीं"],
      },
      {
        key: "toiletStatus",
        label: "3. घर में शौचालय है?",
        type: "categorical",
        options: ["हाँ, उपयोग में", "हाँ, उपयोग में नहीं", "नहीं"],
      },
      {
        key: "tapWaterConnection",
        label: "4. नल के पानी का कनेक्शन है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "drinkingWaterSource",
        label: "यदि नहीं, मुख्य पेयजल स्रोत",
        type: "categorical",
        options: ["कुआँ", "नदी", "तालाब", "झरना", "हैंडपंप", "अन्य"],
      },
      {
        key: "electricityConnection",
        label: "5. घर में बिजली का कनेक्शन है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "solarEnergy",
        label: "6. क्या परिवार सौर ऊर्जा का उपयोग करता है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
    ],
    source:
      "src/components/surveyor/household/housing/HouseholdHousingFacilities.tsx",
  },
  {
    id: "health",
    title: "स्वास्थ्य",
    repeated: false,
    fields: [
      {
        key: "familyDisease",
        label: "1. परिवार का कोई सदस्य खाँसी/दमा/TB आदि रोग से ग्रसित है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "freeMedicines",
        label:
          "2. गाँव के पास अस्पताल/स्वास्थ्य केंद्र से निःशुल्क दवाइयाँ मिलती हैं?",
        type: "categorical",
        options: ["हाँ", "कभी-कभी", "नहीं"],
      },
    ],
    source: "src/components/surveyor/household/health/HouseholdHealth.tsx",
  },
  {
    id: "shg",
    title: "स्वयं सहायता समूह",
    repeated: false,
    fields: [
      {
        key: "shgMember",
        label:
          "1. परिवार की कोई महिला (दीदी) स्वयं सहायता समूह (SHG) की सदस्य है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
    ],
    source: "src/components/surveyor/household/shg/HouseholdSHG.tsx",
  },
  {
    id: "other",
    title: "अन्य जानकारी",
    repeated: false,
    fields: [
      {
        key: "priorityNeed1",
        label: "प्राथमिकता 1",
        type: "text",
        options: [],
      },
      {
        key: "priorityNeed2",
        label: "प्राथमिकता 2",
        type: "text",
        options: [],
      },
      {
        key: "priorityNeed3",
        label: "प्राथमिकता 3",
        type: "text",
        options: [],
      },
      {
        key: "eligibleSchemeNotReceived",
        label:
          "2. परिवार को किसी सरकारी योजना का लाभ पात्र होने के बावजूद नहीं मिल रहा है?",
        type: "categorical",
        options: ["हाँ", "नहीं"],
      },
      {
        key: "schemeBenefitName",
        label: "यदि हाँ, योजना/लाभ का नाम",
        type: "text",
        options: [],
      },
    ],
    source:
      "src/components/surveyor/household/other/HouseholdOtherInformation.tsx",
  },
];
