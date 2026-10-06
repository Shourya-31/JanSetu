import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

interface HouseholdSHGProps {
  houseNumber: number;

  existingData?: {
    shgMember?: string;
  };
}

export interface HouseholdSHGRef {
  getData: () => {
    shgMember: string;
  };
}

const HouseholdSHG = forwardRef<
  HouseholdSHGRef,
  HouseholdSHGProps
>(({ existingData }, ref) => {
  const [shgMember, setShgMember] = useState(
    existingData?.shgMember ?? ""
  );

  // Parent HouseholdForm final save ke time
  // current SHG data yahan se collect karega
  useImperativeHandle(ref, () => ({
    getData: () => ({
      shgMember,
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
          QUESTION
      ====================================================== */}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">
          1. परिवार की कोई महिला (दीदी) स्वयं सहायता समूह (SHG) की सदस्य है?
        </label>

        <div className="flex flex-wrap gap-3">
          <RadioOption
            name="shgMember"
            value="हाँ"
            checked={shgMember === "हाँ"}
            onChange={setShgMember}
          />

          <RadioOption
            name="shgMember"
            value="नहीं"
            checked={shgMember === "नहीं"}
            onChange={setShgMember}
          />
        </div>
      </div>

    </div>
  );
});

HouseholdSHG.displayName = "HouseholdSHG";

export default HouseholdSHG;