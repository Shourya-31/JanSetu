import React, { useState, useMemo } from 'react';
import { CENSUS_HIERARCHY } from '../data/narayanpurHierarchy';
import { ArrowRight, MapPin, AlertCircle, School, Stethoscope, Briefcase, Baby } from 'lucide-react';

interface VillageProfileFormProps {
  onComplete: (data: any) => void;
}

const DEFAULT_GAP_ITEMS = [
  'घरेलू पाइपयुक्त जल कनेक्शन',
  'हैंडपंप',
  'बोरवेल',
  'ओवरहेड टैंक',
  'सौर पंप',
  'डॉक्टर / विशेषज्ञ पद (रिक्त)',
  'पैरामेडिकल / ANM स्टाफ पद (रिक्त)',
  'शिक्षक',
  'कर्मचारी / स्टाफ (विद्यालय)',
  'विज्ञान / कंप्यूटर प्रयोगशालाएं',
  'चलने के सहायक उपकरण / बैसाखी',
  'सामुदायिक शौचालय परिसर',
  'बिजली रहित परिवार (संख्या)',
  'सोलर स्ट्रीट लाइट (संख्या)',
  'सड़क (आवश्यक किमी)',
  'पुल (संख्या)',
];

export const VillageProfileForm: React.FC<VillageProfileFormProps> = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'quality' | 'matrix'>('admin');
  const [missingFieldKeys, setMissingFieldKeys] = useState<string[]>([]);
  const [errorBannerMsg, setErrorBannerMsg] = useState<string | null>(null);

  // 1. Administrative & Housing
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [totalHouseholds, setTotalHouseholds] = useState<string>('');
  const [scCount, setScCount] = useState<string>('');
  const [stCount, setStCount] = useState<string>('');
  const [puccaHouses, setPuccaHouses] = useState<string>('');
  const [semiPuccaHouses, setSemiPuccaHouses] = useState<string>('');
  const [kacchaHouses, setKacchaHouses] = useState<string>('');
  const [mineDistanceKm, setMineDistanceKm] = useState<string>('5 से 10 KM');

  // 2. Facilities
  const [hasPuccaRoad, setHasPuccaRoad] = useState('हां');
  const [monsoonCutOff, setMonsoonCutOff] = useState('नहीं');
  const [schoolType, setSchoolType] = useState('प्राथमिक विद्यालय');
  const [hospitalType, setHospitalType] = useState('उप-स्वास्थ्य केंद्र (SHC)');
  const [electrification, setElectrification] = useState('पूर्णतः विद्युतीकृत');
  const [hasAnganwadi, setHasAnganwadi] = useState('हां');
  const [odfStatus, setOdfStatus] = useState('ODF+');
  const [hasSolarLighting, setHasSolarLighting] = useState('हां');

  // 3. Quality & Livelihood
  const [schoolSeating, setSchoolSeating] = useState('पर्याप्त एवं अच्छी स्थिति में');
  const [schoolToilets, setSchoolToilets] = useState('हाँ, दोनों के लिए अलग-अलग शौचालय उपलब्ध हैं');
  const [schoolSports, setSchoolSports] = useState('हाँ, लेकिन सुविधा अपर्याप्त है');
  const [schoolDeficiency, setSchoolDeficiency] = useState('पर्याप्त शिक्षक नहीं हैं');

  const [healthTiming, setHealthTiming] = useState('हाँ, नियमित रूप से');
  const [healthMedicine, setHealthMedicine] = useState('आंशिक रूप से उपलब्ध');
  const [healthStaff, setHealthStaff] = useState('हाँ, नियमित रूप से');
  const [healthDeficiency, setHealthDeficiency] = useState('दवाइयों की समय पर आपूर्ति नहीं');

  const [awcOperation, setAwcOperation] = useState('हाँ, नियमित रूप से');
  const [awcNutrition, setAwcNutrition] = useState('हाँ, नियमित रूप से');
  const [awcDeficiency, setAwcDeficiency] = useState('स्वयं का पक्का भवन नहीं');

  const [vetDoctorVisits, setVetDoctorVisits] = useState('कभी-कभी');
  const [unemployedYouth, setUnemployedYouth] = useState('11-25 युवा');
  const [training1, setTraining1] = useState('कृषि एवं जैविक खाद उत्पादन');
  const [training2, setTraining2] = useState('सौर ऊर्जा एवं विद्युत उपकरण मरम्मत');
  const [pendingHouses, setPendingHouses] = useState('1-5 आवास');

  // 4. Gap Matrix State
  const [gapMatrix, setGapMatrix] = useState<Record<string, { current: number; functional: number; nonFunctional: number; required: number; gap: number }>>(() => {
    return DEFAULT_GAP_ITEMS.reduce((acc, item) => ({
      ...acc,
      [item]: { current: 1, functional: 1, nonFunctional: 0, required: 1, gap: 0 }
    }), {});
  });

  const currentBlockData = useMemo(() => CENSUS_HIERARCHY.find((b) => b.blockName === selectedBlock), [selectedBlock]);
  const panchayatOptions = useMemo(() => (currentBlockData ? currentBlockData.panchayats : []), [currentBlockData]);
  const currentPanchayatData = useMemo(() => panchayatOptions.find((p) => p.name === selectedPanchayat), [panchayatOptions, selectedPanchayat]);
  const villageOptions = useMemo(() => (currentPanchayatData ? currentPanchayatData.villages : []), [currentPanchayatData]);

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vilName = e.target.value;
    setSelectedVillage(vilName);
    setMissingFieldKeys((prev) => prev.filter((k) => k !== 'village'));

    const found = villageOptions.find((v) => v.nameHindi === vilName);
    if (found) {
      setTotalPopulation(found.population);
      const estHouses = found.population > 0 ? Math.max(1, Math.round(found.population / 4.5)) : 1;
      setTotalHouseholds(String(estHouses));
      setPuccaHouses(String(Math.round(estHouses * 0.2)));
      setSemiPuccaHouses(String(Math.round(estHouses * 0.3)));
      setKacchaHouses(String(estHouses - Math.round(estHouses * 0.2) - Math.round(estHouses * 0.3)));
      setScCount(String(Math.round(found.population * 0.05)));
      setStCount(String(Math.round(found.population * 0.85)));
    } else {
      setTotalPopulation(0);
      setTotalHouseholds('');
      setPuccaHouses('');
      setSemiPuccaHouses('');
      setKacchaHouses('');
      setScCount('');
      setStCount('');
    }
  };

  const handleMatrixChange = (item: string, field: 'current' | 'functional' | 'nonFunctional' | 'required', valStr: string) => {
    const num = Math.max(0, Number(valStr) || 0);
    setGapMatrix((prev) => {
      const currentObj = { ...prev[item], [field]: num };
      const autoGap = Math.max(0, currentObj.required - currentObj.functional);
      return {
        ...prev,
        [item]: { ...currentObj, gap: autoGap }
      };
    });
  };

  // Strict Field Check & Alert Trigger
  const handleFinalSubmit = () => {
    const missing: string[] = [];
    const missingNames: string[] = [];

    if (!selectedBlock) { missing.push('block'); missingNames.push('विकासखंड'); }
    if (!selectedPanchayat) { missing.push('panchayat'); missingNames.push('ग्राम पंचायत'); }
    if (!selectedVillage) { missing.push('village'); missingNames.push('ग्राम का नाम'); }
    if (!totalHouseholds || Number(totalHouseholds) <= 0) { missing.push('totalHouseholds'); missingNames.push('कुल परिवार'); }
    if (scCount === '') { missing.push('scCount'); missingNames.push('SC जनसंख्या'); }
    if (stCount === '') { missing.push('stCount'); missingNames.push('ST जनसंख्या'); }
    if (puccaHouses === '') { missing.push('puccaHouses'); missingNames.push('पक्का घर संख्या'); }
    if (semiPuccaHouses === '') { missing.push('semiPuccaHouses'); missingNames.push('अर्ध-पक्का घर संख्या'); }
    if (kacchaHouses === '') { missing.push('kacchaHouses'); missingNames.push('कच्चा घर संख्या'); }

    if (missing.length > 0) {
      setMissingFieldKeys(missing);
      const alertText = `⚠️ कृपया निम्नलिखित अनिवार्य फ़ील्ड भरें:\n\n• ${missingNames.join('\n• ')}`;
      alert(alertText);
      setErrorBannerMsg(`कृपया पहले टैब में छूटी हुई फ़ील्ड्स पूर्ण करें: ${missingNames.join(', ')}`);
      setActiveTab('admin');
      return;
    }

    const houses = Number(totalHouseholds);
    if (totalPopulation > 0 && houses > totalPopulation) {
      alert(`⚠️ अमान्य प्रविष्टि!\nकुल परिवार (${houses}) गाँव की कुल जनसंख्या (${totalPopulation}) से अधिक नहीं हो सकते।`);
      setMissingFieldKeys(['totalHouseholds']);
      setActiveTab('admin');
      return;
    }

    setMissingFieldKeys([]);
    setErrorBannerMsg(null);

    onComplete({
      district: 'नारायणपुर',
      block: selectedBlock,
      panchayat: selectedPanchayat,
      villageName: selectedVillage,
      totalPopulation,
      totalHouseholds: houses,
      scCount: Number(scCount),
      stCount: Number(stCount),
      puccaHouses: Number(puccaHouses),
      semiPuccaHouses: Number(semiPuccaHouses),
      kacchaHouses: Number(kacchaHouses),
      mineDistanceKm,
      hasPuccaRoad,
      monsoonCutOff,
      schoolType,
      hospitalType,
      electrification,
      hasAnganwadi,
      odfStatus,
      hasSolarLighting,
      quality: {
        school: { schoolSeating, schoolToilets, schoolSports, schoolDeficiency },
        health: { healthTiming, healthMedicine, healthStaff, healthDeficiency },
        awc: { awcOperation, awcNutrition, awcDeficiency },
        livelihood: { vetDoctorVisits, unemployedYouth, training1, training2, pendingHouses }
      },
      gapMatrix,
    });
  };

  const getFieldClass = (key: string) => {
    return missingFieldKeys.includes(key)
      ? 'border-2 border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
      : 'border border-slate-300 focus:ring-1 focus:ring-slate-900';
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-slate-300 rounded-xl shadow-xs p-6 font-hindi">
      
      {/* Top Header */}
      <div className="border-b pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded">
            सर्वेक्षक प्रपत्र • सम्पूर्ण ग्राम परिचय (अनिवार्य सत्यापन)
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center">
            <MapPin className="w-5 h-5 text-emerald-600 mr-1.5" />
            ग्राम परिचय, गुणवत्ता एवं अंतराल मैट्रिक्स
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-medium">जिला: नारायणपुर</div>
      </div>

      {/* Red Alert Banner */}
      {errorBannerMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg mb-4 text-xs text-rose-900 font-semibold flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
          {errorBannerMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer ${
            activeTab === 'admin' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
          }`}
        >
          1. प्रशासनिक, आवास व सुविधाएँ *
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer ${
            activeTab === 'quality' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
          }`}
        >
          2. सुविधाओं की गुणवत्ता व आजीविका *
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer ${
            activeTab === 'matrix' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
          }`}
        >
          3. आधारभूत अंतराल मैट्रिक्स (Gap Matrix) *
        </button>
      </div>

      <div className="space-y-6 text-xs">
        
        {/* TAB 1 */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
              <h3 className="font-bold text-slate-800 uppercase text-[11px]">
                प्रशासनिक क्षेत्र चयन *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">विकासखंड *</label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => {
                      setSelectedBlock(e.target.value);
                      setSelectedPanchayat('');
                      setSelectedVillage('');
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'block'));
                    }}
                    className={`w-full p-2 bg-white rounded font-medium ${getFieldClass('block')}`}
                  >
                    <option value="">-- विकासखंड चुनें --</option>
                    {CENSUS_HIERARCHY.map((b) => <option key={b.blockName} value={b.blockName}>{b.blockName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">ग्राम पंचायत *</label>
                  <select
                    disabled={!selectedBlock}
                    value={selectedPanchayat}
                    onChange={(e) => {
                      setSelectedPanchayat(e.target.value);
                      setSelectedVillage('');
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'panchayat'));
                    }}
                    className={`w-full p-2 bg-white rounded font-medium disabled:bg-slate-100 ${getFieldClass('panchayat')}`}
                  >
                    <option value="">-- ग्राम पंचायत चुनें --</option>
                    {panchayatOptions.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">ग्राम का नाम *</label>
                  <select
                    disabled={!selectedPanchayat}
                    value={selectedVillage}
                    onChange={handleVillageChange}
                    className={`w-full p-2 bg-white rounded font-bold text-slate-900 disabled:bg-slate-100 ${getFieldClass('village')}`}
                  >
                    <option value="">-- ग्राम चुनें --</option>
                    {villageOptions.map((v) => <option key={v.nameHindi} value={v.nameHindi}>{v.nameHindi} ({v.nameEnglish})</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Demographics & Housing */}
            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
              <h3 className="font-bold text-slate-800 uppercase text-[11px]">जनसांख्यिकी एवं आवास वर्गीकरण *</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium mb-1">कुल जनसंख्या</label>
                  <input type="number" readOnly value={totalPopulation} className="w-full p-2 border rounded bg-slate-100 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-amber-900 mb-1">कुल परिवार *</label>
                  <input
                    type="number"
                    min={1}
                    value={totalHouseholds}
                    onChange={(e) => {
                      setTotalHouseholds(e.target.value);
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'totalHouseholds'));
                    }}
                    className={`w-full p-2 bg-amber-50 rounded font-bold text-slate-900 ${getFieldClass('totalHouseholds')}`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">SC जनसंख्या *</label>
                  <input
                    type="number"
                    value={scCount}
                    onChange={(e) => {
                      setScCount(e.target.value);
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'scCount'));
                    }}
                    className={`w-full p-2 rounded bg-white ${getFieldClass('scCount')}`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">ST जनसंख्या *</label>
                  <input
                    type="number"
                    value={stCount}
                    onChange={(e) => {
                      setStCount(e.target.value);
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'stCount'));
                    }}
                    className={`w-full p-2 rounded bg-white ${getFieldClass('stCount')}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block mb-1 font-medium">पक्का घर संख्या *</label>
                  <input
                    type="number"
                    value={puccaHouses}
                    onChange={(e) => {
                      setPuccaHouses(e.target.value);
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'puccaHouses'));
                    }}
                    className={`w-full p-2 rounded bg-white font-semibold ${getFieldClass('puccaHouses')}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">अर्ध-पक्का घर संख्या *</label>
                  <input
                    type="number"
                    value={semiPuccaHouses}
                    onChange={(e) => {
                      setSemiPuccaHouses(e.target.value);
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'semiPuccaHouses'));
                    }}
                    className={`w-full p-2 rounded bg-white font-semibold ${getFieldClass('semiPuccaHouses')}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">कच्चा घर संख्या *</label>
                  <input
                    type="number"
                    value={kacchaHouses}
                    onChange={(e) => {
                      setKacchaHouses(e.target.value);
                      setMissingFieldKeys((p) => p.filter((k) => k !== 'kacchaHouses'));
                    }}
                    className={`w-full p-2 rounded bg-white font-semibold ${getFieldClass('kacchaHouses')}`}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">खदान से दूरी *</label>
                  <select value={mineDistanceKm} onChange={(e) => setMineDistanceKm(e.target.value)} className="w-full p-2 border rounded bg-white font-semibold">
                    <option value="0 से 5 KM">0 से 5 KM (प्रत्यक्ष प्रभाव)</option>
                    <option value="5 से 10 KM">5 से 10 KM</option>
                    <option value="10 से 20 KM">10 से 20 KM</option>
                    <option value="20 KM से अधिक">20 KM से अधिक</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Public Facilities */}
            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
              <h3 className="font-bold text-slate-800 uppercase text-[11px]">उपलब्ध बुनियादी सुविधाएँ *</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1 font-medium">पक्की सड़क जुड़ाव? *</label>
                  <select value={hasPuccaRoad} onChange={(e) => setHasPuccaRoad(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">बारिश में संपर्क कटना? *</label>
                  <select value={monsoonCutOff} onChange={(e) => setMonsoonCutOff(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="नहीं">नहीं</option>
                    <option value="हां">हां</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">उपलब्ध विद्यालय *</label>
                  <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="प्राथमिक विद्यालय">प्राथमिक विद्यालय</option>
                    <option value="उच्च प्राथमिक विद्यालय">उच्च प्राथमिक विद्यालय</option>
                    <option value="हाई स्कूल / माध्यमिक विद्यालय">हाई स्कूल / माध्यमिक विद्यालय</option>
                    <option value="उच्चतर माध्यमिक विद्यालय">उच्चतर माध्यमिक विद्यालय</option>
                    <option value="नहीं हैं">नहीं हैं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">उपलब्ध अस्पताल *</label>
                  <select value={hospitalType} onChange={(e) => setHospitalType(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="उप-स्वास्थ्य केंद्र (SHC)">उप-स्वास्थ्य केंद्र (SHC)</option>
                    <option value="प्राथमिक स्वास्थ्य , (PHC)">प्राथमिक स्वास्थ्य (PHC)</option>
                    <option value="सामुदायिक स्वास्थ्य केंद्र  (CHC)">सामुदायिक स्वास्थ्य केंद्र (CHC)</option>
                    <option value="नहीं हैं">नहीं हैं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">विद्युतीकरण स्थिति *</label>
                  <select value={electrification} onChange={(e) => setElectrification(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="पूर्णतः विद्युतीकृत">पूर्णतः विद्युतीकृत</option>
                    <option value="आंशिक रूप से विद्युतीकृत">आंशिक रूप से विद्युतीकृत</option>
                    <option value="विद्युतीकृत नहीं">विद्युतीकृत नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">आंगनबाड़ी केंद्र (AWC) *</label>
                  <select value={hasAnganwadi} onChange={(e) => setHasAnganwadi(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">ODF स्थिति *</label>
                  <select value={odfStatus} onChange={(e) => setOdfStatus(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="ODF+">ODF+</option>
                    <option value="ODF">ODF</option>
                    <option value="ODF++">ODF++</option>
                    <option value="Not ODF">Not ODF</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">सोलर स्ट्रीट लाइटिंग? *</label>
                  <select value={hasSolarLighting} onChange={(e) => setHasSolarLighting(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हां">हां</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center text-xs uppercase">
                <School className="w-4 h-4 mr-1.5 text-blue-600" /> विद्यालय सुविधाओं की स्थिति *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-medium">बैठने की व्यवस्था *</label>
                  <select value={schoolSeating} onChange={(e) => setSchoolSeating(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="पर्याप्त एवं अच्छी स्थिति में">पर्याप्त एवं अच्छी स्थिति में</option>
                    <option value="पर्याप्त लेकिन खराब स्थिति में">पर्याप्त लेकिन खराब स्थिति में</option>
                    <option value="अपर्याप्त">अपर्याप्त</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">बालक-बालिका पृथक शौचालय *</label>
                  <select value={schoolToilets} onChange={(e) => setSchoolToilets(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, दोनों के लिए अलग-अलग शौचालय उपलब्ध हैं">हाँ, दोनों के लिए अलग-अलग उपलब्ध</option>
                    <option value="केवल बालकों के लिए शौचालय उपलब्ध है">केवल बालकों के लिए</option>
                    <option value="केवल बालिकाओं के लिए शौचालय उपलब्ध है">केवल बालिकाओं के लिए</option>
                    <option value="अलग-अलग शौचालय उपलब्ध नहीं हैं">अलग-अलग उपलब्ध नहीं हैं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">खेल-कूद सुविधा *</label>
                  <select value={schoolSports} onChange={(e) => setSchoolSports(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, पर्याप्त सुविधा उपलब्ध है">हाँ, पर्याप्त सुविधा उपलब्ध है</option>
                    <option value="हाँ, लेकिन सुविधा अपर्याप्त है">हाँ, लेकिन सुविधा अपर्याप्त है</option>
                    <option value="नहीं, खेल-कूद की सुविधा उपलब्ध नहीं है">उपलब्ध नहीं है</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">विद्यालय में प्रमुख कमी *</label>
                <select value={schoolDeficiency} onChange={(e) => setSchoolDeficiency(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                  <option value="पर्याप्त शिक्षक नहीं हैं">पर्याप्त शिक्षक नहीं हैं</option>
                  <option value="पेयजल एवं रनिंग वाटर की अनुपलब्धता">पेयजल एवं रनिंग वाटर की अनुपलब्धता</option>
                  <option value="चारदीवारी / बाउंड्री वॉल का अभाव">चारदीवारी / बाउंड्री वॉल का अभाव</option>
                  <option value="भवन जर्जर स्थिति में है">भवन जर्जर स्थिति में है</option>
                  <option value="कोई विशेष कमी नहीं">कोई विशेष कमी नहीं</option>
                </select>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center text-xs uppercase">
                <Stethoscope className="w-4 h-4 mr-1.5 text-rose-600" /> स्वास्थ्य देखभाल स्थिति *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-medium">समय अनुसार संचालन? *</label>
                  <select value={healthTiming} onChange={(e) => setHealthTiming(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, नियमित रूप से">हाँ, नियमित रूप से</option>
                    <option value="कभी-कभी बंद रहता है">कभी-कभी बंद रहता है</option>
                    <option value="अक्सर बंद रहता है">अक्सर बंद रहता है</option>
                    <option value="हमेशा बंद रहता है">हमेशा बंद रहता है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">आवश्यक दवाइयाँ व उपकरण *</label>
                  <select value={healthMedicine} onChange={(e) => setHealthMedicine(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, पर्याप्त">हाँ, पर्याप्त</option>
                    <option value="आंशिक रूप से उपलब्ध">आंशिक रूप से उपलब्ध</option>
                    <option value="उपलब्ध नहीं">उपलब्ध नहीं</option>
                    <option value="जानकारी नहीं है">जानकारी नहीं है</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">चिकित्सा स्टाफ उपस्थिति *</label>
                  <select value={healthStaff} onChange={(e) => setHealthStaff(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, नियमित रूप से">हाँ, नियमित रूप से</option>
                    <option value="कभी-कभी">कभी-कभी</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">चिकित्सालय में प्रमुख कमी *</label>
                <select value={healthDeficiency} onChange={(e) => setHealthDeficiency(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                  <option value="दवाइयों की समय पर आपूर्ति नहीं">दवाइयों की समय पर आपूर्ति नहीं</option>
                  <option value="डॉक्टर / एमबीबीएस पद रिक्त">डॉक्टर / एमबीबीएस पद रिक्त</option>
                  <option value="एंटीवेनम व इमरजेंसी इंजेक्शन अनुपलब्ध">एंटीवेनम व इमरजेंसी इंजेक्शन अनुपलब्ध</option>
                  <option value="एम्बुलेंस सुविधा का अभाव">एम्बुलेंस सुविधा का अभाव</option>
                  <option value="कोई विशेष कमी नहीं">कोई विशेष कमी नहीं</option>
                </select>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center text-xs uppercase">
                <Baby className="w-4 h-4 mr-1.5 text-indigo-600" /> आंगनबाड़ी केंद्र (AWC) स्थिति *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium">नियमित संचालन? *</label>
                  <select value={awcOperation} onChange={(e) => setAwcOperation(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, नियमित रूप से">हाँ, नियमित रूप से</option>
                    <option value="कभी-कभी">कभी-कभी</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">पोषण आहार नियमित? *</label>
                  <select value={awcNutrition} onChange={(e) => setAwcNutrition(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, नियमित रूप से">हाँ, नियमित रूप से</option>
                    <option value="कभी-कभी">कभी-कभी</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">आंगनबाड़ी केंद्र में प्रमुख कमी *</label>
                <select value={awcDeficiency} onChange={(e) => setAwcDeficiency(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                  <option value="स्वयं का पक्का भवन नहीं">स्वयं का पक्का भवन नहीं</option>
                  <option value="पेयजल एवं शौचालय की कमी">पेयजल एवं शौचालय की कमी</option>
                  <option value="वजन मशीन व ग्रोथ चार्ट अनुपलब्ध">वजन मशीन व ग्रोथ चार्ट अनुपलब्ध</option>
                  <option value="कोई कमी नहीं">कोई कमी नहीं</option>
                </select>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center text-xs uppercase">
                <Briefcase className="w-4 h-4 mr-1.5 text-amber-600" /> आजीविका, प्रशिक्षण व आवास *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-medium">पशु चिकित्सक आगमन? *</label>
                  <select value={vetDoctorVisits} onChange={(e) => setVetDoctorVisits(e.target.value)} className="w-full p-2 border rounded bg-white">
                    <option value="हाँ, नियमित रूप से">हाँ, नियमित रूप से</option>
                    <option value="कभी-कभी">कभी-कभी</option>
                    <option value="नहीं">नहीं</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">बेरोजगार युवा (18-45 वर्ष) *</label>
                  <select value={unemployedYouth} onChange={(e) => setUnemployedYouth(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                    <option value="0 से 10 युवा">0 से 10 युवा</option>
                    <option value="11-25 युवा">11 से 25 युवा</option>
                    <option value="26-50 युवा">26 से 50 युवा</option>
                    <option value="50 से अधिक युवा">50 से अधिक युवा</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">अस्वीकृत/अपूर्ण आवास संख्या *</label>
                  <select value={pendingHouses} onChange={(e) => setPendingHouses(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                    <option value="कोई नहीं (0)">कोई नहीं (0)</option>
                    <option value="1-5 आवास">1 से 5 आवास</option>
                    <option value="6-15 आवास">6 से 15 आवास</option>
                    <option value="15 से अधिक">15 से अधिक आवास</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block mb-1 font-medium">आवश्यक प्रशिक्षण 1 *</label>
                  <select value={training1} onChange={(e) => setTraining1(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                    <option value="कृषि एवं जैविक खाद उत्पादन">कृषि एवं जैविक खाद उत्पादन</option>
                    <option value="मशरूम उत्पादन एवं प्रसंस्करण">मशरूम उत्पादन एवं प्रसंस्करण</option>
                    <option value="लाख पालन एवं वनोपज संग्रहण">लाख पालन एवं वनोपज संग्रहण</option>
                    <option value="सिलाई एवं हस्तशिल्प कढ़ाई">सिलाई एवं हस्तशिल्प कढ़ाई</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">आवश्यक प्रशिक्षण 2 *</label>
                  <select value={training2} onChange={(e) => setTraining2(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                    <option value="सौर ऊर्जा एवं विद्युत उपकरण मरम्मत">सौर ऊर्जा एवं विद्युत उपकरण मरम्मत</option>
                    <option value="मोटर पंप व हैंडपंप मरम्मत">मोटर पंप व हैंडपंप मरम्मत</option>
                    <option value="ड्राइविंग एवं भारी वाहन संचालन">ड्राइविंग एवं भारी वाहन संचालन</option>
                    <option value="कंप्यूटर एवं ऑनलाइन सेवा केंद्र">कंप्यूटर एवं ऑनलाइन सेवा केंद्र</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-200">
              <div>
                <h3 className="font-bold text-blue-900 text-xs uppercase">आधारभूत संरचना अंतराल मैट्रिक्स (GAP MATRIX) *</h3>
                <p className="text-[11px] text-blue-700">
                  संख्या दर्ज करें। <strong>अंतराल (Gap)</strong> स्वतः (आवश्यकता - कार्यात्मक) के अनुसार कैलकुलेट होगा।
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b font-semibold text-slate-700">
                  <tr>
                    <th className="p-2 border-r">आधारभूत संरचना / गतिविधि</th>
                    <th className="p-2 border-r w-24 text-center">मौजूदा *</th>
                    <th className="p-2 border-r w-24 text-center">कार्यात्मक *</th>
                    <th className="p-2 border-r w-24 text-center">अकार्यशील *</th>
                    <th className="p-2 border-r w-24 text-center">कुल आवश्यकता *</th>
                    <th className="p-2 w-28 text-center bg-amber-100/70 font-bold">अंतराल (Auto Gap)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {DEFAULT_GAP_ITEMS.map((item) => (
                    <tr key={item} className="hover:bg-slate-50">
                      <td className="p-2 font-medium border-r">{item}</td>
                      <td className="p-1 border-r">
                        <input
                          type="number"
                          min={0}
                          className="w-full p-1 border rounded text-center font-medium"
                          value={gapMatrix[item]?.current}
                          onChange={(e) => handleMatrixChange(item, 'current', e.target.value)}
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input
                          type="number"
                          min={0}
                          className="w-full p-1 border rounded text-center text-emerald-700 font-bold"
                          value={gapMatrix[item]?.functional}
                          onChange={(e) => handleMatrixChange(item, 'functional', e.target.value)}
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input
                          type="number"
                          min={0}
                          className="w-full p-1 border rounded text-center text-rose-600 font-bold"
                          value={gapMatrix[item]?.nonFunctional}
                          onChange={(e) => handleMatrixChange(item, 'nonFunctional', e.target.value)}
                        />
                      </td>
                      <td className="p-1 border-r">
                        <input
                          type="number"
                          min={0}
                          className="w-full p-1 border rounded text-center text-blue-700 font-bold"
                          value={gapMatrix[item]?.required}
                          onChange={(e) => handleMatrixChange(item, 'required', e.target.value)}
                        />
                      </td>
                      <td className="p-1 text-center bg-amber-50 font-bold text-amber-900 border">
                        {gapMatrix[item]?.gap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Navigation & Submit */}
        <div className="flex items-center justify-between border-t pt-4">
          {activeTab !== 'admin' ? (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'matrix' ? 'quality' : 'admin')}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              ← पिछला चरण
            </button>
          ) : <div />}

          {activeTab !== 'matrix' ? (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'admin' ? 'quality' : 'matrix')}
              className="px-5 py-2 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 cursor-pointer"
            >
              अगला चरण →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer shadow-xs flex items-center"
            >
              ग्राम प्रोफाइल सुरक्षित करें एवं डैशबोर्ड खोलें
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};