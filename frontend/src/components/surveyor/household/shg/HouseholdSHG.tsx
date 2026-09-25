import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface HouseholdSHGProps {
  houseNumber: number;

  existingData?: {
    shgMember?: string;
  };

  onBack: () => void;
  onNext: (data: any) => void;
}

const HouseholdSHG: React.FC<HouseholdSHGProps> = ({
  existingData,
  onBack,
  onNext,
}) => {
  const [shgMember, setShgMember] = useState(
    existingData?.shgMember ?? ""
  );

  const handleNext = () => {
    onNext({
      shgMember,
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

      {/* HEADER */}

      <div className="border-b border-slate-200 pb-4">
        <p className="text-[11px] text-slate-500">
          हाउसहोल्ड सर्वे • अनुभाग 10
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          महिला स्वयं सहायता समूह
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          परिवार की महिलाओं के स्वयं सहायता समूह से संबंधित जानकारी दर्ज करें।
        </p>
      </div>

      {/* QUESTION */}

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

      {/* BUTTONS */}

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

export default HouseholdSHG;