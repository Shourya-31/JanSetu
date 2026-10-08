import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface HouseholdDemographyRef {
  getData: () => {
    caste: string;
    isBpl: string;
    elderly: string;
    children: string;
    women: string;
  };
}

interface HouseholdDemographyProps {
  houseNumber: number;

  existingData?: {
    caste?: string;
    isBpl?: string;
    elderly?: string;
    children?: string;
    women?: string;
  };

  //onNext: (data: any) => void;
}

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg " +
  "text-sm text-slate-900 focus:outline-none focus:ring-1 " +
  "focus:ring-slate-900 focus:border-slate-900";

// const HouseholdDemography: React.FC<HouseholdDemographyProps> = ({
//   houseNumber,
//   existingData,
//   onNext,
// }) => {
const HouseholdDemography = forwardRef<
  HouseholdDemographyRef,
  HouseholdDemographyProps
>(({ houseNumber, existingData }, ref) => {
  const [caste, setCaste] = useState(existingData?.caste ?? "");
  const [isBpl, setIsBpl] = useState(existingData?.isBpl ?? "");
  const [elderly, setElderly] = useState(existingData?.elderly ?? "");
  const [children, setChildren] = useState(existingData?.children ?? "");
  const [women, setWomen] = useState(existingData?.women ?? "");

  /*
   * Parent HouseholdForm jab final "सर्वे पूर्ण करें"
   * click karega tab is section ka current data
   * parent ko onNext ke through milega.
   */
  // const handleNext = () => {
  //   onNext({
  //     caste,
  //     isBpl,
  //     elderly,
  //     children,
  //     women,
  //   });
  // };
  useImperativeHandle(ref, () => ({
  getData: () => ({
    caste,
    isBpl,
    elderly,
    children,
    women,
  }),
}));

  return (
    <div className="space-y-5">
      <div className="space-y-6">

        {/* =====================================================
            1. जाति
        ====================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            1. जाति
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "सामान्य",
              "अन्य पिछड़ा वर्ग",
              "अनुसूचित जाति",
              "अनुसूचित जनजाति",
              "अबूझमाड़िया अनुसूचित जनजाति",
            ].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                  caste === option
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name={`caste-${houseNumber}`}
                  value={option}
                  checked={caste === option}
                  onChange={(e) => setCaste(e.target.value)}
                  className="w-4 h-4 accent-slate-900"
                />

                <span className="text-sm text-slate-800">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* =====================================================
            2. BPL
        ====================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            2. क्या परिवार गरीबी रेखा के नीचे (BPL) है?
          </label>

          <div className="flex flex-wrap gap-3">
            {["हाँ", "नहीं"].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 min-w-[120px] px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                  isBpl === option
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name={`isBpl-${houseNumber}`}
                  value={option}
                  checked={isBpl === option}
                  onChange={(e) => setIsBpl(e.target.value)}
                  className="w-4 h-4 accent-slate-900"
                />

                <span className="text-sm text-slate-800">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* =====================================================
            3. कुल सदस्य
        ====================================================== */}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">
            3. कुल सदस्य
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* बुजुर्ग */}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                बुजुर्ग
              </label>

              <input
                type="number"
                min="0"
                value={elderly}
                onChange={(e) => setElderly(e.target.value)}
                placeholder="संख्या"
                className={inputClass}
              />
            </div>

            {/* बच्चे */}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                बच्चे
              </label>

              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                placeholder="संख्या"
                className={inputClass}
              />
            </div>

            {/* महिला */}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                महिला
              </label>

              <input
                type="number"
                min="0"
                value={women}
                onChange={(e) => setWomen(e.target.value)}
                placeholder="संख्या"
                className={inputClass}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
});

export default HouseholdDemography;