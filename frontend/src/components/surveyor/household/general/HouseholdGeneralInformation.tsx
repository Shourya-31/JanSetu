import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface HouseholdGeneralInformationRef {
  getData: () => {
    houseNumber: number;
    headName: string;
    mobile: string;
    surveyDate: string;
    surveyorName: string;
  };
}

interface HouseholdGeneralInformationProps {
  houseNumber: number;
  surveyorName: string;
  existingData?: {
    headName?: string;
    mobile?: string;
    surveyDate?: string;
    surveyorName?: string;
  };
}

const inputClass =
  "w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm " +
  "focus:outline-none focus:ring-1 focus:ring-slate-900";

const HouseholdGeneralInformation = forwardRef<
  HouseholdGeneralInformationRef,
  HouseholdGeneralInformationProps
>(({ houseNumber, surveyorName, existingData }, ref) => {
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

  // Parent HouseholdForm के "सर्वे पूर्ण करें" पर
  // current values प्राप्त करेगा
  useImperativeHandle(ref, () => ({
    getData: () => ({
      houseNumber,
      headName: headName.trim(),
      mobile: mobile.trim(),
      surveyDate,
      surveyorName,
    }),
  }));

  return (
    <div className="space-y-5">
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
    </div>
  );
});

HouseholdGeneralInformation.displayName =
  "HouseholdGeneralInformation";

export default HouseholdGeneralInformation;