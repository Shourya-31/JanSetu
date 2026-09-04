import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Home, 
  AlertCircle 
} from 'lucide-react';

interface HouseholdSurveyModalProps {
  houseNumber: number;
  villageName: string;
  panchayatName: string;
  blockName: string;
  existingData?: any;
  onClose: () => void;
  onSave: (houseNumber: number, fullData: any) => void;
}

export const HouseholdSurveyModal: React.FC<HouseholdSurveyModalProps> = ({
  houseNumber,
  villageName,
  panchayatName,
  blockName,
  existingData,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // 1. Basic & Demographics
  const [headName, setHeadName] = useState(existingData?.headName || '');
  const [mobile, setMobile] = useState(existingData?.mobile || '');
  const [caste, setCaste] = useState(existingData?.caste || 'अनुसूचित जनजाति');
  const [isBPL, setIsBPL] = useState(existingData?.isBPL || 'हां');
  const [totalMembers, setTotalMembers] = useState(existingData?.totalMembers || '5');
  const [eldersCount, setEldersCount] = useState(existingData?.eldersCount || '1');
  const [childrenCount, setChildrenCount] = useState(existingData?.childrenCount || '2');
  const [unemployedCount, setUnemployedCount] = useState(existingData?.unemployedCount || '1');
  const [incomeSource, setIncomeSource] = useState(existingData?.incomeSource || 'कृषि');

  // 2. Individual Schemes & IDs (Missing Counts)
  const [missingAadhaar, setMissingAadhaar] = useState(existingData?.missingAadhaar || '0');
  const [missingCasteCert, setMissingCasteCert] = useState(existingData?.missingCasteCert || '0');
  const [missingAyushman, setMissingAyushman] = useState(existingData?.missingAyushman || '0');
  const [missingVoterId, setMissingVoterId] = useState(existingData?.missingVoterId || '0');
  const [hasRationCard, setHasRationCard] = useState(existingData?.hasRationCard || 'हां');
  const [hasMNREGA, setHasMNREGA] = useState(existingData?.hasMNREGA || 'हां');
  const [hasShramikCard, setHasShramikCard] = useState(existingData?.hasShramikCard || 'हां');
  const [hasJanDhan, setHasJanDhan] = useState(existingData?.hasJanDhan || 'हां');
  const [hasKCC, setHasKCC] = useState(existingData?.hasKCC || 'नहीं');
  const [hasDeathCert, setHasDeathCert] = useState(existingData?.hasDeathCert || 'लागू नहीं');
  const [hasFreeRation, setHasFreeRation] = useState(existingData?.hasFreeRation || 'हां');
  const [hasPMKisan, setHasPMKisan] = useState(existingData?.hasPMKisan || 'हां');

  // 3. Women & Child Welfare + Education
  const [jsyReceived, setJsyReceived] = useState(existingData?.jsyReceived || 'हां');
  const [pmmvyReceived, setPmmvyReceived] = useState(existingData?.pmmvyReceived || 'हां');
  const [mahtariVandana, setMahtariVandana] = useState(existingData?.mahtariVandana || 'हां');
  const [widowPension, setWidowPension] = useState(existingData?.widowPension || 'पात्रता नहीं है');
  const [divyangPension, setDivyangPension] = useState(existingData?.divyangPension || 'पात्रता नहीं है');
  const [hasBirthCert, setHasBirthCert] = useState(existingData?.hasBirthCert || 'हां');
  const [childrenVaccinated, setChildrenVaccinated] = useState(existingData?.childrenVaccinated || 'हां');
  const [hotMealAWC, setHotMealAWC] = useState(existingData?.hotMealAWC || 'हां');
  const [childrenGoSchool, setChildrenGoSchool] = useState(existingData?.childrenGoSchool || 'हां');
  const [schoolDropReason, setSchoolDropReason] = useState(existingData?.schoolDropReason || 'लागू नहीं (स्कूल जाते हैं)');

  // 4. Housing, Mining & Living Standards
  const [isMiningWorker, setIsMiningWorker] = useState(existingData?.isMiningWorker || 'नहीं');
  const [houseType, setHouseType] = useState(existingData?.houseType || 'कच्चा घर');
  const [hasGovtHousing, setHasGovtHousing] = useState(existingData?.hasGovtHousing || 'नहीं');
  const [hasToilet, setHasToilet] = useState(existingData?.hasToilet || 'हां');
  const [hasTapWater, setHasTapWater] = useState(existingData?.hasTapWater || 'नहीं');
  const [waterSource, setWaterSource] = useState(existingData?.waterSource || 'हैंडपंप');
  const [hasElectricity, setHasElectricity] = useState(existingData?.hasElectricity || 'हां');
  const [usesSolar, setUsesSolar] = useState(existingData?.usesSolar || 'नहीं');
  const [chronicIllness, setChronicIllness] = useState(existingData?.chronicIllness || 'नहीं');
  const [freeMedicine, setFreeMedicine] = useState(existingData?.freeMedicine || 'हां');

  const validateAndSubmit = () => {
    const missing: string[] = [];
    if (!headName.trim()) missing.push('मुखिया का नाम');
    if (!mobile.trim() || mobile.length < 10) missing.push('10 अंकों का मोबाइल नंबर');
    if (!totalMembers || Number(totalMembers) <= 0) missing.push('कुल सदस्य संख्या');

    if (missing.length > 0) {
      setMissingFields(missing);
      alert(`कृपया निम्नलिखित अनिवार्य विवरण पूर्ण करें:\n\n• ${missing.join('\n• ')}`);
      setActiveTab(1);
      return;
    }

    const payload = {
      headName,
      mobile,
      caste,
      isBPL,
      totalMembers: Number(totalMembers),
      eldersCount: Number(eldersCount),
      childrenCount: Number(childrenCount),
      unemployedCount: Number(unemployedCount),
      incomeSource,
      missingAadhaar: Number(missingAadhaar),
      missingCasteCert: Number(missingCasteCert),
      missingAyushman: Number(missingAyushman),
      missingVoterId: Number(missingVoterId),
      hasRationCard,
      hasMNREGA,
      hasShramikCard,
      hasJanDhan,
      hasKCC,
      hasDeathCert,
      hasFreeRation,
      hasPMKisan,
      jsyReceived,
      pmmvyReceived,
      mahtariVandana,
      widowPension,
      divyangPension,
      hasBirthCert,
      childrenVaccinated,
      hotMealAWC,
      childrenGoSchool,
      schoolDropReason,
      isMiningWorker,
      houseType,
      hasGovtHousing,
      hasToilet,
      hasTapWater,
      waterSource,
      hasElectricity,
      usesSolar,
      chronicIllness,
      freeMedicine,
      trackingId: existingData?.trackingId || `DMFT-HHD-${Math.floor(100000 + Math.random() * 900000)}`,
      submittedAt: new Date().toISOString(),
    };

    onSave(houseNumber, payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 font-hindi">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-600 rounded font-mono">
              मकान #{houseNumber}
            </span>
            <div>
              <h3 className="text-sm font-bold">परिवार सर्वेक्षण प्रपत्र (सम्पूर्ण 34 प्रश्न)</h3>
              <p className="text-[11px] text-slate-300">ग्राम: {villageName} • पंचायत: {panchayatName} • ब्लॉक: {blockName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tabs */}
        <div className="flex border-b bg-slate-50 px-6 pt-2 space-x-2 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${activeTab === 1 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'}`}
          >
            1. मुखिया एवं जनसांख्यिकी *
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${activeTab === 2 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'}`}
          >
            2. व्यक्ति-मूलक योजनाएँ व कार्ड *
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(3)}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${activeTab === 3 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'}`}
          >
            3. महिला, बाल कल्याण व शिक्षा *
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(4)}
            className={`pb-2 px-3 border-b-2 cursor-pointer ${activeTab === 4 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'}`}
          >
            4. आवास, जल, स्वच्छता व स्वास्थ्य *
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-4">
          
          {/* TAB 1: Head & Demographics */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-sm font-bold text-slate-900">परिवार के मुखिया का सामान्य विवरण एवं आयु गणना</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">परिवार के मुखिया का नाम *</label>
                  <input
                    type="text"
                    required
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder="उदा. सोमारू मंडावी"
                    className="w-full p-2 border rounded font-semibold text-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10 अंकों का फोन नंबर"
                    className="w-full p-2 border rounded font-semibold focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">जाति *</label>
                  <select value={caste} onChange={(e) => setCaste(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="सामान्य">सामान्य</option>
                    <option value="अन्य पिछड़ा वर्ग">अन्य पिछड़ा वर्ग</option>
                    <option value="अनुसूचित जाति">अनुसूचित जाति</option>
                    <option value="अनुसूचित जनजाति">अनुसूचित जनजाति</option>
                    <option value="अबूझमाड़िया अनुसूचित जनजाति">अबूझमाड़िया अनुसूचित जनजाति</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block font-medium mb-1">गरीबी रेखा (BPL)? *</label>
                  <select value={isBPL} onChange={(e) => setIsBPL(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">कुल सदस्य संख्या *</label>
                  <input
                    type="number"
                    min={1}
                    value={totalMembers}
                    onChange={(e) => setTotalMembers(e.target.value)}
                    className="w-full p-2 border rounded font-bold text-blue-700 bg-blue-50"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">बुजुर्गों की संख्या *</label>
                  <input type="number" min={0} value={eldersCount} onChange={(e) => setEldersCount(e.target.value)} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-medium mb-1">बच्चों की संख्या *</label>
                  <input type="number" min={0} value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium mb-1">बेरोजगार युवा (18 से 35 वर्ष) *</label>
                  <input type="number" min={0} value={unemployedCount} onChange={(e) => setUnemployedCount(e.target.value)} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-medium mb-1">आय का मुख्य स्रोत *</label>
                  <select value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="कृषि">कृषि</option>
                    <option value="पशुपालन">पशुपालन</option>
                    <option value="दैनिक मजदूर गांव में">दैनिक मजदूर गांव में</option>
                    <option value="दैनिक मजदूर शहर में">दैनिक मजदूर शहर में</option>
                    <option value="दुकानदार">दुकानदार</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Schemes & Documents */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-sm font-bold text-slate-900">व्यक्ति-मूलक योजनाएँ एवं आवश्यक कार्ड्स</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border">
                <div>
                  <label className="block mb-1">बिना आधार कार्ड सदस्य *</label>
                  <input type="number" min={0} value={missingAadhaar} onChange={(e) => setMissingAadhaar(e.target.value)} className="w-full p-1.5 border rounded bg-white" />
                </div>
                <div>
                  <label className="block mb-1">बिना जाति प्रमाण-पत्र सदस्य *</label>
                  <input type="number" min={0} value={missingCasteCert} onChange={(e) => setMissingCasteCert(e.target.value)} className="w-full p-1.5 border rounded bg-white" />
                </div>
                <div>
                  <label className="block mb-1">बिना आयुष्मान कार्ड सदस्य *</label>
                  <input type="number" min={0} value={missingAyushman} onChange={(e) => setMissingAyushman(e.target.value)} className="w-full p-1.5 border rounded bg-white" />
                </div>
                <div>
                  <label className="block mb-1">बिना वोटर आईडी (18+) सदस्य *</label>
                  <input type="number" min={0} value={missingVoterId} onChange={(e) => setMissingVoterId(e.target.value)} className="w-full p-1.5 border rounded bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">राशन कार्ड है? *</label>
                  <select value={hasRationCard} onChange={(e) => setHasRationCard(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">मनरेगा जॉब कार्ड? *</label>
                  <select value={hasMNREGA} onChange={(e) => setHasMNREGA(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">श्रमिक कार्ड (18–40 वर्ष)? *</label>
                  <select value={hasShramikCard} onChange={(e) => setHasShramikCard(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">जन-धन बैंक खाता? *</label>
                  <select value={hasJanDhan} onChange={(e) => setHasJanDhan(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">किसान क्रेडिट कार्ड (KCC)? *</label>
                  <select value={hasKCC} onChange={(e) => setHasKCC(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">PM गरीब कल्याण मुफ्त राशन? *</label>
                  <select value={hasFreeRation} onChange={(e) => setHasFreeRation(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">PM किसान सम्मान निधि (₹6000)? *</label>
                  <select value={hasPMKisan} onChange={(e) => setHasPMKisan(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">मृत्यु प्रमाण-पत्र (यदि लागू हो)? *</label>
                  <select value={hasDeathCert} onChange={(e) => setHasDeathCert(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="लागू नहीं">लागू नहीं (मृत्यु नहीं हुई)</option>
                    <option value="हां">हां (प्राप्त हुआ)</option>
                    <option value="नहीं">नहीं (प्राप्त नहीं हुआ)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Women, Child & Education */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-sm font-bold text-slate-900">महिला, बाल कल्याण एवं शिक्षा विवरण</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-medium">जननी सुरक्षा योजना (JSY) लाभ? *</label>
                  <select value={jsyReceived} onChange={(e) => setJsyReceived(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">मातृ वंदना योजना (PMMVY)? *</label>
                  <select value={pmmvyReceived} onChange={(e) => setPmmvyReceived(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">महतारी वंदना योजना नकद लाभ? *</label>
                  <select value={mahtariVandana} onChange={(e) => setMahtariVandana(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">विधवा पेंशन योजना लाभ (40-79 वर्ष)? *</label>
                  <select value={widowPension} onChange={(e) => setWidowPension(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">दिव्यांग पेंशन योजना लाभ? *</label>
                  <select value={divyangPension} onChange={(e) => setDivyangPension(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">बच्चों का जन्म प्रमाण-पत्र? *</label>
                  <select value={hasBirthCert} onChange={(e) => setHasBirthCert(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">बच्चों (0-5 वर्ष) का टीकाकरण? *</label>
                  <select value={childrenVaccinated} onChange={(e) => setChildrenVaccinated(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">आंगनबाड़ी में गर्म पका भोजन (3-5 वर्ष)? *</label>
                  <select value={hotMealAWC} onChange={(e) => setHotMealAWC(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">क्या बच्चे स्कूल जाते हैं? *</label>
                  <select 
                    value={childrenGoSchool} 
                    onChange={(e) => {
                      setChildrenGoSchool(e.target.value);
                      if (e.target.value === 'हां') setSchoolDropReason('लागू नहीं (स्कूल जाते हैं)');
                      else setSchoolDropReason('दूरी');
                    }} 
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
              </div>

              {childrenGoSchool === 'नहीं' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                  <label className="block mb-1 font-bold text-rose-900">स्कूल नहीं जाने का मुख्य कारण? *</label>
                  <select value={schoolDropReason} onChange={(e) => setSchoolDropReason(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="दूरी">दूरी</option>
                    <option value="अध्यापक की कमी">अध्यापक की कमी</option>
                    <option value="गरीबी">गरीबी</option>
                    <option value="घर के धंधे में हाथ बटाना">घर के धंधे में हाथ बटाना</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Housing, Water & Health */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-sm font-bold text-slate-900">आवास, पेयजल, स्वच्छता एवं स्वास्थ्य</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1">घर का प्रकार *</label>
                  <select value={houseType} onChange={(e) => setHouseType(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="कच्चा घर">कच्चा घर</option>
                    <option value="पक्का घर">पक्का घर</option>
                    <option value="आधा कच्चा आधा पक्का घर">आधा कच्चा आधा पक्का घर</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">सरकारी आवास योजना लाभ? *</label>
                  <select value={hasGovtHousing} onChange={(e) => setHasGovtHousing(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                    <option value="पात्रता नहीं है">पात्रता नहीं है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">घर में शौचालय है? *</label>
                  <select value={hasToilet} onChange={(e) => setHasToilet(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">नल जल कनेक्शन है? *</label>
                  <select value={hasTapWater} onChange={(e) => setHasTapWater(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">पानी कहाँ से लाते हैं? *</label>
                  <select value={waterSource} onChange={(e) => setWaterSource(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हैंडपंप">हैंडपंप</option>
                    <option value="कुआँ">कुआँ</option>
                    <option value="नदी">नदी</option>
                    <option value="झरना">झरना</option>
                    <option value="तालाब">तालाब</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">बिजली कनेक्शन है? *</label>
                  <select value={hasElectricity} onChange={(e) => setHasElectricity(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">सौर ऊर्जा का उपयोग? *</label>
                  <select value={usesSolar} onChange={(e) => setUsesSolar(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">खनन में कार्यरत हैं? *</label>
                  <select value={isMiningWorker} onChange={(e) => setIsMiningWorker(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">खांसी/दमा/टीबी रोग? *</label>
                  <select value={chronicIllness} onChange={(e) => setChronicIllness(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">निःशुल्क दवाई मिलती है? *</label>
                  <select value={freeMedicine} onChange={(e) => setFreeMedicine(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-3">
          {activeTab > 1 ? (
            <button
              type="button"
              onClick={() => setActiveTab((p) => p - 1)}
              className="px-4 py-2 border rounded text-slate-700 bg-white hover:bg-slate-100 font-semibold cursor-pointer"
            >
              ← पिछला
            </button>
          ) : <div />}

          {activeTab < 4 ? (
            <button
              type="button"
              onClick={() => setActiveTab((p) => p + 1)}
              className="px-5 py-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
            >
              अगला चरण →
            </button>
          ) : (
            <button
              type="button"
              onClick={validateAndSubmit}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer shadow-xs flex items-center"
            >
              परिवार विवरण सुरक्षित करें एवं डैशबोर्ड देखें
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};