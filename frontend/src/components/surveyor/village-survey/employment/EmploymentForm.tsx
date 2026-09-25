import React from "react";

export interface EmploymentData {
  unemployedYouth: string;

  livelihoodActivities: string[];

  migration: string;
  migrantPersons: string;

  migrationDestination: string;
  migrationReason: string;
  migrationDuration: string;

  nearestITICollegeDistance: string;

  skillTraining: string;
  majorTraining: string;

  employmentAfterTraining: string;

  requiredTraining1: string;
  requiredTraining2: string;
}

interface EmploymentFormProps {
  value: EmploymentData;
  onChange: (data: EmploymentData) => void;
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

const livelihoodOptions = [
  "कृषि",
  "कृषि मजदूरी",
  "पशुपालन",
  "पोषण",
  "सरकारी नौकरी",
  "निजी नौकरी",
  "स्वरोजगार/व्यवसाय",
  "अन्य",
];

const migrationReasonOptions = [
  "रोजगार",
  "अधिक मजदूरी",
  "शिक्षा",
  "अन्य",
];

export default function EmploymentForm({
  value,
  onChange,
}: EmploymentFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof EmploymentData,
    val: string
  ) => {
    onChange({
      ...data,
      [key]: val,
    });
  };

  const toggleLivelihood = (
    option: string
  ) => {
    const exists =
      data.livelihoodActivities.includes(option);

    const updated = exists
      ? data.livelihoodActivities.filter(
          (item) => item !== option
        )
      : [
          ...data.livelihoodActivities,
          option,
        ];

    onChange({
      ...data,
      livelihoodActivities: updated,
    });
  };

  return (
    <div className="space-y-6">

      {/* Q1 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Q1. ग्राम में बेरोजगार युवाओं (18–45 वर्ष) की संख्या:
        </label>

        <input
          type="number"
          min="0"
          value={data.unemployedYouth}
          onChange={(e) =>
            updateField(
              "unemployedYouth",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Q2 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q2. ग्राम के परिवारों की प्रमुख आजीविका/आर्थिक गतिविधियाँ:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {livelihoodOptions.map((option) => {
            const selected =
              data.livelihoodActivities.includes(
                option
              );

            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  selected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    toggleLivelihood(option)
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

      {/* Q3 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q3. क्या ग्राम के लोग रोजगार के लिए बाहर पलायन करते हैं?
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "नहीं",
            "हाँ, मौसमी",
            "हाँ, स्थायी",
            "दोनों",
          ].map((option) => {
            const selected =
              data.migration === option;

            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                  selected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="migration"
                  checked={selected}
                  onChange={() =>
                    updateField(
                      "migration",
                      option
                    )
                  }
                  className="h-4 w-4 accent-green-600"
                />

                <span className="text-sm">
                  {option}
                </span>
              </label>
            );
          })}
        </div>

        {data.migration &&
          data.migration !== "नहीं" && (
            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                अनुमानित प्रवासी व्यक्तियों की संख्या
              </label>

              <input
                type="number"
                min="0"
                value={data.migrantPersons}
                onChange={(e) =>
                  updateField(
                    "migrantPersons",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
              />
            </div>
          )}
      </div>

      {/* Q4 */}
      <div>
        <p className="mb-4 text-sm font-semibold text-gray-800">
          Q4. पलायन संबंधी विवरण:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              प्रमुख गंतव्य
            </label>

            <input
              type="text"
              value={data.migrationDestination}
              onChange={(e) =>
                updateField(
                  "migrationDestination",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              मुख्य कारण
            </label>

            <div className="flex flex-wrap gap-2">
              {migrationReasonOptions.map(
                (option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      data.migrationReason ===
                      option
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="migrationReason"
                      checked={
                        data.migrationReason ===
                        option
                      }
                      onChange={() =>
                        updateField(
                          "migrationReason",
                          option
                        )
                      }
                      className="h-4 w-4 accent-green-600"
                    />

                    {option}
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              बाहर रहने की औसत अवधि
            </label>

            <input
              type="text"
              value={data.migrationDuration}
              onChange={(e) =>
                updateField(
                  "migrationDuration",
                  e.target.value
                )
              }
              placeholder="महीने/वर्ष"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Q5 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Q5. निकटतम ITI/पॉलिटेक्निक/महाविद्यालय की दूरी:
        </label>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={
              data.nearestITICollegeDistance
            }
            onChange={(e) =>
              updateField(
                "nearestITICollegeDistance",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />

          <span className="text-sm text-gray-600">
            किमी
          </span>
        </div>
      </div>

      {/* Q6 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q6. क्या ग्राम के युवाओं ने पिछले तीन वर्षों में कौशल प्रशिक्षण प्राप्त किया है?
        </p>

        <div className="flex gap-3">
          {["हाँ", "नहीं"].map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 ${
                data.skillTraining === option
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="skillTraining"
                checked={
                  data.skillTraining === option
                }
                onChange={() =>
                  updateField(
                    "skillTraining",
                    option
                  )
                }
                className="h-4 w-4 accent-green-600"
              />

              {option}
            </label>
          ))}
        </div>

        {data.skillTraining === "हाँ" && (
          <input
            type="text"
            value={data.majorTraining}
            onChange={(e) =>
              updateField(
                "majorTraining",
                e.target.value
              )
            }
            placeholder="प्रमुख प्रशिक्षण"
            className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        )}
      </div>

      {/* Q7 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q7. क्या प्रशिक्षण के बाद रोजगार/स्वरोजगार प्राप्त हुआ?
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            "हाँ",
            "आंशिक रूप से",
            "नहीं",
          ].map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 ${
                data.employmentAfterTraining ===
                option
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="employmentAfterTraining"
                checked={
                  data.employmentAfterTraining ===
                  option
                }
                onChange={() =>
                  updateField(
                    "employmentAfterTraining",
                    option
                  )
                }
                className="h-4 w-4 accent-green-600"
              />

              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Q8 */}
      <div>
        <p className="mb-4 text-sm font-semibold text-gray-800">
          Q8. कौशल एवं आजीविका हेतु आवश्यक अधिकतम दो प्रशिक्षण कार्यक्रम:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={data.requiredTraining1}
            onChange={(e) =>
              updateField(
                "requiredTraining1",
                e.target.value
              )
            }
            placeholder="1. प्रशिक्षण कार्यक्रम"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />

          <input
            type="text"
            value={data.requiredTraining2}
            onChange={(e) =>
              updateField(
                "requiredTraining2",
                e.target.value
              )
            }
            placeholder="2. प्रशिक्षण कार्यक्रम"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>
      </div>

    </div>
  );
}