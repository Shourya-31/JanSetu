import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface HouseholdAgricultureEmploymentProps {
  houseNumber: number;
  existingData?: {
    unemployedMembers?: string;
    pmKisan?: string;
    miningEmployment?: string;
    annualIncome?: string;
    mainIncomeSource?: string;
    livestockSource?: string;
    otherLivestockSource?: string;
  };
  onBack: () => void;
  onNext: (data: any) => void;
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdAgricultureEmployment: React.FC<
  HouseholdAgricultureEmploymentProps
> = ({
  existingData,
  onBack,
  onNext,
}) => {
  const [unemployedMembers, setUnemployedMembers] = useState(
    existingData?.unemployedMembers ?? ""
  );

  const [pmKisan, setPmKisan] = useState(
    existingData?.pmKisan ?? ""
  );

  const [miningEmployment, setMiningEmployment] = useState(
    existingData?.miningEmployment ?? ""
  );

  const [annualIncome, setAnnualIncome] = useState(
    existingData?.annualIncome ?? ""
  );

  const [mainIncomeSource, setMainIncomeSource] = useState(
    existingData?.mainIncomeSource ?? ""
  );

  const [livestockSource, setLivestockSource] = useState(
    existingData?.livestockSource ?? ""
  );

  const [otherLivestockSource, setOtherLivestockSource] = useState(
    existingData?.otherLivestockSource ?? ""
  );

  const livestockOptions = [
    "गाय/भैंस",
    "बकरी",
    "मुर्गी/कुक्कुट",
    "मछली पालन",
    "अन्य",
  ];

  const handleNext = () => {
    onNext({
      unemployedMembers,
      pmKisan,
      miningEmployment,
      annualIncome,
      mainIncomeSource,
      livestockSource,
      otherLivestockSource,
    });
  };

  const RadioOption = ({
    name,
    value,
    checked,
    onChange,
  }: {
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
  }) => {
    return (
      <label
        className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
          checked
            ? "border-slate-900 bg-slate-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
          className="w-4 h-4 accent-slate-900"
        />

        <span className="text-sm text-slate-800">
          {value}
        </span>
      </label>
    );
  };

  return (
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 pb-4">

        <p className="text-[11px] text-slate-500">
          हाउसहोल्ड सर्वे • अनुभाग 7
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          कृषि, रोजगार एवं आय
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          परिवार की कृषि, रोजगार एवं आय से संबंधित जानकारी दर्ज करें।
        </p>

      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="space-y-6">

        {/* ===================================================
            1. बेरोजगार सदस्य
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            1. परिवार में बेरोजगार सदस्यों (18-45 वर्ष) की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={unemployedMembers}
            onChange={(e) => setUnemployedMembers(e.target.value)}
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* ===================================================
            2. PM-KISAN
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. पिछले वर्ष PM-KISAN की राशि प्राप्त हुई?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="pmKisan"
              value="हाँ"
              checked={pmKisan === "हाँ"}
              onChange={setPmKisan}
            />

            <RadioOption
              name="pmKisan"
              value="नहीं"
              checked={pmKisan === "नहीं"}
              onChange={setPmKisan}
            />

            <RadioOption
              name="pmKisan"
              value="पात्रता नहीं"
              checked={pmKisan === "पात्रता नहीं"}
              onChange={setPmKisan}
            />

          </div>
        </div>

        {/* ===================================================
            3. खनन
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            3. परिवार का कोई सदस्य खनन में कार्यरत है?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="miningEmployment"
              value="हाँ"
              checked={miningEmployment === "हाँ"}
              onChange={setMiningEmployment}
            />

            <RadioOption
              name="miningEmployment"
              value="नहीं"
              checked={miningEmployment === "नहीं"}
              onChange={setMiningEmployment}
            />

          </div>
        </div>

        {/* ===================================================
            4. वार्षिक आय
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            4. परिवार की कुल वार्षिक आय
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <RadioOption
              name="annualIncome"
              value="₹20,000 से कम"
              checked={annualIncome === "₹20,000 से कम"}
              onChange={setAnnualIncome}
            />

            <RadioOption
              name="annualIncome"
              value="₹20,000–₹50,000"
              checked={annualIncome === "₹20,000–₹50,000"}
              onChange={setAnnualIncome}
            />

            <RadioOption
              name="annualIncome"
              value="₹50,000–₹2,00,000"
              checked={annualIncome === "₹50,000–₹2,00,000"}
              onChange={setAnnualIncome}
            />

            <RadioOption
              name="annualIncome"
              value="₹2,00,000 से अधिक"
              checked={annualIncome === "₹2,00,000 से अधिक"}
              onChange={setAnnualIncome}
            />

          </div>
        </div>

        {/* ===================================================
            5. आय का मुख्य स्रोत
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            5. आय का मुख्य स्रोत
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <RadioOption
              name="mainIncomeSource"
              value="कृषि"
              checked={mainIncomeSource === "कृषि"}
              onChange={setMainIncomeSource}
            />

            <RadioOption
              name="mainIncomeSource"
              value="कृषि/दैनिक मजदूरी"
              checked={mainIncomeSource === "कृषि/दैनिक मजदूरी"}
              onChange={setMainIncomeSource}
            />

            <RadioOption
              name="mainIncomeSource"
              value="सरकारी/निजी नौकरी"
              checked={mainIncomeSource === "सरकारी/निजी नौकरी"}
              onChange={setMainIncomeSource}
            />

            <RadioOption
              name="mainIncomeSource"
              value="व्यवसाय/स्वरोजगार"
              checked={mainIncomeSource === "व्यवसाय/स्वरोजगार"}
              onChange={setMainIncomeSource}
            />

            <RadioOption
              name="mainIncomeSource"
              value="पशुपालन"
              checked={mainIncomeSource === "पशुपालन"}
              onChange={setMainIncomeSource}
            />

          </div>

          {/* ===============================================
              पशुपालन का प्रकार
          ================================================ */}

          {mainIncomeSource === "पशुपालन" && (
            <div className="mt-4">

              <label className="block text-xs font-bold text-slate-600 mb-3">
                यदि पशुपालन मुख्य स्रोत है
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {livestockOptions.map((option) => {

                  const checked =
                    livestockSource === option;

                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                        checked
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >

                      <input
                        type="radio"
                        name="livestockSource"
                        value={option}
                        checked={checked}
                        onChange={(e) =>
                          setLivestockSource(e.target.value)
                        }
                        className="w-4 h-4 accent-slate-900"
                      />

                      <span className="text-sm text-slate-800">
                        {option}
                      </span>

                    </label>
                  );
                })}

              </div>

              {livestockSource === "अन्य" && (
                <div className="mt-3">

                  <input
                    type="text"
                    value={otherLivestockSource}
                    onChange={(e) =>
                      setOtherLivestockSource(e.target.value)
                    }
                    placeholder="अन्य पशुपालन का विवरण"
                    className={inputClass}
                  />

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
          अनुभाग सूची
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          आगे बढ़ें →
        </button>

      </div>

    </div>
  );
};

export default HouseholdAgricultureEmployment;