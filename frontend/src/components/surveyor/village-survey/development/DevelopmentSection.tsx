import React, { useState } from "react";
import {
  CheckCircle2,
  Save,
  Building2,
} from "lucide-react";

import DevelopmentForm, {
  type DevelopmentData,
} from "./DevelopmentForm";

interface DevelopmentSectionProps {
  onSave: (
    developmentData: DevelopmentData
  ) => void;
}

const defaultData: DevelopmentData = {
  handpumpRequirement: "",
  borewellRequirement: "",
  solarPumpRequirement: "",
  solarStreetLightRequirement: "",
  roadRequirement: "",
  otherInfrastructureRequirement: "",

  priorityWork1: "",
  priorityWork2: "",
  priorityWork3: "",

  additionalRemarks: "",
};

export default function DevelopmentSection({
  onSave,
}: DevelopmentSectionProps) {
  const [developmentData, setDevelopmentData] =
    useState<DevelopmentData>(defaultData);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (
      !developmentData.handpumpRequirement ||
      !developmentData.borewellRequirement ||
      !developmentData.solarPumpRequirement ||
      !developmentData.solarStreetLightRequirement ||
      !developmentData.roadRequirement ||
      !developmentData.otherInfrastructureRequirement.trim() ||
      !developmentData.priorityWork1.trim() ||
      !developmentData.priorityWork2.trim() ||
      !developmentData.priorityWork3.trim()
    ) {
      alert(
        "कृपया ग्राम की विकास आवश्यकताओं की सभी जानकारी भरें।"
      );
      return;
    }

    setSaved(true);
    onSave(developmentData);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-blue-50 p-2">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              खंड 11
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              ग्राम की विकास आवश्यकताएँ
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ग्राम के लिए आवश्यक विकास कार्य एवं
              आधारभूत सुविधाओं की जानकारी भरें।
            </p>
          </div>

        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <DevelopmentForm
          value={developmentData}
          onChange={(data) => {
            setDevelopmentData(data);
            setSaved(false);
          }}
        />
      </div>

      {/* Saved */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          ग्राम की विकास आवश्यकताओं की जानकारी सहेजी गई।
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
          अनुभाग सहेजें
        </button>
      </div>

    </div>
  );
}