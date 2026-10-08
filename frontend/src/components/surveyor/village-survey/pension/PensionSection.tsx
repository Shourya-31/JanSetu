import React, { useState } from "react";
import {
  CheckCircle2,
  Save,
  HandCoins,
} from "lucide-react";

import PensionForm, {
  type PensionData,
} from "./PensionForm";

interface PensionSectionProps {
  onSave: (pensionData: PensionData) => void;
}

const defaultData: PensionData = {
  disabledEligible: "",
  disabledNotReceiving: "",

  widowEligible: "",
  widowNotReceiving: "",

  elderlyEligible: "",
  elderlyNotReceiving: "",
};

export default function PensionSection({
  onSave,
}: PensionSectionProps) {
  const [pensionData, setPensionData] =
    useState<PensionData>(defaultData);

  const [saved, setSaved] = useState(false);

  // const handleSave = () => {
  //   if (
  //     !pensionData.disabledEligible ||
  //     !pensionData.disabledNotReceiving ||
  //     !pensionData.widowEligible ||
  //     !pensionData.widowNotReceiving ||
  //     !pensionData.elderlyEligible ||
  //     !pensionData.elderlyNotReceiving
  //   ) {
  //     alert(
  //       "कृपया पेंशन एवं सामाजिक सुरक्षा की सभी जानकारी भरें।"
  //     );
  //     return;
  //   }

  //   setSaved(true);
  //   onSave(pensionData);
  // };

  const handleSave = () => {
  // All pension fields are optional
  setSaved(true);
  onSave(pensionData);
};

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-green-50 p-2">
            <HandCoins className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              खंड 10
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              पेंशन एवं सामाजिक सुरक्षा
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              विभिन्न पेंशन योजनाओं के पात्र लाभार्थियों
              एवं पेंशन प्राप्त करने वालों की जानकारी भरें।
            </p>
          </div>

        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <PensionForm
          value={pensionData}
          onChange={(data) => {
            setPensionData(data);
            setSaved(false);
          }}
        />
      </div>

      {/* Saved */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          पेंशन एवं सामाजिक सुरक्षा की जानकारी सहेजी गई।
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