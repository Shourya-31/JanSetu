import React from "react";

export interface HostelData {
  facilityType: string;
  condition: string;
  washrooms: string;
}

interface HostelFormProps {
  index: number;
  value: HostelData;
  onChange: (data: HostelData) => void;
}

const defaultData: HostelData = {
  facilityType: "",
  condition: "",
  washrooms: "",
};

const questions = [
  {
    key: "facilityType",
    label: "Q1. ग्राम में उपलब्ध आश्रम/छात्रावास की सुविधा",
    options: [
      "आश्रम",
      "प्री-मैट्रिक छात्रावास",
      "पोस्ट-मैट्रिक छात्रावास",
    ],
  },
  {
    key: "condition",
    label: "Q2. ग्राम में उपलब्ध आश्रम/छात्रावास की स्थिति क्या है?",
    options: ["अच्छी", "जर्जर", "नवीन निर्माण योग्य"],
  },
  {
    key: "washrooms",
    label: "Q3: छात्रावास में शौचालय की स्थिति:",
    options: [
      "है एवं उपयोग योग्य", 
      "है लेकिन उपयोग योग्य नहीं", 
      "नहीं है"
    ],
  },
] as const;

export default function HostelForm({
  index,
  value,
  onChange,
}: HostelFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof HostelData,
    val: string
  ) => {
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
            आश्रम/छात्रावास {index + 1}
          </h3>

          <p className="text-sm text-gray-500">
            आश्रम/छात्रावास की जानकारी भरें
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => {
          const selected =
            data[question.key as keyof HostelData];

          return (
            <div key={question.key}>
              <p className="mb-3 text-sm font-semibold text-gray-800">
                {question.label}
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {question.options.map((option) => {
                  const isSelected = selected === option;

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
                        name={`hostel-${index}-${question.key}`}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          updateField(
                            question.key as keyof HostelData,
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
    </div>
  );
}