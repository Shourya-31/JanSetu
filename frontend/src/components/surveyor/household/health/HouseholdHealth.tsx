import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface HouseholdHealthProps {
  houseNumber: number;

  existingData?: {
    familyDisease?: string;
    freeMedicines?: string;
  };

  onBack: () => void;
  onNext: (data: any) => void;
}

const HouseholdHealth: React.FC<HouseholdHealthProps> = ({
  existingData,
  onBack,
  onNext,
}) => {
  const [familyDisease, setFamilyDisease] = useState(
    existingData?.familyDisease ?? ""
  );

  const [freeMedicines, setFreeMedicines] = useState(
    existingData?.freeMedicines ?? ""
  );

  const handleNext = () => {
    onNext({
      familyDisease,
      freeMedicines,
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
          हाउसहोल्ड सर्वे • अनुभाग 9
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          स्वास्थ्य
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          परिवार के स्वास्थ्य एवं स्वास्थ्य सेवाओं से संबंधित जानकारी दर्ज करें।
        </p>
      </div>

      {/* QUESTIONS */}

      <div className="space-y-6">

        {/* QUESTION 1 */}

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

        {/* QUESTION 2 */}

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

export default HouseholdHealth;