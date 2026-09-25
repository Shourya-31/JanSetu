import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface HouseholdOtherInformationProps {
  houseNumber: number;

  existingData?: {
    priorityNeed1?: string;
    priorityNeed2?: string;
    priorityNeed3?: string;
    eligibleSchemeNotReceived?: string;
    schemeBenefitName?: string;
  };

  onBack: () => void;

  // Last section complete hone ke baad
  // poore household form ko complete karega
  onComplete: (data: any) => void;
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdOtherInformation: React.FC<
  HouseholdOtherInformationProps
> = ({
  existingData,
  onBack,
  onComplete,
}) => {
  const [priorityNeed1, setPriorityNeed1] = useState(
    existingData?.priorityNeed1 ?? ""
  );

  const [priorityNeed2, setPriorityNeed2] = useState(
    existingData?.priorityNeed2 ?? ""
  );

  const [priorityNeed3, setPriorityNeed3] = useState(
    existingData?.priorityNeed3 ?? ""
  );

  const [eligibleSchemeNotReceived, setEligibleSchemeNotReceived] =
    useState(existingData?.eligibleSchemeNotReceived ?? "");

  const [schemeBenefitName, setSchemeBenefitName] = useState(
    existingData?.schemeBenefitName ?? ""
  );

  const handleComplete = () => {
    onComplete({
      priorityNeed1: priorityNeed1.trim(),
      priorityNeed2: priorityNeed2.trim(),
      priorityNeed3: priorityNeed3.trim(),

      eligibleSchemeNotReceived,

      schemeBenefitName: schemeBenefitName.trim(),

      // Last section
      otherCompleted: true,
    });
  };

  return (
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 pb-4">

        <p className="text-[11px] text-slate-500">
          हाउसहोल्ड सर्वे • अनुभाग 11
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          परिवार की प्रमुख आवश्यकताएँ / समस्या
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          परिवार की प्रमुख आवश्यकताओं एवं सरकारी योजनाओं से संबंधित जानकारी दर्ज करें।
        </p>

      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="space-y-6">

        {/* ===================================================
            QUESTION 1
        ==================================================== */}

        <div>

          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. परिवार की सबसे जरूरी 3 आवश्यकताएँ (प्राथमिकता क्रम में)
          </label>

          <div className="space-y-3">

            {/* PRIORITY 1 */}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                प्राथमिकता 1
              </label>

              <input
                type="text"
                value={priorityNeed1}
                onChange={(e) => setPriorityNeed1(e.target.value)}
                placeholder="सबसे जरूरी आवश्यकता"
                className={inputClass}
              />
            </div>

            {/* PRIORITY 2 */}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                प्राथमिकता 2
              </label>

              <input
                type="text"
                value={priorityNeed2}
                onChange={(e) => setPriorityNeed2(e.target.value)}
                placeholder="दूसरी जरूरी आवश्यकता"
                className={inputClass}
              />
            </div>

            {/* PRIORITY 3 

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                प्राथमिकता 3
              </label>

              <input
                type="text"
                value={priorityNeed3}
                onChange={(e) => setPriorityNeed3(e.target.value)}
                placeholder="तीसरी जरूरी आवश्यकता"
                className={inputClass}
              />
            </div>*/}

          </div>

        </div>

        {/* ===================================================
            QUESTION 2
        ==================================================== */}

        <div>

          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. परिवार को किसी सरकारी योजना का लाभ पात्र होने के बावजूद नहीं मिल रहा है?
          </label>

          <div className="flex flex-wrap gap-3">

            <label
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                eligibleSchemeNotReceived === "हाँ"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="eligibleSchemeNotReceived"
                value="हाँ"
                checked={eligibleSchemeNotReceived === "हाँ"}
                onChange={(e) =>
                  setEligibleSchemeNotReceived(e.target.value)
                }
                className="w-4 h-4 accent-slate-900"
              />

              <span className="text-sm text-slate-800">
                हाँ
              </span>
            </label>

            <label
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                eligibleSchemeNotReceived === "नहीं"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="eligibleSchemeNotReceived"
                value="नहीं"
                checked={eligibleSchemeNotReceived === "नहीं"}
                onChange={(e) =>
                  setEligibleSchemeNotReceived(e.target.value)
                }
                className="w-4 h-4 accent-slate-900"
              />

              <span className="text-sm text-slate-800">
                नहीं
              </span>
            </label>

          </div>

          {/* योजना का नाम */}

          {eligibleSchemeNotReceived === "हाँ" && (
            <div className="mt-4">

              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                यदि हाँ, योजना/लाभ का नाम
              </label>

              <input
                type="text"
                value={schemeBenefitName}
                onChange={(e) =>
                  setSchemeBenefitName(e.target.value)
                }
                placeholder="योजना / लाभ का नाम"
                className={inputClass}
              />

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">

        {/* BACK */}

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />

          अनुभाग सूची
        </button>

        {/* COMPLETE */}

        <button
          type="button"
          onClick={handleComplete}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          सर्वे पूरा करें ✓
        </button>

      </div>

    </div>
  );
};

export default HouseholdOtherInformation;