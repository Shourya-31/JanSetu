import React, { useState } from "react";
import { CheckCircle2, Save, Droplets } from "lucide-react";

import WaterForm, {
  type WaterData,
} from "./WaterForm";

interface WaterSectionProps {
  onSave: (waterData: WaterData) => void;
}

const defaultWaterData: WaterData = {
  tapWaterAvailability: "",
  summerWaterCondition: "",
  drinkingQuality: "",
  waterQualityProblem: "",
  otherWaterQualityProblem: "",
  waterDistance: "",
  pipelineRequirement: "",
  waterTankRequirement: "",
};

export default function WaterSection({
  onSave,
}: WaterSectionProps) {
  const [waterData, setWaterData] =
    useState<WaterData>(defaultWaterData);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (
      !waterData.tapWaterAvailability ||
      !waterData.summerWaterCondition ||
      !waterData.drinkingQuality ||
      !waterData.waterQualityProblem ||
      !waterData.waterDistance ||
      !waterData.pipelineRequirement ||
      !waterData.waterTankRequirement
    ) {
      alert(
        "कृपया पेयजल अनुभाग की सभी जानकारी भरें।"
      );
      return;
    }

    if (
      waterData.waterQualityProblem === "अन्य" &&
      !waterData.otherWaterQualityProblem.trim()
    ) {
      alert(
        "कृपया पानी की गुणवत्ता की अन्य समस्या लिखें।"
      );
      return;
    }

    setSaved(true);
    onSave(waterData);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <Droplets className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              खंड 6
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              पेयजल सुविधा
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ग्राम में उपलब्ध पेयजल सुविधा एवं
              संबंधित आवश्यकताओं की जानकारी भरें।
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <WaterForm
          value={waterData}
          onChange={(data) => {
            setWaterData(data);
            setSaved(false);
          }}
        />
      </div>

      {/* Saved status */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          पेयजल अनुभाग की जानकारी सहेजी गई।
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Save className="h-4 w-4" />
          पेयजल अनुभाग सहेजें
        </button>
      </div>
    </div>
  );
}