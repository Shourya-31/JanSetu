import React from "react";

export interface PensionData {
  disabledEligible: string;
  disabledNotReceiving: string;

  widowEligible: string;
  widowNotReceiving: string;

  elderlyEligible: string;
  elderlyNotReceiving: string;
}

interface PensionFormProps {
  value: PensionData;
  onChange: (data: PensionData) => void;
}

const defaultData: PensionData = {
  disabledEligible: "",
  disabledNotReceiving: "",

  widowEligible: "",
  widowNotReceiving: "",

  elderlyEligible: "",
  elderlyNotReceiving: "",
};

export default function PensionForm({
  value,
  onChange,
}: PensionFormProps) {
  const data = {
    ...defaultData,
    ...value,
  };

  const updateField = (
    key: keyof PensionData,
    value: string
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* Q1 */}
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Q1. दिव्यांग पेंशन के लिए कुल पात्र व्यक्तियों की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={data.disabledEligible}
            onChange={(e) =>
              updateField(
                "disabledEligible",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="संख्या"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            इनमें से पेंशन प्राप्त नहीं करने वाले पात्र व्यक्तियों की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={data.disabledNotReceiving}
            onChange={(e) =>
              updateField(
                "disabledNotReceiving",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="संख्या"
          />
        </div>

      </div>

      {/* Q2 */}
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Q2. विधवा पेंशन के लिए कुल पात्र महिलाओं की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={data.widowEligible}
            onChange={(e) =>
              updateField(
                "widowEligible",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="संख्या"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            इनमें से पेंशन प्राप्त नहीं करने वाली पात्र महिलाओं की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={data.widowNotReceiving}
            onChange={(e) =>
              updateField(
                "widowNotReceiving",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="संख्या"
          />
        </div>

      </div>

      {/* Q3 */}
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Q3. वृद्धजन पेंशन (60 वर्ष एवं अधिक) के लिए कुल पात्र व्यक्तियों की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={data.elderlyEligible}
            onChange={(e) =>
              updateField(
                "elderlyEligible",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="संख्या"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            इनमें से पेंशन प्राप्त नहीं करने वाले पात्र व्यक्तियों की संख्या
          </label>

          <input
            type="number"
            min="0"
            value={data.elderlyNotReceiving}
            onChange={(e) =>
              updateField(
                "elderlyNotReceiving",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="संख्या"
          />
        </div>

      </div>

    </div>
  );
}