import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface HouseholdDocumentsSchemesProps {
  houseNumber: number;
  existingData?: {
    rationCard?: string;
    noAadhaarMembers?: string;
    aadhaarEkyc?: string;
    noCasteCertificateMembers?: string;
    noAyushmanMembers?: string;
    noVoterIdMembers?: string;
    mnregaJobCard?: string;
    noShramikCardMembers?: string;
    janDhanAccount?: string;
    kcc?: string;
    forestRightsPatta?: string;
  };
  onBack: () => void;
  onNext: (data: any) => void;
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdDocumentsSchemes: React.FC<
  HouseholdDocumentsSchemesProps
> = ({
  houseNumber,
  existingData,
  onBack,
  onNext,
}) => {
  const [rationCard, setRationCard] = useState(
    existingData?.rationCard ?? ""
  );

  const [noAadhaarMembers, setNoAadhaarMembers] = useState(
    existingData?.noAadhaarMembers ?? ""
  );

  const [aadhaarEkyc, setAadhaarEkyc] = useState(
    existingData?.aadhaarEkyc ?? ""
  );

  const [noCasteCertificateMembers, setNoCasteCertificateMembers] =
    useState(existingData?.noCasteCertificateMembers ?? "");

  const [noAyushmanMembers, setNoAyushmanMembers] = useState(
    existingData?.noAyushmanMembers ?? ""
  );

  const [noVoterIdMembers, setNoVoterIdMembers] = useState(
    existingData?.noVoterIdMembers ?? ""
  );

  const [mnregaJobCard, setMnregaJobCard] = useState(
    existingData?.mnregaJobCard ?? ""
  );

  const [noShramikCardMembers, setNoShramikCardMembers] = useState(
    existingData?.noShramikCardMembers ?? ""
  );

  const [janDhanAccount, setJanDhanAccount] = useState(
    existingData?.janDhanAccount ?? ""
  );

  const [kcc, setKcc] = useState(
    existingData?.kcc ?? ""
  );

  const [forestRightsPatta, setForestRightsPatta] = useState(
    existingData?.forestRightsPatta ?? ""
  );

  const handleNext = () => {
    onNext({
      rationCard,
      noAadhaarMembers,
      aadhaarEkyc,
      noCasteCertificateMembers,
      noAyushmanMembers,
      noVoterIdMembers,
      mnregaJobCard,
      noShramikCardMembers,
      janDhanAccount,
      kcc,
      forestRightsPatta,
    });
  };

  const RadioOption = ({
    name,
    value,
    checked,
    onChange,
    children,
  }: {
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    children: React.ReactNode;
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
          {children}
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
          हाउसहोल्ड सर्वे • अनुभाग 3
        </p>

        <h2 className="text-lg font-bold text-slate-900 mt-1">
          दस्तावेज एवं शासकीय योजनाएँ
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          परिवार के दस्तावेज एवं शासकीय योजनाओं से संबंधित जानकारी दर्ज करें।
        </p>

      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="space-y-6">

        {/* 4. राशन कार्ड */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. राशन कार्ड है?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="rationCard"
              value="हाँ"
              checked={rationCard === "हाँ"}
              onChange={setRationCard}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="rationCard"
              value="नहीं"
              checked={rationCard === "नहीं"}
              onChange={setRationCard}
            >
              नहीं
            </RadioOption>

          </div>
        </div>

        {/* 5. आधार कार्ड */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            2. आधार कार्ड नहीं रखने वाले सदस्य
          </label>

          <input
            type="number"
            min="0"
            value={noAadhaarMembers}
            onChange={(e) => setNoAadhaarMembers(e.target.value)}
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* 6. Aadhaar e-KYC */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            3. राशन कार्ड में दर्ज सभी सदस्यों का आधार e-KYC हुआ है?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="aadhaarEkyc"
              value="हाँ"
              checked={aadhaarEkyc === "हाँ"}
              onChange={setAadhaarEkyc}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="aadhaarEkyc"
              value="नहीं"
              checked={aadhaarEkyc === "नहीं"}
              onChange={setAadhaarEkyc}
            >
              नहीं
            </RadioOption>

          </div>
        </div>

        {/* 7. जाति प्रमाण-पत्र */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            4. जाति प्रमाण-पत्र नहीं रखने वाले सदस्य
          </label>

          <input
            type="number"
            min="0"
            value={noCasteCertificateMembers}
            onChange={(e) =>
              setNoCasteCertificateMembers(e.target.value)
            }
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* 8. आयुष्मान कार्ड */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            5. आयुष्मान कार्ड (PM-JAY) नहीं रखने वाले सदस्य
          </label>

          <input
            type="number"
            min="0"
            value={noAyushmanMembers}
            onChange={(e) =>
              setNoAyushmanMembers(e.target.value)
            }
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* 9. Voter ID */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            6. 18+ आयु में मतदाता पहचान-पत्र नहीं रखने वाले सदस्य
          </label>

          <input
            type="number"
            min="0"
            value={noVoterIdMembers}
            onChange={(e) =>
              setNoVoterIdMembers(e.target.value)
            }
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* 10. मनरेगा */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            7. मनरेगा जॉब कार्ड
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="mnregaJobCard"
              value="हाँ"
              checked={mnregaJobCard === "हाँ"}
              onChange={setMnregaJobCard}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="mnregaJobCard"
              value="नहीं"
              checked={mnregaJobCard === "नहीं"}
              onChange={setMnregaJobCard}
            >
              नहीं
            </RadioOption>

            <RadioOption
              name="mnregaJobCard"
              value="पात्रता नहीं"
              checked={mnregaJobCard === "पात्रता नहीं"}
              onChange={setMnregaJobCard}
            >
              पात्रता नहीं
            </RadioOption>

          </div>
        </div>

        {/* 11. श्रमिक कार्ड */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            8. पात्र 18-40 वर्ष श्रमिक कार्ड नहीं रखने वाले सदस्य
          </label>

          <input
            type="number"
            min="0"
            value={noShramikCardMembers}
            onChange={(e) =>
              setNoShramikCardMembers(e.target.value)
            }
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* 12. जन-धन खाता */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            9. जन-धन खाता है?
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="janDhanAccount"
              value="हाँ"
              checked={janDhanAccount === "हाँ"}
              onChange={setJanDhanAccount}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="janDhanAccount"
              value="नहीं"
              checked={janDhanAccount === "नहीं"}
              onChange={setJanDhanAccount}
            >
              नहीं
            </RadioOption>

          </div>
        </div>

        {/* 13. KCC */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            10. किसान क्रेडिट कार्ड (KCC)
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="kcc"
              value="हाँ"
              checked={kcc === "हाँ"}
              onChange={setKcc}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="kcc"
              value="नहीं"
              checked={kcc === "नहीं"}
              onChange={setKcc}
            >
              नहीं
            </RadioOption>

            <RadioOption
              name="kcc"
              value="पात्रता नहीं"
              checked={kcc === "पात्रता नहीं"}
              onChange={setKcc}
            >
              पात्रता नहीं
            </RadioOption>

          </div>
        </div>

        {/* 14. वनाधिकार पट्टा */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            11. व्यक्तिगत वनाधिकार पट्टा
          </label>

          <div className="flex flex-wrap gap-3">

            <RadioOption
              name="forestRightsPatta"
              value="हाँ"
              checked={forestRightsPatta === "हाँ"}
              onChange={setForestRightsPatta}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="forestRightsPatta"
              value="नहीं"
              checked={forestRightsPatta === "नहीं"}
              onChange={setForestRightsPatta}
            >
              नहीं
            </RadioOption>

            <RadioOption
              name="forestRightsPatta"
              value="पात्रता नहीं"
              checked={forestRightsPatta === "पात्रता नहीं"}
              onChange={setForestRightsPatta}
            >
              पात्रता नहीं
            </RadioOption>

          </div>
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

export default HouseholdDocumentsSchemes;