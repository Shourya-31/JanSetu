import React, { useState } from "react";
import { School, CheckCircle2 } from "lucide-react";
import SchoolForm from "./SchoolForm";

interface SchoolSectionProps {
  totalSchools: number;
  onSave: (schoolData: Record<string, string>[]) => void;
}

export default function SchoolSection({
  totalSchools,
  onSave,
}: SchoolSectionProps) {
  const [savedSchools, setSavedSchools] = useState<
    Record<string, string>[]
  >([]);

  const handleSchoolSave = (
    schoolData: Record<string, string>
  ) => {
    setSavedSchools((prev) => {
      const updated = [...prev];

      const index = updated.findIndex(
        (school) =>
          school.schoolNumber === schoolData.schoolNumber
      );

      if (index >= 0) {
        updated[index] = schoolData;
      } else {
        updated.push(schoolData);
      }

      return updated;
    });
  };

  const handleSaveAll = () => {
    onSave(savedSchools);
  };

  if (totalSchools <= 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <School className="w-8 h-8 mx-auto text-slate-400" />

        <p className="mt-2 text-sm font-semibold text-slate-600">
          ग्राम में कोई विद्यालय उपलब्ध नहीं है।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <School className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <div className="text-xs font-bold text-blue-700">
              खंड 3
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              विद्यालय एवं शिक्षा
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              ग्राम में उपलब्ध कुल {totalSchools} विद्यालयों की
              जानकारी दर्ज करें।
            </p>
          </div>
        </div>
      </div>

      {/* School Forms */}
      {Array.from({ length: totalSchools }, (_, index) => {
        const schoolNumber = index + 1;

        const isSaved = savedSchools.some(
          (school) =>
            school.schoolNumber === String(schoolNumber)
        );

        return (
          <div key={schoolNumber} className="relative">
            {isSaved && (
              <div className="absolute right-4 top-4 z-10 flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-4 h-4" />
                सहेजा गया
              </div>
            )}

            <SchoolForm
              schoolNumber={schoolNumber}
              onSave={handleSchoolSave}
            />
          </div>
        );
      })}

      {/* Save Section */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
        >
          विद्यालय अनुभाग सहेजें
        </button>
      </div>
    </div>
  );
}