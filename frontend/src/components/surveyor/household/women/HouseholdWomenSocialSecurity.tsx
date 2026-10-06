import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

interface HouseholdWomenSocialSecurityProps {
  houseNumber: number;

  existingData?: {
    jsy?: string;
    pmmvy?: string;
    mahtariVandana?: string;
    widowPension?: string;
    disabilityPension?: string;
  };
}

export interface HouseholdWomenSocialSecurityRef {
  getData: () => {
    jsy: string;
    pmmvy: string;
    mahtariVandana: string;
    widowPension: string;
    disabilityPension: string;
  };
}

const HouseholdWomenSocialSecurity = forwardRef<
  HouseholdWomenSocialSecurityRef,
  HouseholdWomenSocialSecurityProps
>(({ existingData }, ref) => {
  const [jsy, setJsy] = useState(
    existingData?.jsy ?? ""
  );

  const [pmmvy, setPmmvy] = useState(
    existingData?.pmmvy ?? ""
  );

  const [mahtariVandana, setMahtariVandana] = useState(
    existingData?.mahtariVandana ?? ""
  );

  const [widowPension, setWidowPension] = useState(
    existingData?.widowPension ?? ""
  );

  const [disabilityPension, setDisabilityPension] = useState(
    existingData?.disabilityPension ?? ""
  );

  // Parent HouseholdForm final save ke time
  // current data yahan se collect karega
  useImperativeHandle(ref, () => ({
    getData: () => ({
      jsy,
      pmmvy,
      mahtariVandana,
      widowPension,
      disabilityPension,
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
    <div className="space-y-5">

      {/* =====================================================
          1. JSY
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          1. पात्र महिला को जननी सुरक्षा योजना (JSY) का लाभ मिला?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="jsy"
            value="हाँ"
            checked={jsy === "हाँ"}
            onChange={setJsy}
          />

          <RadioOption
            name="jsy"
            value="नहीं"
            checked={jsy === "नहीं"}
            onChange={setJsy}
          />

          <RadioOption
            name="jsy"
            value="पात्रता नहीं"
            checked={jsy === "पात्रता नहीं"}
            onChange={setJsy}
          />
        </div>
      </div>

      {/* =====================================================
          2. PMMVY
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          2. पात्र महिला को PM मातृवंदना योजना (PMMVY) का लाभ मिला?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="pmmvy"
            value="हाँ"
            checked={pmmvy === "हाँ"}
            onChange={setPmmvy}
          />

          <RadioOption
            name="pmmvy"
            value="नहीं"
            checked={pmmvy === "नहीं"}
            onChange={setPmmvy}
          />

          <RadioOption
            name="pmmvy"
            value="पात्रता नहीं"
            checked={pmmvy === "पात्रता नहीं"}
            onChange={setPmmvy}
          />
        </div>
      </div>

      {/* =====================================================
          3. MAHTARI VANDANA
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          3. पात्र महिला को महतारी वंदना योजना की राशि मिली?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="mahtariVandana"
            value="हाँ"
            checked={mahtariVandana === "हाँ"}
            onChange={setMahtariVandana}
          />

          <RadioOption
            name="mahtariVandana"
            value="नहीं"
            checked={mahtariVandana === "नहीं"}
            onChange={setMahtariVandana}
          />

          <RadioOption
            name="mahtariVandana"
            value="पात्रता नहीं"
            checked={mahtariVandana === "पात्रता नहीं"}
            onChange={setMahtariVandana}
          />
        </div>
      </div>

      {/* =====================================================
          4. WIDOW PENSION
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          4. 40-79 वर्ष की पात्र विधवा महिला को विधवा पेंशन मिल रही है?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="widowPension"
            value="हाँ"
            checked={widowPension === "हाँ"}
            onChange={setWidowPension}
          />

          <RadioOption
            name="widowPension"
            value="नहीं"
            checked={widowPension === "नहीं"}
            onChange={setWidowPension}
          />

          <RadioOption
            name="widowPension"
            value="पात्रता नहीं"
            checked={widowPension === "पात्रता नहीं"}
            onChange={setWidowPension}
          />
        </div>
      </div>

      {/* =====================================================
          5. DISABILITY PENSION
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          5. पात्र दिव्यांग व्यक्ति को दिव्यांग पेंशन मिल रही है?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="disabilityPension"
            value="हाँ"
            checked={disabilityPension === "हाँ"}
            onChange={setDisabilityPension}
          />

          <RadioOption
            name="disabilityPension"
            value="नहीं"
            checked={disabilityPension === "नहीं"}
            onChange={setDisabilityPension}
          />

          <RadioOption
            name="disabilityPension"
            value="पात्रता नहीं"
            checked={disabilityPension === "पात्रता नहीं"}
            onChange={setDisabilityPension}
          />
        </div>
      </div>

    </div>
  );
});

HouseholdWomenSocialSecurity.displayName =
  "HouseholdWomenSocialSecurity";

export default HouseholdWomenSocialSecurity;