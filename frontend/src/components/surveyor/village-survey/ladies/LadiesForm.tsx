import React from "react";

export interface LadiesData {
  shgOperated: string;
  totalSHG: string;
  activeSHG: string;
  majorSHGActivities: string;
  shgSupport: string;
  bankingFacility: string;
  nearestBankDistance: string;
  familyBankAccounts: string;
}

interface LadiesFormProps {
  value: LadiesData;
  onChange: (data: LadiesData) => void;
}

const defaultData: LadiesData = {
  shgOperated: "",
  totalSHG: "",
  activeSHG: "",
  majorSHGActivities: "",
  shgSupport: "",
  bankingFacility: "",
  nearestBankDistance: "",
  familyBankAccounts: "",
};

export default function LadiesForm({
  value,
  onChange,
}: LadiesFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof LadiesData,
    val: string
  ) => {
    onChange({
      ...data,
      [key]: val,
    });
  };

  const optionClass = (selected: boolean) =>
    `flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
      selected
        ? "border-green-500 bg-green-50"
        : "border-gray-200 bg-white hover:border-green-300"
    }`;

  return (
    <div className="space-y-6">

      {/* Q1 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q1. क्या ग्राम में महिला स्वयं सहायता समूह (SHG) संचालित है?
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {["हाँ", "नहीं"].map((option) => (
            <label
              key={option}
              className={optionClass(
                data.shgOperated === option
              )}
            >
              <input
                type="radio"
                name="shgOperated"
                value={option}
                checked={
                  data.shgOperated === option
                }
                onChange={() =>
                  updateField(
                    "shgOperated",
                    option
                  )
                }
                className="h-4 w-4 accent-green-600"
              />

              <span className="text-sm text-gray-700">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Q2 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Q2. कुल SHG संख्या
        </label>

        <input
          type="number"
          min="0"
          value={data.totalSHG}
          onChange={(e) =>
            updateField(
              "totalSHG",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          placeholder="कुल SHG संख्या"
        />
      </div>

      {/* Q3 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Q3. सक्रिय SHG संख्या
        </label>

        <input
          type="number"
          min="0"
          value={data.activeSHG}
          onChange={(e) =>
            updateField(
              "activeSHG",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          placeholder="सक्रिय SHG संख्या"
        />
      </div>

      {/* Q4 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Q4. प्रमुख SHG गतिविधियाँ
        </label>

        <input
          type="text"
          value={data.majorSHGActivities}
          onChange={(e) =>
            updateField(
              "majorSHGActivities",
              e.target.value
            )
          }
          placeholder="प्रमुख SHG गतिविधियाँ लिखें"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Q5 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q5. क्या SHG को बैंक ऋण/सरकारी सहायता मिली है?
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "हाँ",
            "नहीं",
            "जानकारी नहीं",
          ].map((option) => (
            <label
              key={option}
              className={optionClass(
                data.shgSupport === option
              )}
            >
              <input
                type="radio"
                name="shgSupport"
                value={option}
                checked={
                  data.shgSupport === option
                }
                onChange={() =>
                  updateField(
                    "shgSupport",
                    option
                  )
                }
                className="h-4 w-4 accent-green-600"
              />

              <span className="text-sm text-gray-700">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q6. ग्राम में बैंकिंग सुविधा
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "बैंक शाखा",
            "बैंक मित्र/BC",
            "दोनों",
            "नहीं",
          ].map((option) => (
            <label
              key={option}
              className={optionClass(
                data.bankingFacility === option
              )}
            >
              <input
                type="radio"
                name="bankingFacility"
                value={option}
                checked={
                  data.bankingFacility === option
                }
                onChange={() =>
                  updateField(
                    "bankingFacility",
                    option
                  )
                }
                className="h-4 w-4 accent-green-600"
              />

              <span className="text-sm text-gray-700">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Q7 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Q7. निकटतम बैंक/BC की दूरी
        </label>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={data.nearestBankDistance}
            onChange={(e) =>
              updateField(
                "nearestBankDistance",
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

      {/* Q8 */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-800">
          Q8. क्या अधिकांश परिवारों के बैंक खाते हैं?
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "हाँ",
            "नहीं",
            "जानकारी नहीं",
          ].map((option) => (
            <label
              key={option}
              className={optionClass(
                data.familyBankAccounts === option
              )}
            >
              <input
                type="radio"
                name="familyBankAccounts"
                value={option}
                checked={
                  data.familyBankAccounts ===
                  option
                }
                onChange={() =>
                  updateField(
                    "familyBankAccounts",
                    option
                  )
                }
                className="h-4 w-4 accent-green-600"
              />

              <span className="text-sm text-gray-700">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}