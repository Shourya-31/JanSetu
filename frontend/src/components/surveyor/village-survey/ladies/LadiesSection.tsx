import React, { useState } from "react";
import {
  CheckCircle2,
  Save,
  UsersRound,
} from "lucide-react";

import LadiesForm, {
  type LadiesData,
} from "./LadiesForm";

interface LadiesSectionProps {
  onSave: (ladiesData: LadiesData) => void;
}

const defaultData: LadiesData = {
  shgOperated: "",
  totalSHG: "",
  activeSHG: "",
  majorSHGActivities: "",
  shgSupport: "",
  bankingFacility: "",
  nearestBankDistance: "",
  familyBankAccounts: "",
};

export default function LadiesSection({
  onSave,
}: LadiesSectionProps) {
  const [ladiesData, setLadiesData] =
    useState<LadiesData>(defaultData);

  const [saved, setSaved] = useState(false);

 const handleSave = () => {
  // All Ladies / SHG fields are optional
  setSaved(true);
  onSave(ladiesData);
};
  

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-pink-50 p-2">
            <UsersRound className="h-5 w-5 text-pink-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              महिला एवं वित्तीय समावेशन
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              महिला स्वयं सहायता समूह एवं वित्तीय समावेशन
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              महिला स्वयं सहायता समूह एवं ग्राम की
              बैंकिंग सुविधाओं से संबंधित जानकारी भरें।
            </p>
          </div>

        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <LadiesForm
          value={ladiesData}
          onChange={(data) => {
            setLadiesData(data);
            setSaved(false);
          }}
        />
      </div>

      {/* Saved */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          महिला एवं वित्तीय समावेशन की जानकारी सहेजी गई।
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