import React, { useEffect, useState } from "react";
import AnganbadiForm from "./AnganbadiForm.tsx";
import type { AnganbadiData } from "./AnganbadiForm.tsx";

interface AnganbadiSectionProps {
  totalAnganwadi: number;
  onSave?: (data: AnganbadiData[]) => void;
}

const emptyAnganbadi = (): AnganbadiData => ({
  centerName: "",
  buildingAvailability: "",
  buildingCondition: "",
  operation: "",
  nutritionServices: "",
  toiletCondition: "",
  drinkingWater: "",
  electricity: "",
  nutritionGarden: "",
});

export default function AnganbadiSection({
  totalAnganwadi,
  onSave,
}: AnganbadiSectionProps) {
  const [centers, setCenters] = useState<AnganbadiData[]>([]);

  /*
   * totalAnganwadi के हिसाब से forms बनेंगे.
   *
   * उदाहरण:
   * totalAnganwadi = 3
   * => Center 1
   * => Center 2
   * => Center 3
   */
  useEffect(() => {
    const count = Math.max(0, Number(totalAnganwadi) || 0);

    setCenters((previous) =>
      Array.from({ length: count }, (_, index) => {
        return previous[index] || emptyAnganbadi();
      })
    );
  }, [totalAnganwadi]);

  const updateCenter = (
    index: number,
    data: AnganbadiData
  ) => {
    setCenters((previous) =>
      previous.map((center, i) =>
        i === index ? data : center
      )
    );
  };

  const handleSave = () => {
    onSave?.(centers);
  };

  // अगर General Information में 0 आंगनबाड़ी है
  if (totalAnganwadi <= 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="font-semibold text-gray-700">
          इस ग्राम में कोई आंगनबाड़ी केंद्र उपलब्ध नहीं है।
        </p>

        <p className="mt-1 text-sm text-gray-500">
          सामान्य जानकारी में आंगनबाड़ी केंद्रों की संख्या 0 दर्ज की गई है।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
        <h2 className="text-xl font-bold text-green-800">
          आंगनबाड़ी
        </h2>

        <p className="mt-1 text-sm text-green-700">
          कुल {totalAnganwadi} आंगनबाड़ी केंद्रों की जानकारी भरें।
        </p>
      </div>

      {/* Dynamic Forms */}
      <div className="space-y-6">
        {centers.map((center, index) => (
          <AnganbadiForm
            key={index}
            index={index}
            value={center}
            onChange={(data) =>
              updateCenter(index, data)
            }
          />
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          आंगनबाड़ी जानकारी सुरक्षित करें
        </button>
      </div>
    </div>
  );
}