import React, { useState, useMemo } from 'react';
import { CENSUS_HIERARCHY } from '../data/narayanpurHierarchy';
import { ArrowRight, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface VillageProfileFormProps {
  onComplete: (data: any) => void;
}

export const VillageProfileForm: React.FC<VillageProfileFormProps> = ({ onComplete }) => {
  // Cascading Selection State
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  // Form Fields
  const [totalPopulation, setTotalPopulation] = useState<string>('');
  const [totalHouseholds, setTotalHouseholds] = useState<string>('');
  const [scCount, setScCount] = useState<string>('');
  const [stCount, setStCount] = useState<string>('');
  
  // Validation Error State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Infrastructure Options
  const [hasPuccaRoad, setHasPuccaRoad] = useState<string>('हां');
  const [monsoonCutOff, setMonsoonCutOff] = useState<string>('नहीं');
  const [school, setSchool] = useState<string>('प्राथमिक विद्यालय');
  const [hospital, setHospital] = useState<string>('उप-स्वास्थ्य केंद्र (SHC)');
  const [electrification, setElectrification] = useState<string>('पूर्णतः विद्युतीकृत');

  // 1. Current Block Object
  const currentBlockData = useMemo(() => {
    return CENSUS_HIERARCHY.find((b) => b.blockName === selectedBlock);
  }, [selectedBlock]);

  // 2. Panchayats in selected block
  const panchayatOptions = useMemo(() => {
    return currentBlockData ? currentBlockData.panchayats : [];
  }, [currentBlockData]);

  // 3. Current Panchayat Object
  const currentPanchayatData = useMemo(() => {
    return panchayatOptions.find((p) => p.name === selectedPanchayat);
  }, [panchayatOptions, selectedPanchayat]);

  // 4. Villages in selected panchayat
  const villageOptions = useMemo(() => {
    return currentPanchayatData ? currentPanchayatData.villages : [];
  }, [currentPanchayatData]);

  // Block change handler
  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBlock(e.target.value);
    setSelectedPanchayat('');
    setSelectedVillage('');
    setTotalPopulation('');
    setTotalHouseholds('');
    setErrorMsg(null);
  };

  // Panchayat change handler
  const handlePanchayatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPanchayat(e.target.value);
    setSelectedVillage('');
    setTotalPopulation('');
    setTotalHouseholds('');
    setErrorMsg(null);
  };

  // Village change handler (Auto-fill population from document data)
  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vilName = e.target.value;
    setSelectedVillage(vilName);
    setErrorMsg(null);

    const foundVillage = villageOptions.find((v) => v.nameHindi === vilName);
    if (foundVillage) {
      const pop = foundVillage.population;
      setTotalPopulation(String(pop));
      // Auto-suggest approx 4-5 persons per household
      if (pop > 0) {
        setTotalHouseholds(String(Math.max(1, Math.round(pop / 4.5))));
      } else {
        setTotalHouseholds('0');
      }
    } else {
      setTotalPopulation('');
      setTotalHouseholds('');
    }
  };

  // Real-time Validation: Households <= Population
  const handleHouseholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTotalHouseholds(val);

    const houses = Number(val);
    const pop = Number(totalPopulation);

    if (pop > 0 && houses > pop) {
      setErrorMsg(`त्रुटि: कुल परिवार (${houses}) गाँव की कुल जनसंख्या (${pop}) से अधिक नहीं हो सकते!`);
    } else {
      setErrorMsg(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBlock || !selectedPanchayat || !selectedVillage) {
      alert('कृपया विकासखंड, ग्राम पंचायत और ग्राम का चयन करें');
      return;
    }

    const houses = Number(totalHouseholds);
    const pop = Number(totalPopulation);

    if (isNaN(houses) || houses <= 0) {
      alert('कृपया कुल परिवारों की वैध संख्या दर्ज करें (कम से कम 1)');
      return;
    }

    // Strict Validation Check
    if (pop > 0 && houses > pop) {
      alert(`अमान्य प्रविष्टि: परिवारों की संख्या (${houses}) कुल जनसंख्या (${pop}) से अधिक नहीं हो सकती।`);
      return;
    }

    onComplete({
      district: 'नारायणपुर',
      block: selectedBlock,
      panchayat: selectedPanchayat,
      villageName: selectedVillage,
      totalPopulation: pop || 0,
      totalHouseholds: houses,
      scCount,
      stCount,
      hasPuccaRoad,
      monsoonCutOff,
      school,
      hospital,
      electrification,
    });
  };

  const popNum = Number(totalPopulation) || 0;
  const houseNum = Number(totalHouseholds) || 0;

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 font-hindi">
      <div className="border-b pb-4 mb-6">
        <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
          सर्वेक्षक प्रपत्र • ग्राम चयन एवं विवरण
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center">
          <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
          ग्राम परिचय या ग्राम का विवरण
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          पहले अपने आवंटित विकासखंड, पंचायत एवं ग्राम का चयन करें।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        
        {/* Step 1: Cascading Hierarchy Selection */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-800 text-xs uppercase mb-3">
            1. प्रशासनिक क्षेत्र का चयन करें (Cascading Selection)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Block Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                विकासखंड (Block) *
              </label>
              <select
                required
                value={selectedBlock}
                onChange={handleBlockChange}
                className="w-full px-3 py-2 bg-white border rounded-md text-xs font-medium focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">-- विकासखंड चुनें --</option>
                {CENSUS_HIERARCHY.map((b) => (
                  <option key={b.blockName} value={b.blockName}>
                    {b.blockName}
                  </option>
                ))}
              </select>
            </div>

            {/* Panchayat Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ग्राम पंचायत *
              </label>
              <select
                required
                disabled={!selectedBlock}
                value={selectedPanchayat}
                onChange={handlePanchayatChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-xs font-medium focus:ring-2 focus:ring-emerald-600 ${
                  !selectedBlock ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                }`}
              >
                <option value="">-- ग्राम पंचायत चुनें --</option>
                {panchayatOptions.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ग्राम का नाम *
              </label>
              <select
                required
                disabled={!selectedPanchayat}
                value={selectedVillage}
                onChange={handleVillageChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 ${
                  !selectedPanchayat ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                }`}
              >
                <option value="">-- ग्राम चुनें --</option>
                {villageOptions.map((v) => (
                  <option key={v.nameHindi} value={v.nameHindi}>
                    {v.nameHindi} ({v.nameEnglish})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Population & Households */}
        <div>
          <h3 className="font-bold text-slate-800 text-xs uppercase mb-3">
            2. जनसांख्यिकी एवं परिवार आवंटन
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">कुल जनसंख्या</label>
              <input
                type="number"
                readOnly
                value={totalPopulation}
                placeholder="उदा. 531"
                className="w-full px-3 py-2 border rounded-md text-xs bg-slate-100 font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">अनुसूचित जाति (SC)</label>
              <input
                type="number"
                value={scCount}
                onChange={(e) => setScCount(e.target.value)}
                placeholder="संख्या दर्ज करें"
                className="w-full px-3 py-2 border rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">अनुसूचित जनजाति (ST)</label>
              <input
                type="number"
                value={stCount}
                onChange={(e) => setStCount(e.target.value)}
                placeholder="संख्या दर्ज करें"
                className="w-full px-3 py-2 border rounded-md text-xs"
              />
            </div>
            
            {/* Key Field: Households Count with Validation */}
            <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-amber-900">
                  कुल परिवार (Households) *
                </label>
                {popNum > 0 && (
                  <span className="text-[10px] text-amber-700">अधिकतम: {popNum}</span>
                )}
              </div>
              <input
                type="number"
                min={1}
                max={popNum > 0 ? popNum : undefined}
                required
                value={totalHouseholds}
                onChange={handleHouseholdChange}
                placeholder="उदा. 24"
                className="w-full px-3 py-1.5 bg-white border border-amber-400 rounded-md font-bold text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Validation Feedback Messages */}
          {selectedVillage && (
            <div className="mt-3">
              {errorMsg ? (
                <div className="flex items-center space-x-2 p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              ) : houseNum > 0 && popNum > 0 ? (
                <div className="flex items-center space-x-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    वैध प्रविष्टि: प्रति परिवार औसतन <strong>{(popNum / houseNum).toFixed(1)}</strong> सदस्य होंगे।
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Step 3: Infrastructure */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-800 text-xs uppercase mb-3">3. बुनियादी सुविधाएँ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">पक्की सड़क से जुड़ा है?</label>
              <select
                value={hasPuccaRoad}
                onChange={(e) => setHasPuccaRoad(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-md text-xs"
              >
                <option value="हां">हां</option>
                <option value="नहीं">नहीं</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">बारिश में संपर्क कट जाता है?</label>
              <select
                value={monsoonCutOff}
                onChange={(e) => setMonsoonCutOff(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-md text-xs"
              >
                <option value="हां">हां</option>
                <option value="नहीं">नहीं</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">विद्यालय</label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-md text-xs"
              >
                <option value="प्राथमिक विद्यालय">प्राथमिक विद्यालय</option>
                <option value="उच्च प्राथमिक विद्यालय">उच्च प्राथमिक विद्यालय</option>
                <option value="हाई स्कूल">हाई स्कूल</option>
                <option value="नहीं हैं">नहीं हैं</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="submit"
            disabled={!selectedVillage || !totalHouseholds || Boolean(errorMsg)}
            className={`w-full py-3 text-white rounded-md font-bold text-sm flex items-center justify-center transition-all ${
              !selectedVillage || !totalHouseholds || Boolean(errorMsg)
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-xs'
            }`}
          >
            {selectedVillage
              ? `ग्राम "${selectedVillage}" हेतु ${totalHouseholds || 0} परिवारों का ग्रिड तैयार करें`
              : 'कृपया पहले ग्राम का चयन करें'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};