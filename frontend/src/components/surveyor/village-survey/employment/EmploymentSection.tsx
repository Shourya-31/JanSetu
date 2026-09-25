import React, { useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Save,
} from "lucide-react";

import EmploymentForm, {
  type EmploymentData,
} from "./EmploymentForm";

interface EmploymentSectionProps {
  onSave: (
    employmentData: EmploymentData
  ) => void;
}

const defaultData: EmploymentData = {
  unemployedYouth: "",
  livelihoodActivities: [],
  migration: "",
  migrantPersons: "",
  migrationDestination: "",
  migrationReason: "",
  migrationDuration: "",
  nearestITICollegeDistance: "",
  skillTraining: "",
  majorTraining: "",
  employmentAfterTraining: "",
  requiredTraining1: "",
  requiredTraining2: "",
};

export default function EmploymentSection({
  onSave,
}: EmploymentSectionProps) {
  const [employmentData, setEmploymentData] =
    useState<EmploymentData>(defaultData);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (
      !employmentData.unemployedYouth ||
      employmentData.livelihoodActivities.length ===
        0 ||
      !employmentData.migration ||
      !employmentData.nearestITICollegeDistance ||
      !employmentData.skillTraining ||
      !employmentData.employmentAfterTraining ||
      !employmentData.requiredTraining1 ||
      !employmentData.requiredTraining2
    ) {
      alert(
        "कृपया रोजगार एवं आजीविका अनुभाग की सभी जानकारी भरें।"
      );
      return;
    }

    if (
      employmentData.migration !== "नहीं" &&
      !employmentData.migrantPersons
    ) {
      alert(
        "कृपया अनुमानित प्रवासी व्यक्तियों की संख्या भरें।"
      );
      return;
    }

    if (
      employmentData.skillTraining === "हाँ" &&
      !employmentData.majorTraining
    ) {
      alert(
        "कृपया प्रमुख प्रशिक्षण की जानकारी भरें।"
      );
      return;
    }

    setSaved(true);
    onSave(employmentData);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              खंड 7
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              रोजगार, आजीविका, पलायन एवं कौशल विकास
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ग्राम में रोजगार, आजीविका, पलायन एवं
              कौशल विकास से संबंधित जानकारी भरें।
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <EmploymentForm
          value={employmentData}
          onChange={(data) => {
            setEmploymentData(data);
            setSaved(false);
          }}
        />
      </div>

      {/* Saved */}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          रोजगार एवं आजीविका अनुभाग की जानकारी सहेजी गई।
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