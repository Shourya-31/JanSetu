import React, { useState } from "react";

interface HouseholdGeneralInformationProps {
  houseNumber: number;
  surveyorName: string;
  existingData?: {
    headName?: string;
    mobile?: string;
    surveyDate?: string;
    surveyorName?: string;
  };
  onNext: (data: {
    houseNumber: number;
    headName: string;
    mobile: string;
    surveyDate: string;
    surveyorName: string;
  }) => void;
}

const inputClass =
  "w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm " +
  "focus:outline-none focus:ring-1 focus:ring-slate-900";

const HouseholdGeneralInformation: React.FC<
  HouseholdGeneralInformationProps
> = ({
  houseNumber,
  surveyorName,
  existingData,
  onNext,
}) => {
  const [headName, setHeadName] = useState(
    existingData?.headName ?? ""
  );

  const [mobile, setMobile] = useState(
    existingData?.mobile ?? ""
  );

  const [surveyDate, setSurveyDate] = useState(
    existingData?.surveyDate ??
      new Date().toISOString().split("T")[0]
  );

  // ---------------------------------------------------------
  // NO VALIDATION — ALL FIELDS ARE OPTIONAL
  // ---------------------------------------------------------

  const handleNext = () => {
    onNext({
      houseNumber,
      headName: headName.trim(),
      mobile: mobile.trim(),
      surveyDate,
      surveyorName,
    });
  };

  return (
    <div className="space-y-5">

      {/* =====================================================
          SECTION HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 pb-4">

        <p className="text-[11px] text-slate-500">
          हाउसहोल्ड सर्वे • अनुभाग 1
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          परिवार की सामान्य जानकारी
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          परिवार एवं सर्वेक्षण से संबंधित मूल जानकारी दर्ज करें।
        </p>

      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* मकान नंबर */}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            मकान नं.
          </label>

          <input
            type="text"
            value={`मकान #${houseNumber}`}
            readOnly
            className={`${inputClass} bg-slate-100 text-slate-600 cursor-not-allowed`}
          />
        </div>

        {/* परिवार मुखिया */}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            परिवार मुखिया
          </label>

          <input
            type="text"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
            placeholder="परिवार मुखिया का नाम"
            className={inputClass}
          />
        </div>

        {/* मोबाइल */}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            मोबाइल नं.
          </label>

          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              setMobile(value);
            }}
            placeholder="10 अंकों का मोबाइल नंबर"
            className={inputClass}
          />
        </div>

        {/* सर्वेक्षण दिनांक */}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            सर्वेक्षण दिनांक
          </label>

          <input
            type="date"
            value={surveyDate}
            onChange={(e) => setSurveyDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* सर्वेक्षक */}

        <div className="md:col-span-2">

          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            सर्वेक्षक
          </label>

          <input
            type="text"
            value={surveyorName}
            readOnly
            className={`${inputClass} bg-slate-100 text-slate-600 cursor-not-allowed`}
          />

        </div>

      </div>

      {/* =====================================================
          NEXT BUTTON
      ====================================================== */}

      <div className="flex justify-end pt-3 border-t border-slate-200">

        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          आगे बढ़ें →
        </button>

      </div>

    </div>
  );
};

export default HouseholdGeneralInformation;