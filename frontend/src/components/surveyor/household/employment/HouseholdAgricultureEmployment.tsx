import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

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
    animalEmployment?: string;
  };
}

export interface HouseholdAgricultureEmploymentRef {
  getData: () => {
    unemployedMembers: string;
    pmKisan: string;
    miningEmployment: string;
    annualIncome: string;
    mainIncomeSource: string;
    livestockSource: string;
    otherLivestockSource: string;
    animalEmployment: string;
  };
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdAgricultureEmployment = forwardRef<
  HouseholdAgricultureEmploymentRef,
  HouseholdAgricultureEmploymentProps
>(({ existingData }, ref) => {
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

  const [otherLivestockSource, setOtherLivestockSource] =
    useState(existingData?.otherLivestockSource ?? "");

  const [animalEmployment, setAnimalEmployment] = useState(
    existingData?.animalEmployment ?? ""
  );

  /*
   * Parent HouseholdForm final save par
   * yahan se current data collect karega.
   */
  useImperativeHandle(ref, () => ({
    getData: () => ({
      unemployedMembers,
      pmKisan,
      miningEmployment,
      annualIncome,
      mainIncomeSource,
      livestockSource,
      otherLivestockSource,
      animalEmployment,
    }),
  }));

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
    <div className="space-y-6">

      {/* =====================================================
          1. UNEMPLOYED MEMBERS
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          1. परिवार में कितने सदस्य वर्तमान में बेरोजगार हैं?
        </label>

        <input
          type="number"
          min="0"
          value={unemployedMembers}
          onChange={(e) => setUnemployedMembers(e.target.value)}
          className={inputClass}
          placeholder="सदस्यों की संख्या"
        />
      </div>

      {/* =====================================================
          2. PM KISAN
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          2. क्या परिवार को PM किसान योजना का लाभ मिल रहा है?
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

      {/* =====================================================
          3. MINING EMPLOYMENT
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          3. क्या परिवार का कोई सदस्य खनन कार्य में रोजगार करता है?
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

      {/* =====================================================
          4. ANNUAL INCOME
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          4. परिवार की अनुमानित वार्षिक आय
        </label>

        <input
          type="number"
          min="0"
          value={annualIncome}
          onChange={(e) => setAnnualIncome(e.target.value)}
          className={inputClass}
          placeholder="वार्षिक आय दर्ज करें"
        />
      </div>

      {/* =====================================================
          5. MAIN INCOME SOURCE
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          5. परिवार की आय का मुख्य स्रोत क्या है?
        </label>

        <input
          type="text"
          value={mainIncomeSource}
          onChange={(e) => setMainIncomeSource(e.target.value)}
          className={inputClass}
          placeholder="मुख्य आय का स्रोत"
        />
      </div>

      {/* =====================================================
          6. LIVESTOCK SOURCE
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          6. क्या परिवार की आजीविका पशुपालन से जुड़ी है?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="livestockSource"
            value="हाँ"
            checked={livestockSource === "हाँ"}
            onChange={setLivestockSource}
          />

          <RadioOption
            name="livestockSource"
            value="नहीं"
            checked={livestockSource === "नहीं"}
            onChange={setLivestockSource}
          />
        </div>

        {livestockSource === "हाँ" && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              पशुपालन का विवरण
            </label>

            <input
              type="text"
              value={otherLivestockSource}
              onChange={(e) =>
                setOtherLivestockSource(e.target.value)
              }
              className={inputClass}
              placeholder="जैसे गाय, भैंस, बकरी आदि"
            />
          </div>
        )}
      </div>

      {/* =====================================================
          7. ANIMAL EMPLOYMENT
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          7. क्या परिवार के सदस्य पशुपालन/पशु आधारित कार्य से रोजगार प्राप्त करते हैं?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="animalEmployment"
            value="हाँ"
            checked={animalEmployment === "हाँ"}
            onChange={setAnimalEmployment}
          />

          <RadioOption
            name="animalEmployment"
            value="नहीं"
            checked={animalEmployment === "नहीं"}
            onChange={setAnimalEmployment}
          />

          <RadioOption
            name="animalEmployment"
            value="पात्रता नहीं"
            checked={animalEmployment === "पात्रता नहीं"}
            onChange={setAnimalEmployment}
          />
        </div>
      </div>

    </div>
  );
});

HouseholdAgricultureEmployment.displayName =
  "HouseholdAgricultureEmployment";

export default HouseholdAgricultureEmployment;