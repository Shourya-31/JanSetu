import React from "react";

export interface HealthData {
  healthCenterType: string;
  regularOperation: string;
  medicinesEquipment: string;
  medicalStaff: string;
  majorShortcoming: string;
}

interface HealthFormProps {
  index: number;
  value: HealthData;
  onChange: (data: HealthData) => void;
}

const defaultData: HealthData = {
  healthCenterType: "",
  regularOperation: "",
  medicinesEquipment: "",
  medicalStaff: "",
  majorShortcoming: "",
};

const questions = [
  {
    key: "healthCenterType",
    label: "Q1. स्वास्थ्य केंद्र का प्रकार",
    options: [
      "उप-स्वास्थ्य केंद्र",
      "प्राथमिक स्वास्थ्य केंद्र",
      "सामुदायिक स्वास्थ्य केंद्र",
      "नहीं है",
    ],
  },
  {
    key: "regularOperation",
    label: "Q2. नियमित संचालन",
    options: [
      "हाँ, नियमित",
      "कभी-कभी बंद",
      "अक्सर बंद",
      "हमेशा बंद",
    ],
  },
  {
    key: "medicinesEquipment",
    label: "Q3. दवाइयाँ एवं उपकरण",
    options: [
      "हाँ, पर्याप्त",
      "आंशिक",
      "उपलब्ध नहीं",
      "जानकारी नहीं",
    ],
  },
  {
    key: "medicalStaff",
    label: "Q4. चिकित्सा कर्मचारी",
    options: [
      "हाँ, नियमित",
      "कभी-कभी",
      "नहीं",
    ],
  },
] as const;

export default function HealthForm({
  index,
  value,
  onChange,
}: HealthFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof HealthData,
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
            स्वास्थ्य केंद्र {index + 1}
          </h3>

          <p className="text-sm text-gray-500">
            स्वास्थ्य केंद्र की जानकारी भरें
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Q1-Q4 */}
        {questions.map((question) => {
          const selected =
            data[
              question.key as keyof HealthData
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
                        name={`health-${index}-${question.key}`}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          updateField(
                            question.key as keyof HealthData,
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

        {/* Q5 */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-800">
            Q5. स्वास्थ्य केंद्र की प्रमुख कमी
          </p>

          <textarea
            rows={4}
            value={data.majorShortcoming}
            onChange={(e) =>
              updateField(
                "majorShortcoming",
                e.target.value
              )
            }
            placeholder="स्वास्थ्य केंद्र की प्रमुख कमी लिखें..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>

      </div>
    </div>
  );
}