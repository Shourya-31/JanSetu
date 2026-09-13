import React, { useState } from "react";
import {
  CheckCircle2,
  Save,
  Trash2,
} from "lucide-react";

import CleanlinessForm, {
  type CleanlinessData,
} from "./CleanlinessForm";

interface CleanlinessSectionProps {
  onSave: (
    cleanlinessData: CleanlinessData
  ) => void;
}

const defaultData: CleanlinessData = {
  toiletAvailability: "",
  solidWasteManagement: "",
  drainageSystem: "",
};

export default function CleanlinessSection({
  onSave,
}: CleanlinessSectionProps) {
  const [cleanlinessData, setCleanlinessData] =
    useState<CleanlinessData>(defaultData);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!cleanlinessData.toiletAvailability) {
      alert(
        "कृपया व्यक्तिगत शौचालय की उपलब्धता की जानकारी भरें।"
      );
      return;
    }

    if (!cleanlinessData.solidWasteManagement) {
      alert(
        "कृपया ठोस अपशिष्ट संग्रह/निपटान व्यवस्था की जानकारी भरें।"
      );
      return;
    }

    if (!cleanlinessData.drainageSystem) {
      alert(
        "कृपया नाली/जल निकासी व्यवस्था की जानकारी भरें।"
      );
      return;
    }

    setSaved(true);
    onSave(cleanlinessData);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-green-50 p-2">
            <Trash2 className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              खंड 9
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              स्वच्छता एवं अपशिष्ट प्रबंधन
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ग्राम की स्वच्छता, शौचालय एवं अपशिष्ट
              प्रबंधन से संबंधित जानकारी भरें।
            </p>
          </div>

        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <CleanlinessForm
          value={cleanlinessData}
          onChange={(data) => {
            setCleanlinessData(data);
            setSaved(false);
          }}
        />
      </div>

      {/* Saved */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          स्वच्छता अनुभाग की जानकारी सहेजी गई।
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