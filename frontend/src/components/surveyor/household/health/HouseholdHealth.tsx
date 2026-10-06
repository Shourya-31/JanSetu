import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface HouseholdHealthRef {
  getData: () => {
    familyDisease: string;
    freeMedicines: string;
  };
}

interface HouseholdHealthProps {
  houseNumber: number;

  existingData?: {
    familyDisease?: string;
    freeMedicines?: string;
  };
}

const HouseholdHealth = forwardRef<
  HouseholdHealthRef,
  HouseholdHealthProps
>(({ existingData }, ref) => {
  const [familyDisease, setFamilyDisease] = useState(
    existingData?.familyDisease ?? ""
  );

  const [freeMedicines, setFreeMedicines] = useState(
    existingData?.freeMedicines ?? ""
  );

  // Parent HouseholdForm के "सर्वे पूर्ण करें" पर
  // current data प्राप्त करेगा
  useImperativeHandle(ref, () => ({
    getData: () => ({
      familyDisease,
      freeMedicines,
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

        {/* प्रश्न 1 */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. परिवार का कोई सदस्य खाँसी/दमा/TB आदि रोग से ग्रसित है?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="familyDisease"
              value="हाँ"
              checked={familyDisease === "हाँ"}
              onChange={setFamilyDisease}
            />

            <RadioOption
              name="familyDisease"
              value="नहीं"
              checked={familyDisease === "नहीं"}
              onChange={setFamilyDisease}
            />
          </div>
        </div>

        {/* प्रश्न 2 */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. गाँव के पास अस्पताल/स्वास्थ्य केंद्र से निःशुल्क दवाइयाँ मिलती हैं?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="freeMedicines"
              value="हाँ"
              checked={freeMedicines === "हाँ"}
              onChange={setFreeMedicines}
            />

            <RadioOption
              name="freeMedicines"
              value="कभी-कभी"
              checked={freeMedicines === "कभी-कभी"}
              onChange={setFreeMedicines}
            />

            <RadioOption
              name="freeMedicines"
              value="नहीं"
              checked={freeMedicines === "नहीं"}
              onChange={setFreeMedicines}
            />
          </div>
        </div>

      </div>
    </div>
  );
});

HouseholdHealth.displayName = "HouseholdHealth";

export default HouseholdHealth;