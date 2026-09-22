import React, { useState } from "react";

import {

  ArrowLeft,

  CheckCircle2,

  ChevronRight,

} from "lucide-react";



import HouseholdDemography from "./demography/HouseholdDemography";

import HouseholdGeneralInformation from "./general/HouseholdGeneralInformation";

import HouseholdDocumentsSchemes from "./documents/HouseholdDocumentsSchemes";

import HouseholdDisabilityDocuments from "./disability/HouseholdDisabilityDocuments";

import HouseholdWomenSocialSecurity from "./women/HouseholdWomenSocialSecurity";

import HouseholdChildrenEducation from "./education/HouseholdChildrenEducation";

import HouseholdHousingFacilities from "./housing/HouseholdHousingFacilities";

import HouseholdAgricultureEmployment from "./employment/HouseholdAgricultureEmployment";

import HouseholdHealth from "./health/HouseholdHealth";

import HouseholdSHG from "./shg/HouseholdSHG";

import HouseholdOtherInformation from "./other/HouseholdOtherInformation";



interface HouseholdFormProps {

  houseNumber: number;

  villageName: string;

  blockName: string;

  panchayatName: string;

  surveyorName: string;

  existingData?: any;

  onBack: () => void;

  onComplete: (data: any) => void;

}



const HouseholdForm: React.FC<HouseholdFormProps> = ({

  houseNumber,

  villageName,

  blockName,

  panchayatName,

  surveyorName,

  existingData,

  onBack,

  onComplete,

}) => {

  const [activeSection, setActiveSection] = useState<string | null>(null);



  const [formData, setFormData] = useState<any>(

    existingData ?? {}

  );



const sections = [

  {

    id: "general",

    number: 1,

    title: "परिवार की सामान्य जानकारी",

    description: "परिवार एवं सर्वेक्षण से संबंधित मूल जानकारी",

  },



  {

    id: "demography",

    number: 2,

    title: "परिवार की जनसांख्यिकी",

    description: "परिवार के सदस्यों एवं जनसांख्यिकी की जानकारी",

  },



  {

    id: "documents",

    number: 3,

    title: "दस्तावेज एवं शासकीय योजनाएँ",

    description: "दस्तावेज एवं सरकारी योजनाओं से संबंधित जानकारी",

  },



  {

    id: "women",

    number: 4,

    title: "महिला, मातृत्व एवं सामाजिक सुरक्षा योजनाएँ",

    description: "महिला एवं सामाजिक सुरक्षा योजनाओं से संबंधित जानकारी",

  },



  {

    id: "disability",

    number: 5,

    title: "दिव्यांग सहायता एवं नागरिक दस्तावेज",

    description: "दिव्यांग सहायता एवं नागरिक दस्तावेज से संबंधित जानकारी",

  },



  {

    id: "education",

    number: 6,

    title: "बच्चे, आंगनवाड़ी एवं शिक्षा",

    description: "बच्चों, टीकाकरण, आंगनवाड़ी एवं शिक्षा से संबंधित जानकारी",

  },



  {

    id: "employment",

    number: 7,

    title: "कृषि, रोजगार एवं आय",

    description: "परिवार की कृषि, रोजगार एवं आय से संबंधित जानकारी",

  },



  {

    id: "housing",

    number: 8,

    title: "आवास एवं घरेलू मूलभूत सुविधाएँ",

    description:

      "परिवार के आवास एवं घरेलू मूलभूत सुविधाओं से संबंधित जानकारी",

  },



  {

    id: "health",

    number: 9,

    title: "स्वास्थ्य",

    description:

      "परिवार के स्वास्थ्य एवं स्वास्थ्य सेवाओं से संबंधित जानकारी",

  },



  {

    id: "shg",

    number: 10,

    title: "महिला स्वयं सहायता समूह",

    description:

      "परिवार की महिलाओं के स्वयं सहायता समूह से संबंधित जानकारी",

  },



  {

    id: "other",

    number: 11,

    title: "परिवार की प्रमुख आवश्यकताएँ / समस्या",

    description:

      "परिवार की प्रमुख आवश्यकताओं एवं समस्याओं से संबंधित जानकारी",

  },

];



  const handleSectionClick = (sectionId: string) => {

    setActiveSection(sectionId);

  };



  // =========================================================

  // GENERAL INFORMATION SAVE

  // =========================================================



  const handleGeneralNext = (data: any) => {

    setFormData((prev: any) => ({

      ...prev,

      ...data,



      // Section 1 explicitly completed

      generalCompleted: true,

    }));



    setActiveSection(null);

  };



  // =========================================================

  // DEMOGRAPHY SAVE

  // =========================================================



  const handleDemographyNext = (data: any) => {

    setFormData((prev: any) => ({

      ...prev,

      ...data,



      // Section 2 explicitly completed

      demographyCompleted: true,

    }));



    setActiveSection(null);

  };



  // =========================================================

  // COMPLETE HOUSEHOLD

  // =========================================================



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

  const completedCount = requiredSections.filter(
    (key) => Boolean(formData?.[key])
  ).length;

  const allSectionsCompleted =
    completedCount === requiredSections.length;

  const handleComplete = () => {
    if (!allSectionsCompleted) {
      alert(
        `अभी ${completedCount}/11 अनुभाग पूरे हुए हैं। सर्वे पूर्ण करने के लिए सभी 11 अनुभाग सहेजें।`
      );
      return;
    }

    onComplete(formData);
  };
// \ =========================================================
// \ SECTION 1
// \ GENERAL INFORMATION
// \ =========================================================
  if (activeSection === "general") {

    return (

      <div className="min-h-screen bg-slate-50">



        <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



          {/* TOP HEADER */}



          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



            <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



              <button

                type="button"

                onClick={() => setActiveSection(null)}

                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

              >

                <ArrowLeft size={16} />

                अनुभाग सूची

              </button>



              <div className="text-right">

                <p className="text-[11px] text-slate-500">

                  हाउसहोल्ड सर्वे

                </p>



                <p className="text-base font-bold text-slate-900">

                  मकान #{houseNumber}

                </p>

              </div>



            </div>



          </div>



          {/* LOCATION */}



          <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  ग्राम

                </p>



                <p className="text-base font-bold text-slate-900">

                  {villageName}

                </p>

              </div>



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  ग्राम पंचायत

                </p>



                <p className="text-base font-bold text-slate-900">

                  {panchayatName}

                </p>

              </div>



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  विकासखंड

                </p>



                <p className="text-base font-bold text-slate-900">

                  {blockName}

                </p>

              </div>



            </div>



          </div>



          {/* GENERAL FORM */}



          <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



            <HouseholdGeneralInformation

              houseNumber={houseNumber}

              surveyorName={surveyorName}

              existingData={formData}

              onNext={handleGeneralNext}

            />



          </div>



        </div>

      </div>

    );

  }
// \ =========================================================
// \ SECTION 2
// \ DEMOGRAPHY
// \ =========================================================
  if (activeSection === "demography") {

    return (

      <div className="min-h-screen bg-slate-50">



        <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



          {/* TOP HEADER */}



          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



            <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



              <button

                type="button"

                onClick={() => setActiveSection(null)}

                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

              >

                <ArrowLeft size={16} />

                अनुभाग सूची

              </button>



              <div className="text-right">

                <p className="text-[11px] text-slate-500">

                  हाउसहोल्ड सर्वे

                </p>



                <p className="text-base font-bold text-slate-900">

                  मकान #{houseNumber}

                </p>

              </div>



            </div>



          </div>



          {/* LOCATION */}



          <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  ग्राम

                </p>



                <p className="text-base font-bold text-slate-900">

                  {villageName}

                </p>

              </div>



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  ग्राम पंचायत

                </p>



                <p className="text-base font-bold text-slate-900">

                  {panchayatName}

                </p>

              </div>



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  विकासखंड

                </p>



                <p className="text-base font-bold text-slate-900">

                  {blockName}

                </p>

              </div>



            </div>



          </div>



          {/* DEMOGRAPHY FORM */}



          <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



            <HouseholdDemography

              houseNumber={houseNumber}

              existingData={formData}

              onBack={() => setActiveSection(null)}

              onNext={handleDemographyNext}

            />



          </div>



        </div>



      </div>

    );

  }
// \ =========================================================
// \ OTHER SECTIONS
// \ =========================================================// \ =========================================================
// \ SECTION 3
// \ DOCUMENTS & GOVERNMENT SCHEMES
// \ =========================================================
if (activeSection === "documents") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">

              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>

            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* DOCUMENTS FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdDocumentsSchemes

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                documentsCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>



    </div>

  );

}
// \ =========================================================
// \ SECTION 4
// \ WOMEN, MATERNITY & SOCIAL SECURITY
// \ =========================================================
if (activeSection === "women") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SECTION 4 FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdWomenSocialSecurity

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                womenCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>



    </div>

  );

}
// \ =========================================================
// \ SECTION 5
// \ DIVYANG SAHAYATA & NAGARIK DASTAVEJ
// \ =========================================================
if (activeSection === "disability") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SECTION 5 FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdDisabilityDocuments

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                disabilityCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>



    </div>

  );

}
// \ =========================================================
// \ SECTION 6
// \ CHILDREN, ANGANWADI & EDUCATION
// \ =========================================================
if (activeSection === "education") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SECTION 6 FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdChildrenEducation

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                educationCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>



    </div>

  );

}
// \ =========================================================
// \ SECTION 7
// \ AGRICULTURE, EMPLOYMENT & INCOME
// \ =========================================================
if (activeSection === "employment") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SECTION 7 FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdAgricultureEmployment

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                employmentCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>



    </div>

  );

}
// \ =========================================================
// \ SECTION 8
// \ HOUSING & BASIC HOUSEHOLD FACILITIES
// \ =========================================================
if (activeSection === "housing") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SECTION 8 FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdHousingFacilities

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                housingCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>



    </div>

  );

}



if (activeSection === "health") {

  return (

    <div className="min-h-screen bg-slate-50">

      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">

              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>

            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* HEALTH FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdHealth

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                healthCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>

    </div>

  );

}



//shg



if (activeSection === "shg") {

  return (

    <div className="min-h-screen bg-slate-50">

      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              अनुभाग सूची

            </button>



            <div className="text-right">

              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>

            </div>



          </div>



        </div>



        {/* LOCATION */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SHG FORM */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdSHG

            houseNumber={houseNumber}

            existingData={formData}

            onBack={() => setActiveSection(null)}

            onNext={(data) => {

              setFormData((prev: any) => ({

                ...prev,

                ...data,

                shgCompleted: true,

              }));



              setActiveSection(null);

            }}

          />



        </div>



      </div>

    </div>

  );

}
// \ =========================================================
// \ SECTION 11
// \ OTHER INFORMATION / FAMILY NEEDS
// \ =========================================================
if (activeSection === "other") {

  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* =================================================

            TOP HEADER

        ================================================== */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={() => setActiveSection(null)}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />



              अनुभाग सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* =================================================

            LOCATION INFORMATION

        ================================================== */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>



              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>



            </div>



            <div>



              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>



            </div>



            <div>



              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>



            </div>



          </div>



        </div>



        {/* =================================================

            SECTION 11 FORM

        ================================================== */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          <HouseholdOtherInformation

            houseNumber={houseNumber}

            existingData={formData}



            onBack={() => setActiveSection(null)}



            onComplete={(data) => {
              const finalData = {
                ...formData,
                ...data,
                otherCompleted: true,
              };

              setFormData(finalData);
              setActiveSection(null);
            }}

          />



        </div>



      </div>



    </div>

  );

}



  if (activeSection !== null) {

    const selectedSection = sections.find(

      (section) => section.id === activeSection

    );



    return (

      <div className="min-h-screen bg-slate-50">



        <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



          {/* HEADER */}



          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



            <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



              <button

                type="button"

                onClick={() => setActiveSection(null)}

                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

              >

                <ArrowLeft size={16} />

                अनुभाग सूची

              </button>



              <div className="text-right">

                <p className="text-[11px] text-slate-500">

                  हाउसहोल्ड सर्वे

                </p>



                <p className="text-base font-bold text-slate-900">

                  मकान #{houseNumber}

                </p>

              </div>



            </div>



          </div>



          {/* LOCATION */}



          <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  ग्राम

                </p>



                <p className="text-base font-bold text-slate-900">

                  {villageName}

                </p>

              </div>



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  ग्राम पंचायत

                </p>



                <p className="text-base font-bold text-slate-900">

                  {panchayatName}

                </p>

              </div>



              <div>

                <p className="text-xs text-slate-500 mb-1">

                  विकासखंड

                </p>



                <p className="text-base font-bold text-slate-900">

                  {blockName}

                </p>

              </div>



            </div>



          </div>



          {/* COMING SOON */}



          <div className="mt-5 bg-white border border-slate-300 rounded-xl p-8">



            <div className="max-w-xl mx-auto text-center">



              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">



                <span className="text-lg font-bold text-slate-700">

                  {selectedSection?.number}

                </span>



              </div>



              <h2 className="text-xl font-bold text-slate-900 mt-4">

                {selectedSection?.title}

              </h2>



              <p className="text-sm text-slate-500 mt-2">

                {selectedSection?.description}

              </p>



              <p className="text-xs text-slate-400 mt-4">

                इस अनुभाग के प्रश्न अगले चरण में जोड़े जाएंगे।

              </p>



              <button

                type="button"

                onClick={() => setActiveSection(null)}

                className="mt-5 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"

              >

                अनुभाग सूची पर वापस जाएँ

              </button>



            </div>



          </div>



        </div>



      </div>

    );

  }
// \ =========================================================
// \ SECTION LIST
// \ =========================================================
  return (

    <div className="min-h-screen bg-slate-50">



      <div className="max-w-[1450px] mx-auto px-5 lg:px-6 py-5">



        {/* TOP HEADER */}



        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">



          <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-300">



            <button

              type="button"

              onClick={onBack}

              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-900 rounded-lg text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"

            >

              <ArrowLeft size={16} />

              परिवार सूची

            </button>



            <div className="text-right">



              <p className="text-[11px] text-slate-500">

                हाउसहोल्ड सर्वे

              </p>



              <p className="text-base font-bold text-slate-900">

                मकान #{houseNumber}

              </p>



            </div>



          </div>



        </div>



        {/* LOCATION CARD */}



        <div className="mt-4 bg-white border border-slate-300 rounded-xl px-5 py-5">



          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम

              </p>



              <p className="text-base font-bold text-slate-900">

                {villageName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                ग्राम पंचायत

              </p>



              <p className="text-base font-bold text-slate-900">

                {panchayatName}

              </p>

            </div>



            <div>

              <p className="text-xs text-slate-500 mb-1">

                विकासखंड

              </p>



              <p className="text-base font-bold text-slate-900">

                {blockName}

              </p>

            </div>



          </div>



        </div>



        {/* SECTION CONTAINER */}



        <div className="mt-5 bg-white border border-slate-300 rounded-xl p-5 lg:p-6">



          {/* HEADER */}



          <div className="mb-5">



            <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md">



              <span className="text-xs font-bold text-blue-700">

                हाउसहोल्ड सर्वे

              </span>



            </div>



            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">

              सर्वेक्षण अनुभाग

            </h1>



            <p className="text-sm text-slate-500 mt-1">

              जिस अनुभाग की जानकारी दर्ज करनी है, उस पर क्लिक करें।

            </p>



          </div>



          {/* SECTION CARDS */}



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">



            {sections.map((section) => {
// \ IMPORTANT:
// \ Completion is based on an explicit completion flag,
// \ NOT on whether fields contain values.
// \
// \ Therefore even an empty form becomes "पूर्ण"
// \ after clicking "आगे बढ़ें".
const isCompleted =

  section.id === "general"

    ? Boolean(formData?.generalCompleted)

    : section.id === "demography"

    ? Boolean(formData?.demographyCompleted)

    : section.id === "documents"

    ? Boolean(formData?.documentsCompleted)

    : section.id === "women"

    ? Boolean(formData?.womenCompleted)

    : section.id === "disability"

    ? Boolean(formData?.disabilityCompleted)

    : section.id === "education"

    ? Boolean(formData?.educationCompleted)

    : section.id === "employment"

    ? Boolean(formData?.employmentCompleted)

    : section.id === "housing"

    ? Boolean(formData?.housingCompleted)

    : section.id === "health"

    ? Boolean(formData?.healthCompleted)

    : section.id === "shg"

    ? Boolean(formData?.shgCompleted)

    : section.id === "other"

    ? Boolean(formData?.otherCompleted)

    : false;

              return (

                <button

                  key={section.id}

                  type="button"

                  onClick={() =>

                    handleSectionClick(section.id)

                  }

                  className="group w-full text-left bg-white border border-slate-200 hover:border-slate-400 rounded-lg px-4 py-4 lg:px-5 lg:py-4.5 transition-all duration-200 hover:shadow-sm cursor-pointer"

                >



                  <div className="flex items-center gap-4">



                    {/* NUMBER */}



                    <div

                      className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-base font-bold ${

                        isCompleted

                          ? "bg-emerald-600 text-white"

                          : "bg-slate-100 text-slate-800"

                      }`}

                    >



                      {isCompleted ? (

                        <CheckCircle2 size={19} />

                      ) : (

                        section.number

                      )}



                    </div>



                    {/* TEXT */}



                    <div className="flex-1 min-w-0">



                      <div className="flex items-center justify-between gap-2">



                        <h2 className="text-[15px] lg:text-base font-bold text-slate-900">

                          {section.title}

                        </h2>



                        {isCompleted && (

                          <span className="hidden sm:inline text-xs font-bold text-emerald-600">

                            ✓ पूर्ण

                          </span>

                        )}



                      </div>



                      <p className="text-xs lg:text-sm text-slate-500 mt-1 leading-5">



                        {isCompleted

                          ? "जानकारी दर्ज है • विवरण देखें / संपादित करें"

                          : section.description}



                      </p>



                    </div>



                    {/* OPEN */}



                    <div className="shrink-0 flex items-center gap-1 text-xs lg:text-sm text-slate-400 group-hover:text-slate-900 transition-colors">



                      <span className="hidden sm:inline">

                        खोलें

                      </span>



                      <ChevronRight

                        size={18}

                        className="group-hover:translate-x-0.5 transition-transform"

                      />



                    </div>



                  </div>



                </button>

              );

            })}



          </div>



          {/* FOOTER */}



          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">



            <div>



              <p className="text-sm font-semibold text-slate-700">

                मकान #{houseNumber}

              </p>



              <p className="text-xs text-slate-500 mt-0.5">

                सभी अनुभागों में जानकारी भरना वैकल्पिक है।

              </p>



            </div>



            <button
              type="button"
              onClick={handleComplete}
              disabled={!allSectionsCompleted}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                allSectionsCompleted
                  ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {allSectionsCompleted
                ? "सर्वे पूर्ण करें"
                : `${completedCount}/11 अनुभाग पूर्ण`}
              <CheckCircle2 size={16} />
            </button>



          </div>



        </div>



      </div>



    </div>

  );

};



export default HouseholdForm;