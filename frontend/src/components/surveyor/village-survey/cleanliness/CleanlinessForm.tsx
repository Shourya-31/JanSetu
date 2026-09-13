import React from "react";

export interface CleanlinessData {
  toiletAvailability: string;
  solidWasteManagement: string;
  drainageSystem: string;
}

interface CleanlinessFormProps {
  value: CleanlinessData;
  onChange: (data: CleanlinessData) => void;
}

const defaultData: CleanlinessData = {
  toiletAvailability: "",
  solidWasteManagement: "",
  drainageSystem: "",
};

const questions = [
  {
    key: "toiletAvailability",
    label: "Q1. घरों में व्यक्तिगत शौचालय की उपलब्धता",
    options: [
      "सभी",
      "अधिकांश",
      "कुछ",
      "नहीं",
    ],
  },
  {
    key: "solidWasteManagement",
    label: "Q2. ठोस अपशिष्ट संग्रह/निपटान व्यवस्था",
    options: [
      "नियमित",
      "कभी-कभी",
      "नहीं",
    ],
  },
  {
    key: "drainageSystem",
    label: "Q3. नाली/जल निकासी व्यवस्था",
    options: [
      "पर्याप्त",
      "आंशिक",
      "नहीं",
    ],
  },
] as const;

export default function CleanlinessForm({
  value,
  onChange,
}: CleanlinessFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof CleanlinessData,
    val: string
  ) => {
    onChange({
      ...data,
      [key]: val,
    });
  };

  return (
    <div className="space-y-6">

      {questions.map((question) => {
        const selected =
          data[
            question.key as keyof CleanlinessData
          ];

        return (
          <div key={question.key}>
            <p className="mb-3 text-sm font-semibold text-gray-800">
              {question.label}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                      name={`cleanliness-${question.key}`}
                      value={option}
                      checked={isSelected}
                      onChange={() =>
                        updateField(
                          question.key as keyof CleanlinessData,
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
          </div>
        );
      })}

    </div>
  );
}