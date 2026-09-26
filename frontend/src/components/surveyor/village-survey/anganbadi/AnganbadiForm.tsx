import React from "react";

export interface AnganbadiData {
  centerName: string;
  buildingAvailability: string;
  buildingCondition: string;
  operation: string;
  nutritionServices: string;
  toiletCondition: string;
  drinkingWater: string;
  watersupply: string;
  electricity: string;
  nutritionGarden: string;
}

interface AnganbadiFormProps {
  index: number;
  value: AnganbadiData;
  onChange: (data: AnganbadiData) => void;
}

const defaultData: AnganbadiData = {
  centerName: "",
  buildingAvailability: "",
  buildingCondition: "",
  operation: "",
  nutritionServices: "",
  toiletCondition: "",
  drinkingWater: "",
  watersupply: "",
  electricity: "",
  nutritionGarden: "",
};

const questions = [
  {
    key: "buildingAvailability",
    label: "1. भवन की उपलब्धता",
    options: [
      "भवन युक्त",
      "भवन विहीन",
      "भवन स्वीकृत",
      "भवन निर्माणाधीन",
    ],
  },
  {
    key: "buildingCondition",
    label: "2. भवन की स्थिति",
    options: ["अच्छी", "जर्जर", "नवीन निर्माण योग्य"],
  },
  {
    key: "operation",
    label: "3. केंद्र का संचालन",
    options: ["हाँ, नियमित", "कभी-कभी", "नहीं"],
  },
  {
    key: "nutritionServices",
    label: "4. पोषण आहार एवं अन्य सेवाएँ",
    options: ["हाँ, नियमित", "कभी-कभी", "नहीं"],
  },
  {
    key: "toiletCondition",
    label: "5. शौचालय की स्थिति",
    options: [
      "है एवं उपयोग योग्य",
      "है लेकिन उपयोग योग्य नहीं",
      "नहीं है",
    ],
  },
  {
    key: "drinkingWater",
    label: "6. पेयजल सुविधा",
    options: ["हाँ", "नहीं"],
  },
  {
    key: "electricity",
    label: "7. विद्युत सुविधा",
    options: ["हाँ", "नहीं"],
  },
  {
    key: "nutritionGarden",
    label: "8. पोषण वाटिका",
    options: ["हाँ", "नहीं"],
  },
  {
    key: "watersupply",
    label: "9. क्या आंगनबाड़ी केंद्र में चालू जलापूर्ति की सुविधा उपलब्ध है?",
    options: ["हाँ", "नहीं"],
  },
] as const;

export default function AnganbadiForm({
  index,
  value,
  onChange,
}: AnganbadiFormProps) {
  const data = { ...defaultData, ...value };

  const updateField = (key: keyof AnganbadiData, val: string) => {
    onChange({
      ...data,
      [key]: val,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
          {index + 1}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800">
            आंगनबाड़ी केंद्र {index + 1}
          </h3>
          <p className="text-sm text-gray-500">
            आंगनबाड़ी केंद्र की जानकारी भरें
          </p>
        </div>
      </div>

      {/* Center Name */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          आंगनबाड़ी केंद्र का नाम / क्रमांक
        </label>

        <input
          type="text"
          value={data.centerName}
          onChange={(e) => updateField("centerName", e.target.value)}
          placeholder="केंद्र का नाम / क्रमांक दर्ज करें"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.key}>
            <p className="mb-3 text-sm font-semibold text-gray-800">
              {question.label}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {question.options.map((option) => {
                const selected =
                  data[question.key as keyof AnganbadiData] === option;

                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      selected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    {/* Checkbox-style single selection */}
                    <input
                      type="radio"
                      name={`anganbadi-${index}-${question.key}`}
                      value={option}
                      checked={selected}
                      onChange={() =>
                        updateField(
                          question.key as keyof AnganbadiData,
                          option
                        )
                      }
                      className="h-4 w-4 accent-green-600"
                    />

                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}