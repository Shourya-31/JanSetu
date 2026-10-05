import React, { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";

import HostelForm, {
  type HostelData,
} from "./HostelForm";

interface HostelSectionProps {
  totalHostels: number;
  onSave: (hostelData: HostelData[]) => void;
}

export default function HostelSection({
  totalHostels,
  onSave,
}: HostelSectionProps) {
  const [hostels, setHostels] = useState<HostelData[]>(
    Array.from({ length: totalHostels }, () => ({
      facilityType: "",
      condition: "",
      washrooms: "",
    }))
  );

  const [completed, setCompleted] = useState<number[]>([]);

  const updateHostel = (
    index: number,
    data: HostelData
  ) => {
    setHostels((prev) => {
      const updated = [...prev];
      updated[index] = data;
      return updated;
    });
  };

  const saveHostel = (index: number) => {
    const hostel = hostels[index];

    if (!hostel.facilityType || !hostel.condition) {
      alert(
        `कृपया आश्रम/छात्रावास ${index + 1} की सभी जानकारी भरें।`
      );
      return;
    }

    setCompleted((prev) =>
      prev.includes(index)
        ? prev
        : [...prev, index]
    );
  };

  const saveSection = () => {
    if (completed.length !== totalHostels) {
      alert(
        "कृपया सभी आश्रम/छात्रावास की जानकारी भरें।"
      );
      return;
    }

    onSave(hostels);
  };

  if (totalHostels <= 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-semibold text-slate-600">
          ग्राम में कोई आश्रम/छात्रावास उपलब्ध नहीं है।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <span className="text-xs font-bold text-blue-700">
          खंड 6
        </span>

        <h3 className="mt-1 text-lg font-bold text-slate-900">
          आश्रम/छात्रावास
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          सामान्य जानकारी में दर्ज संख्या के अनुसार
          प्रत्येक आश्रम/छात्रावास की जानकारी भरें।
        </p>

        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
          <strong>कुल आश्रम/छात्रावास:</strong>{" "}
          {totalHostels}
        </div>
      </div>

      {/* Forms */}
      {Array.from(
        { length: totalHostels },
        (_, index) => (
          <div
            key={index}
            className="relative"
          >
            {completed.includes(index) && (
              <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                सहेजा गया
              </div>
            )}

            <HostelForm
              index={index}
              value={hostels[index]}
              onChange={(data) =>
                updateHostel(index, data)
              }
            />

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => saveHostel(index)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                जानकारी सहेजें
              </button>
            </div>
          </div>
        )
      )}

      {/* Section Save */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={completed.length !== totalHostels}
          onClick={saveSection}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white ${
            completed.length === totalHostels
              ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-400"
          }`}
        >
          <Save className="h-4 w-4" />
          आश्रम/छात्रावास अनुभाग सहेजें
        </button>
      </div>
    </div>
  );
}