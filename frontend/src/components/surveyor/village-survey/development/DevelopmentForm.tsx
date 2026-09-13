import React from "react";

export interface DevelopmentData {
  handpumpRequirement: string;
  borewellRequirement: string;
  solarPumpRequirement: string;
  solarStreetLightRequirement: string;
  roadRequirement: string;
  otherInfrastructureRequirement: string;

  priorityWork1: string;
  priorityWork2: string;
  priorityWork3: string;

  additionalRemarks: string;
}

interface DevelopmentFormProps {
  value: DevelopmentData;
  onChange: (data: DevelopmentData) => void;
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

export default function DevelopmentForm({
  value,
  onChange,
}: DevelopmentFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof DevelopmentData,
    val: string
  ) => {
    onChange({
      ...data,
      [key]: val,
    });
  };

  return (
    <div className="space-y-6">

      {/* Development Requirements */}
      <div>
        <p className="mb-4 text-sm font-bold text-slate-900">
          ग्राम की विकास आवश्यकताएँ
        </p>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Q1 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              1. नए हैंडपंप की आवश्यकता संख्या
            </label>

            <input
              type="number"
              min="0"
              value={data.handpumpRequirement}
              onChange={(e) =>
                updateField(
                  "handpumpRequirement",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="संख्या"
            />
          </div>

          {/* Q2 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              2. नए बोरवेल/नलकूप की आवश्यकता संख्या
            </label>

            <input
              type="number"
              min="0"
              value={data.borewellRequirement}
              onChange={(e) =>
                updateField(
                  "borewellRequirement",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="संख्या"
            />
          </div>

          {/* Q3 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              3. नए सोलर पंप की आवश्यकता संख्या
            </label>

            <input
              type="number"
              min="0"
              value={data.solarPumpRequirement}
              onChange={(e) =>
                updateField(
                  "solarPumpRequirement",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="संख्या"
            />
          </div>

          {/* Q4 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              4. सोलर स्ट्रीट लाइट की आवश्यकता संख्या
            </label>

            <input
              type="number"
              min="0"
              value={
                data.solarStreetLightRequirement
              }
              onChange={(e) =>
                updateField(
                  "solarStreetLightRequirement",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="संख्या"
            />
          </div>

          {/* Q5 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              5. नई/सुधार योग्य सड़क की आवश्यकता
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={data.roadRequirement}
                onChange={(e) =>
                  updateField(
                    "roadRequirement",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="दूरी"
              />

              <span className="whitespace-nowrap text-sm text-gray-600">
                किमी
              </span>
            </div>
          </div>

          {/* Q6 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              6. अन्य प्रमुख आधारभूत आवश्यकता
            </label>

            <input
              type="text"
              value={
                data.otherInfrastructureRequirement
              }
              onChange={(e) =>
                updateField(
                  "otherInfrastructureRequirement",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="आवश्यकता लिखें"
            />
          </div>

        </div>
      </div>

      {/* Top 3 Priorities */}
      <div>
        <p className="mb-3 text-sm font-bold text-slate-900">
          यदि अगले 5 वर्षों में केवल तीन कार्य तत्काल किए जाएँ,
          तो वे कौन-से होंगे?
        </p>

        <div className="space-y-3">

          <input
            type="text"
            value={data.priorityWork1}
            onChange={(e) =>
              updateField(
                "priorityWork1",
                e.target.value
              )
            }
            placeholder="1. प्राथमिकता वाला कार्य"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <input
            type="text"
            value={data.priorityWork2}
            onChange={(e) =>
              updateField(
                "priorityWork2",
                e.target.value
              )
            }
            placeholder="2. प्राथमिकता वाला कार्य"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <input
            type="text"
            value={data.priorityWork3}
            onChange={(e) =>
              updateField(
                "priorityWork3",
                e.target.value
              )
            }
            placeholder="3. प्राथमिकता वाला कार्य"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

        </div>
      </div>

      {/* Additional Remarks */}
      <div>
        <label className="mb-3 block text-sm font-bold text-slate-900">
          अतिरिक्त टिप्पणी / अन्य महत्वपूर्ण समस्या
        </label>

        <textarea
          rows={5}
          value={data.additionalRemarks}
          onChange={(e) =>
            updateField(
              "additionalRemarks",
              e.target.value
            )
          }
          placeholder="अतिरिक्त टिप्पणी या अन्य महत्वपूर्ण समस्या लिखें..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

    </div>
  );
}