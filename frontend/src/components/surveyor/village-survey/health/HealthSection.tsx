import React, { useState } from "react";
import {
  CheckCircle2,
  HeartPulse,
  Save,
} from "lucide-react";

import HealthForm, {
  type HealthData,
} from "./HealthForm";

interface HealthSectionProps {
  totalHealthFacilities: number;
  onSave: (healthData: HealthData[]) => void;
}

export default function HealthSection({
  totalHealthFacilities,
  onSave,
}: HealthSectionProps) {
  const [healthFacilities, setHealthFacilities] =
    useState<HealthData[]>(
      Array.from(
        { length: totalHealthFacilities },
        () => ({
          healthCenterType: "",
          regularOperation: "",
          medicinesEquipment: "",
          medicalStaff: "",
          majorShortcoming: "",
        })
      )
    );

  const [completed, setCompleted] = useState<
    number[]
  >([]);

  const updateHealth = (
    index: number,
    data: HealthData
  ) => {
    setHealthFacilities((prev) => {
      const updated = [...prev];
      updated[index] = data;
      return updated;
    });
  };

  // const saveHealth = (index: number) => {
  //   const health = healthFacilities[index];

  //   if (
  //     !health.healthCenterType ||
  //     !health.regularOperation ||
  //     !health.medicinesEquipment ||
  //     !health.medicalStaff ||
  //     !health.majorShortcoming.trim()
  //   ) {
  //     alert(
  //       `कृपया स्वास्थ्य केंद्र ${
  //         index + 1
  //       } की सभी जानकारी भरें।`
  //     );
  //     return;
  //   }

  //   setCompleted((prev) =>
  //     prev.includes(index)
  //       ? prev
  //       : [...prev, index]
  //   );
  // };

  const saveHealth = (index: number) => {
  // All health center fields are optional
  setCompleted((prev) =>
    prev.includes(index)
      ? prev
      : [...prev, index]
  );
};

  // const saveSection = () => {
  //   if (
  //     completed.length !==
  //     totalHealthFacilities
  //   ) {
  //     alert(
  //       "कृपया सभी स्वास्थ्य केंद्रों की जानकारी भरें।"
  //     );
  //     return;
  //   }

  //   onSave(healthFacilities);
  // };

const saveSection = () => {
  // Allow saving regardless of individual health center completion
  onSave(healthFacilities);
};  

  if (totalHealthFacilities <= 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <HeartPulse className="mx-auto h-8 w-8 text-slate-400" />

        <p className="mt-2 text-sm font-semibold text-slate-600">
          ग्राम में कोई स्वास्थ्य केंद्र उपलब्ध
          नहीं है।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-50 p-2">
            <HeartPulse className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-700">
              खंड 5
            </span>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              स्वास्थ्य एवं पोषण
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ग्राम में उपलब्ध स्वास्थ्य केंद्रों
              से संबंधित जानकारी भरें।
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900">
          <strong>
            कुल स्वास्थ्य केंद्र:
          </strong>{" "}
          {totalHealthFacilities}
        </div>
      </div>

      {/* Health Forms */}
      {Array.from(
        { length: totalHealthFacilities },
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

            <HealthForm
              index={index}
              value={healthFacilities[index]}
              onChange={(data) =>
                updateHealth(index, data)
              }
            />

            {/* Individual Save */}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  saveHealth(index)
                }
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
          disabled={
            completed.length !==
            totalHealthFacilities
          }
          onClick={saveSection}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white ${
            completed.length ===
            totalHealthFacilities
              ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-400"
          }`}
        >
          <Save className="h-4 w-4" />
          स्वास्थ्य अनुभाग सहेजें
        </button>
      </div>
    </div>
  );
}