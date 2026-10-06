import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface HouseholdDocumentsSchemesRef {
  getData: () => {
    rationCard: string;
    noAadhaarMembers: string;
    aadhaarEkyc: string;
    noCasteCertificateMembers: string;
    noAyushmanMembers: string;
    noVoterIdMembers: string;
    mnregaJobCard: string;
    noShramikCardMembers: string;
    janDhanAccount: string;
    kcc: string;
    forestRightsPatta: string;
    marriagecertificate: string;
    bankName: string;
  };
}

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
    marriagecertificate?: string;
    bankName?: string;
  };
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

const HouseholdDocumentsSchemes = forwardRef<
  HouseholdDocumentsSchemesRef,
  HouseholdDocumentsSchemesProps
>(({ existingData }, ref) => {
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

  const [kcc, setKcc] = useState(existingData?.kcc ?? "");

  const [forestRightsPatta, setForestRightsPatta] = useState(
    existingData?.forestRightsPatta ?? ""
  );

  const [marriagecertificate, setmarriagecertificate] = useState(
    existingData?.marriagecertificate ?? ""
  );

  const [bankName, setbankName] = useState(
    existingData?.bankName ?? ""
  );

  // HouseholdForm के "सर्वे पूर्ण करें" पर current data मिलेगा
  useImperativeHandle(ref, () => ({
    getData: () => ({
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
      marriagecertificate,
      bankName,
    }),
  }));

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
      <div className="space-y-6">

        {/* 1. राशन कार्ड */}

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

        {/* 2. आधार कार्ड */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            2. आधार कार्ड नहीं रखने वाले सदस्य
          </label>

          <input
            type="number"
            min="0"
            value={noAadhaarMembers}
            onChange={(e) =>
              setNoAadhaarMembers(e.target.value)
            }
            placeholder="सदस्यों की संख्या"
            className={inputClass}
          />
        </div>

        {/* 3. Aadhaar e-KYC */}

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

        {/* 4. जाति प्रमाण-पत्र */}

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

        {/* 5. आयुष्मान कार्ड */}

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

        {/* 6. Voter ID */}

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

        {/* 7. मनरेगा */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            7. वीबी–जी राम जी जॉब कार्ड
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
          </div>
        </div>

        {/* 8. श्रमिक कार्ड */}

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

        {/* 9. जन-धन खाता */}

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

        {/* बैंक का नाम */}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            यदि जन-धन खाता है, तो वह किस बैंक में है?
          </label>

          <input
            type="text"
            value={bankName}
            onChange={(e) => setbankName(e.target.value)}
            placeholder="बैंक का नाम"
            className={inputClass}
          />
        </div>

        {/* 10. KCC */}

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

        {/* 11. वनाधिकार पट्टा */}

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

        {/* 12. विवाह प्रमाण-पत्र */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            12. विवाह प्रमाण-पत्र है?
          </label>

          <div className="flex flex-wrap gap-3">
            <RadioOption
              name="marriagecertificate"
              value="हाँ"
              checked={marriagecertificate === "हाँ"}
              onChange={setmarriagecertificate}
            >
              हाँ
            </RadioOption>

            <RadioOption
              name="marriagecertificate"
              value="नहीं"
              checked={marriagecertificate === "नहीं"}
              onChange={setmarriagecertificate}
            >
              नहीं
            </RadioOption>
          </div>
        </div>

      </div>
    </div>
  );
});

HouseholdDocumentsSchemes.displayName =
  "HouseholdDocumentsSchemes";

export default HouseholdDocumentsSchemes;