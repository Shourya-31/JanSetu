import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface HouseholdDisabilityDocumentsRef {
  getData: () => {
    needsAssistiveDevice: string;
    assistanceTypes: string[];
    otherAssistance: string;
    deathInLastYear: string;
    deathCertificateReceived: string;
    pmGaribKalyanRation: string;
  };
}

interface HouseholdDisabilityDocumentsProps {
  houseNumber: number;
  existingData?: {
    needsAssistiveDevice?: string;
    assistanceTypes?: string[];
    otherAssistance?: string;
    deathInLastYear?: string;
    deathCertificateReceived?: string;
    pmGaribKalyanRation?: string;
  };
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdDisabilityDocuments = forwardRef<
  HouseholdDisabilityDocumentsRef,
  HouseholdDisabilityDocumentsProps
>(({ existingData }, ref) => {
  const [needsAssistiveDevice, setNeedsAssistiveDevice] = useState(
    existingData?.needsAssistiveDevice ?? ""
  );

  const [assistanceTypes, setAssistanceTypes] = useState<string[]>(
    existingData?.assistanceTypes ?? []
  );

  const [otherAssistance, setOtherAssistance] = useState(
    existingData?.otherAssistance ?? ""
  );

  const [deathInLastYear, setDeathInLastYear] = useState(
    existingData?.deathInLastYear ?? ""
  );

  const [deathCertificateReceived, setDeathCertificateReceived] =
    useState(existingData?.deathCertificateReceived ?? "");

  const [pmGaribKalyanRation, setPmGaribKalyanRation] = useState(
    existingData?.pmGaribKalyanRation ?? ""
  );

  const assistanceOptions = [
    "बैसाखी / छड़ी",
    "व्हीलचेयर",
    "श्रवण यंत्र",
    "ट्राइसाइकिल",
    "कृत्रिम अंग",
    "दृष्टि सहायक उपकरण",
    "अन्य",
  ];

  const toggleAssistanceType = (option: string) => {
    setAssistanceTypes((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // Parent HouseholdForm final "सर्वे पूर्ण करें" पर इसे call करेगा
  useImperativeHandle(ref, () => ({
    getData: () => ({
      needsAssistiveDevice,
      assistanceTypes,
      otherAssistance,
      deathInLastYear,
      deathCertificateReceived,
      pmGaribKalyanRation,
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

        <span className="text-sm text-slate-800">{value}</span>
      </label>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-6">

        {/* ===================================================
            1. सहायक उपकरण
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. किसी दिव्यांग सदस्य को तत्काल सहायक उपकरण / विशेष सहायता चाहिए?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="needsAssistiveDevice"
              value="हाँ"
              checked={needsAssistiveDevice === "हाँ"}
              onChange={setNeedsAssistiveDevice}
            />

            <RadioOption
              name="needsAssistiveDevice"
              value="नहीं"
              checked={needsAssistiveDevice === "नहीं"}
              onChange={setNeedsAssistiveDevice}
            />
          </div>

          {needsAssistiveDevice === "हाँ" && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-600 mb-3">
                यदि हाँ, सहायता का प्रकार
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assistanceOptions.map((option) => {
                  const checked = assistanceTypes.includes(option);

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
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAssistanceType(option)}
                        className="w-4 h-4 accent-slate-900"
                      />

                      <span className="text-sm text-slate-800">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              {assistanceTypes.includes("अन्य") && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={otherAssistance}
                    onChange={(e) =>
                      setOtherAssistance(e.target.value)
                    }
                    placeholder="अन्य सहायता का विवरण"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===================================================
            2. मृत्यु
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. पिछले 1 वर्ष में परिवार में मृत्यु हुई?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="deathInLastYear"
              value="हाँ"
              checked={deathInLastYear === "हाँ"}
              onChange={setDeathInLastYear}
            />

            <RadioOption
              name="deathInLastYear"
              value="नहीं"
              checked={deathInLastYear === "नहीं"}
              onChange={setDeathInLastYear}
            />
          </div>

          {deathInLastYear === "हाँ" && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-600 mb-3">
                यदि हाँ, मृत्यु प्रमाण-पत्र प्राप्त हुआ?
              </label>

              <div className="flex flex-wrap gap-3">
                <RadioOption
                  name="deathCertificateReceived"
                  value="हाँ"
                  checked={deathCertificateReceived === "हाँ"}
                  onChange={setDeathCertificateReceived}
                />

                <RadioOption
                  name="deathCertificateReceived"
                  value="नहीं"
                  checked={deathCertificateReceived === "नहीं"}
                  onChange={setDeathCertificateReceived}
                />
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            3. PM गरीब कल्याण योजना
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            3. PM गरीब कल्याण योजना के अंतर्गत निःशुल्क राशन मिल रहा है?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="pmGaribKalyanRation"
              value="हाँ"
              checked={pmGaribKalyanRation === "हाँ"}
              onChange={setPmGaribKalyanRation}
            />

            <RadioOption
              name="pmGaribKalyanRation"
              value="नहीं"
              checked={pmGaribKalyanRation === "नहीं"}
              onChange={setPmGaribKalyanRation}
            />

            <RadioOption
              name="pmGaribKalyanRation"
              value="पात्रता नहीं"
              checked={pmGaribKalyanRation === "पात्रता नहीं"}
              onChange={setPmGaribKalyanRation}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

HouseholdDisabilityDocuments.displayName =
  "HouseholdDisabilityDocuments";

export default HouseholdDisabilityDocuments;