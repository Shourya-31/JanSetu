import React from "react";

export interface WaterData {
  tapWaterAvailability: string;
  summerWaterCondition: string;
  drinkingQuality: string;
  waterQualityProblem: string;
  otherWaterQualityProblem: string;
  waterDistance: string;
  pipelineRequirement: string;
  waterTankRequirement: string;
}

interface WaterFormProps {
  value: WaterData;
  onChange: (data: WaterData) => void;
}

const defaultData: WaterData = {
  tapWaterAvailability: "",
  summerWaterCondition: "",
  drinkingQuality: "",
  waterQualityProblem: "",
  otherWaterQualityProblem: "",
  waterDistance: "",
  pipelineRequirement: "",
  waterTankRequirement: "",
};

const questions = [
  {
    key: "tapWaterAvailability",
    label:
      "Q1. क्या ग्राम में नल-जल योजना के अंतर्गत कार्यशील नल से पेयजल उपलब्ध है?",
    options: ["हाँ", "आंशिक रूप से", "नहीं"],
  },
  {
    key: "summerWaterCondition",
    label: "Q2. गर्मियों में पेयजल की स्थिति:",
    options: [
      "पर्याप्त",
      "कभी-कभी समस्या",
      "गंभीर समस्या",
      "पूर्णतः अनुपलब्ध",
    ],
  },
  {
    key: "drinkingQuality",
    label: "Q3. क्या उपलब्ध पेयजल पीने योग्य है?",
    options: [
      "हाँ",
      "नहीं",
      "जाँच नहीं हुई",
      "जानकारी नहीं",
    ],
  },
  {
    key: "waterQualityProblem",
    label:
      "Q4. क्या पानी की गुणवत्ता से संबंधित कोई समस्या है?",
    options: [
      "नहीं",
      "गंदलापन",
      "दुर्गंध/खराब स्वाद",
      "आयरन",
      "फ्लोराइड",
      "अन्य",
    ],
  },
] as const;

export default function WaterForm({
  value,
  onChange,
}: WaterFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof WaterData,
    val: string
  ) => {
    onChange({
      ...data,
      [key]: val,
    });
  };

  return (
    <div className="space-y-6">

      {/* Q1 - Q4 */}
      {questions.map((question) => {
        const selected =
          data[
            question.key as keyof WaterData
          ];

        return (
          <div key={question.key}>
            <p className="mb-3 text-sm font-semibold text-gray-800">
              {question.label}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {question.options.map((option) => {
                const isSelected =
                  selected === option;

                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`water-${question.key}`}
                      value={option}
                      checked={isSelected}
                      onChange={() =>
                        updateField(
                          question.key as keyof WaterData,
                          option
                        )
                      }
                      className="h-4 w-4 accent-green-600"
                    />

                    <span className="text-sm text-gray-700">
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Q4 - Other */}
            {question.key ===
              "waterQualityProblem" &&
              selected === "अन्य" && (
                <div className="mt-3">
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    अन्य समस्या
                  </label>

                  <input
                    type="text"
                    value={
                      data.otherWaterQualityProblem
                    }
                    onChange={(e) =>
                      updateField(
                        "otherWaterQualityProblem",
                        e.target.value
                      )
                    }
                    placeholder="अन्य पानी की गुणवत्ता संबंधी समस्या लिखें"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              )}
          </div>
        );
      })}

      {/* Q5 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q5. पेयजल लाने के लिए परिवारों को औसतन कितनी दूरी तय करनी पड़ती है?
        </p>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={data.waterDistance}
            onChange={(e) =>
              updateField(
                "waterDistance",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="दूरी दर्ज करें"
          />

          <span className="whitespace-nowrap text-sm text-gray-600">
            मीटर/किमी
          </span>
        </div>
      </div>

      {/* Q6 */}
      <div>
        <p className="mb-4 text-sm font-semibold text-gray-800">
          Q6. नल-जल योजना के अंतर्गत पेयजल व्यवस्था सुधारने हेतु आवश्यकता:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* Pipeline */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              पाइपलाइन विस्तार/मरम्मत
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={
                  data.pipelineRequirement
                }
                onChange={(e) =>
                  updateField(
                    "pipelineRequirement",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="किमी"
              />

              <span className="whitespace-nowrap text-sm text-gray-600">
                किमी
              </span>
            </div>
          </div>

          {/* Water Tank */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              पानी की टंकी
            </label>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={
                  data.waterTankRequirement
                }
                onChange={(e) =>
                  updateField(
                    "waterTankRequirement",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="संख्या"
              />

              <span className="whitespace-nowrap text-sm text-gray-600">
                संख्या
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}