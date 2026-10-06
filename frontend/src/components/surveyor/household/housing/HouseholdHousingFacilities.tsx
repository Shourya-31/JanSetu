import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface HouseholdHousingFacilitiesRef {
  getData: () => {
    houseType: string;
    housingSchemeBenefit: string;
    toiletStatus: string;
    tapWaterConnection: string;
    drinkingWaterSource: string;
    electricityConnection: string;
    solarEnergy: string;
  };
}

interface HouseholdHousingFacilitiesProps {
  houseNumber: number;
  existingData?: {
    houseType?: string;
    housingSchemeBenefit?: string;
    toiletStatus?: string;
    tapWaterConnection?: string;
    drinkingWaterSource?: string;
    electricityConnection?: string;
    solarEnergy?: string;
  };
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdHousingFacilities = forwardRef<
  HouseholdHousingFacilitiesRef,
  HouseholdHousingFacilitiesProps
>(({ existingData }, ref) => {
  const [houseType, setHouseType] = useState(
    existingData?.houseType ?? ""
  );

  const [housingSchemeBenefit, setHousingSchemeBenefit] = useState(
    existingData?.housingSchemeBenefit ?? ""
  );

  const [toiletStatus, setToiletStatus] = useState(
    existingData?.toiletStatus ?? ""
  );

  const [tapWaterConnection, setTapWaterConnection] = useState(
    existingData?.tapWaterConnection ?? ""
  );

  const [drinkingWaterSource, setDrinkingWaterSource] = useState(
    existingData?.drinkingWaterSource ?? ""
  );

  const [electricityConnection, setElectricityConnection] = useState(
    existingData?.electricityConnection ?? ""
  );

  const [solarEnergy, setSolarEnergy] = useState(
    existingData?.solarEnergy ?? ""
  );

  const drinkingWaterSources = [
    "कुआँ",
    "नदी",
    "तालाब",
    "झरना",
    "हैंडपंप",
    "अन्य",
  ];

  // Parent HouseholdForm के "सर्वे पूर्ण करें" पर
  // current data प्राप्त करेगा
  useImperativeHandle(ref, () => ({
    getData: () => ({
      houseType,
      housingSchemeBenefit,
      toiletStatus,
      tapWaterConnection,
      drinkingWaterSource,
      electricityConnection,
      solarEnergy,
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
      <div className="space-y-6">

        {/* ===================================================
            1. घर का प्रकार
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. घर का प्रकार
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="houseType"
              value="कच्चा"
              checked={houseType === "कच्चा"}
              onChange={setHouseType}
            />

            <RadioOption
              name="houseType"
              value="पक्का"
              checked={houseType === "पक्का"}
              onChange={setHouseType}
            />

            <RadioOption
              name="houseType"
              value="अर्ध-पक्का"
              checked={houseType === "अर्ध-पक्का"}
              onChange={setHouseType}
            />
          </div>
        </div>

        {/* ===================================================
            2. आवास योजना
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. ग्रामीण आवास/अन्य सरकारी आवास योजना का लाभ मिला?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="housingSchemeBenefit"
              value="हाँ"
              checked={housingSchemeBenefit === "हाँ"}
              onChange={setHousingSchemeBenefit}
            />

            <RadioOption
              name="housingSchemeBenefit"
              value="नहीं"
              checked={housingSchemeBenefit === "नहीं"}
              onChange={setHousingSchemeBenefit}
            />

            <RadioOption
              name="housingSchemeBenefit"
              value="पात्रता नहीं"
              checked={housingSchemeBenefit === "पात्रता नहीं"}
              onChange={setHousingSchemeBenefit}
            />
          </div>
        </div>

        {/* ===================================================
            3. शौचालय
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            3. घर में शौचालय है?
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <RadioOption
              name="toiletStatus"
              value="हाँ, उपयोग में"
              checked={toiletStatus === "हाँ, उपयोग में"}
              onChange={setToiletStatus}
            />

            <RadioOption
              name="toiletStatus"
              value="हाँ, उपयोग में नहीं"
              checked={toiletStatus === "हाँ, उपयोग में नहीं"}
              onChange={setToiletStatus}
            />

            <RadioOption
              name="toiletStatus"
              value="नहीं"
              checked={toiletStatus === "नहीं"}
              onChange={setToiletStatus}
            />
          </div>
        </div>

        {/* ===================================================
            4. नल का पानी
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            4. नल के पानी का कनेक्शन है?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="tapWaterConnection"
              value="हाँ"
              checked={tapWaterConnection === "हाँ"}
              onChange={setTapWaterConnection}
            />

            <RadioOption
              name="tapWaterConnection"
              value="नहीं"
              checked={tapWaterConnection === "नहीं"}
              onChange={setTapWaterConnection}
            />
          </div>

          {tapWaterConnection === "नहीं" && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-600 mb-3">
                यदि नहीं, मुख्य पेयजल स्रोत
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {drinkingWaterSources.map((source) => (
                  <label
                    key={source}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                      drinkingWaterSource === source
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="drinkingWaterSource"
                      value={source}
                      checked={drinkingWaterSource === source}
                      onChange={(e) =>
                        setDrinkingWaterSource(e.target.value)
                      }
                      className="w-4 h-4 accent-slate-900"
                    />

                    <span className="text-sm text-slate-800">
                      {source}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            5. बिजली
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            5. घर में बिजली का कनेक्शन है?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="electricityConnection"
              value="हाँ"
              checked={electricityConnection === "हाँ"}
              onChange={setElectricityConnection}
            />

            <RadioOption
              name="electricityConnection"
              value="नहीं"
              checked={electricityConnection === "नहीं"}
              onChange={setElectricityConnection}
            />
          </div>
        </div>

        {/* ===================================================
            6. सौर ऊर्जा
        ==================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            6. क्या परिवार सौर ऊर्जा का उपयोग करता है?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="solarEnergy"
              value="हाँ"
              checked={solarEnergy === "हाँ"}
              onChange={setSolarEnergy}
            />

            <RadioOption
              name="solarEnergy"
              value="नहीं"
              checked={solarEnergy === "नहीं"}
              onChange={setSolarEnergy}
            />
          </div>
        </div>

      </div>
    </div>
  );
});

HouseholdHousingFacilities.displayName =
  "HouseholdHousingFacilities";

export default HouseholdHousingFacilities;