import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface HouseholdChildrenEducationProps {
  houseNumber: number;
  existingData?: {
    childrenWithoutBirthCertificate?: string;
    vaccinationStatus?: string;
    anganwadiMeal?: string;
    childrenSchoolStatus?: string;
    schoolNotGoingReason?: string[];
    otherSchoolReason?: string;
  };
  onBack: () => void;
  onNext: (data: any) => void;
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdChildrenEducation: React.FC<
  HouseholdChildrenEducationProps
> = ({
  existingData,
  onBack,
  onNext,
}) => {
  const [childrenWithoutBirthCertificate, setChildrenWithoutBirthCertificate] =
    useState(existingData?.childrenWithoutBirthCertificate ?? "");

  const [vaccinationStatus, setVaccinationStatus] = useState(
    existingData?.vaccinationStatus ?? ""
  );

  const [anganwadiMeal, setAnganwadiMeal] = useState(
    existingData?.anganwadiMeal ?? ""
  );

  const [childrenSchoolStatus, setChildrenSchoolStatus] = useState(
    existingData?.childrenSchoolStatus ?? ""
  );

  const [schoolNotGoingReason, setSchoolNotGoingReason] = useState<string[]>(
    existingData?.schoolNotGoingReason ?? []
  );

  const [otherSchoolReason, setOtherSchoolReason] = useState(
    existingData?.otherSchoolReason ?? ""
  );

  const schoolReasons = [
    "दूरी",
    "अध्यापक की कमी",
    "गरीबी",
    "घर के काम/धंधे में सहयोग",
    "अन्य",
  ];

  const toggleSchoolReason = (reason: string) => {
    setSchoolNotGoingReason((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason]
    );
  };

  const handleNext = () => {
    onNext({
      childrenWithoutBirthCertificate,
      vaccinationStatus,
      anganwadiMeal,
      childrenSchoolStatus,
      schoolNotGoingReason,
      otherSchoolReason,
    });
  };

  const RadioOption = ({
    name,
    value,
    checked,
    onChange,
  }: {
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
  }) => {
    return (
      <label
        className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
          checked
            ? "border-slate-900 bg-slate-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
          className="w-4 h-4 accent-slate-900"
        />

        <span className="text-sm text-slate-800">
          {value}
        </span>
      </label>
    );
  };

  return (
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 pb-4">

        <p className="text-[11px] text-slate-500">
          हाउसहोल्ड सर्वे • अनुभाग 6
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          बच्चे, आंगनवाड़ी एवं शिक्षा
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          बच्चों, टीकाकरण, आंगनवाड़ी एवं शिक्षा से संबंधित जानकारी दर्ज करें।
        </p>

      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="space-y-6">

        {/* ===================================================
            1. जन्म प्रमाण-पत्र
        ==================================================== */}

        <div>

          <label className="block text-sm font-bold text-slate-700 mb-2">
            1. परिवार में ऐसे बच्चों की संख्या, जिनके पास जन्म प्रमाण-पत्र नहीं है
          </label>

          <input
            type="number"
            min="0"
            value={childrenWithoutBirthCertificate}
            onChange={(e) =>
              setChildrenWithoutBirthCertificate(e.target.value)
            }
            placeholder="बच्चों की संख्या"
            className={inputClass}
          />

        </div>

        {/* ===================================================
            2. टीकाकरण
        ==================================================== */}

        <div>

          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. 0-5 वर्ष के बच्चों का टीकाकरण हुआ है?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="vaccinationStatus"
              value="सभी"
              checked={vaccinationStatus === "सभी"}
              onChange={setVaccinationStatus}
            />

            <RadioOption
              name="vaccinationStatus"
              value="आंशिक"
              checked={vaccinationStatus === "आंशिक"}
              onChange={setVaccinationStatus}
            />

            <RadioOption
              name="vaccinationStatus"
              value="नहीं"
              checked={vaccinationStatus === "नहीं"}
              onChange={setVaccinationStatus}
            />

            <RadioOption
              name="vaccinationStatus"
              value="लागू नहीं"
              checked={vaccinationStatus === "लागू नहीं"}
              onChange={setVaccinationStatus}
            />

          </div>

        </div>

        {/* ===================================================
            3. आंगनवाड़ी भोजन
        ==================================================== */}

        <div>

          <label className="block text-sm font-bold text-slate-700 mb-3">
            3. 3-5 वर्ष के बच्चों को आंगनवाड़ी में गर्म/पका भोजन मिलता है?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="anganwadiMeal"
              value="हाँ"
              checked={anganwadiMeal === "हाँ"}
              onChange={setAnganwadiMeal}
            />

            <RadioOption
              name="anganwadiMeal"
              value="नहीं"
              checked={anganwadiMeal === "नहीं"}
              onChange={setAnganwadiMeal}
            />

            <RadioOption
              name="anganwadiMeal"
              value="लागू नहीं"
              checked={anganwadiMeal === "लागू नहीं"}
              onChange={setAnganwadiMeal}
            />

          </div>

        </div>

        {/* ===================================================
            4. स्कूल
        ==================================================== */}

        <div>

          <label className="block text-sm font-bold text-slate-700 mb-3">
            4. परिवार के बच्चे स्कूल जाते हैं?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="childrenSchoolStatus"
              value="सभी"
              checked={childrenSchoolStatus === "सभी"}
              onChange={setChildrenSchoolStatus}
            />

            <RadioOption
              name="childrenSchoolStatus"
              value="कुछ"
              checked={childrenSchoolStatus === "कुछ"}
              onChange={setChildrenSchoolStatus}
            />

            <RadioOption
              name="childrenSchoolStatus"
              value="कोई नहीं"
              checked={childrenSchoolStatus === "कोई नहीं"}
              onChange={setChildrenSchoolStatus}
            />

            <RadioOption
              name="childrenSchoolStatus"
              value="लागू नहीं"
              checked={childrenSchoolStatus === "लागू नहीं"}
              onChange={setChildrenSchoolStatus}
            />

          </div>

          {/* =================================================
              SCHOOL NOT GOING REASON
          ================================================== */}

          {(childrenSchoolStatus === "कुछ" ||
            childrenSchoolStatus === "कोई नहीं") && (
            <div className="mt-4">

              <label className="block text-xs font-bold text-slate-600 mb-3">
                यदि नहीं/कुछ नहीं जाते, मुख्य कारण
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {schoolReasons.map((reason) => {

                  const checked =
                    schoolNotGoingReason.includes(reason);

                  return (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                        checked
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleSchoolReason(reason)
                        }
                        className="w-4 h-4 accent-slate-900"
                      />

                      <span className="text-sm text-slate-800">
                        {reason}
                      </span>

                    </label>
                  );
                })}

              </div>

              {/* OTHER REASON */}

              {schoolNotGoingReason.includes("अन्य") && (
                <div className="mt-3">

                  <input
                    type="text"
                    value={otherSchoolReason}
                    onChange={(e) =>
                      setOtherSchoolReason(e.target.value)
                    }
                    placeholder="अन्य कारण लिखें"
                    className={inputClass}
                  />

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
          अनुभाग सूची
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          आगे बढ़ें →
        </button>

      </div>

    </div>
  );
};

export default HouseholdChildrenEducation;