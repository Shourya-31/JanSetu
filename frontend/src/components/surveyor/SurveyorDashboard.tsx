import React, { useState } from 'react';
import { VillageProfileDashboard } from './VillageProfileDashboard';
import { HouseholdSurveyModal } from './HouseholdSurveyModal';
import { HouseholdAnalyticsDashboard } from './HouseholdAnalyticsDashboard';
import { VillageSurveyForm } from './village-survey/VillageSurveyForm.tsx';
import { CENSUS_HIERARCHY } from '../../data/narayanpurHierarchy';
import type { Village } from '../../data/narayanpurHierarchy';
import { 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  ArrowLeft, 
  Search
} from 'lucide-react';

interface HouseholdItem {
  houseNumber: number;
  isCompleted: boolean;
  headName?: string;
  data?: any;
}

export const SurveyorDashboard: React.FC<{ surveyorId: string; onLogout: () => void }> = ({
  surveyorId,
  onLogout,
}) => {
  // Navigation & Village State
  const [villageData, setVillageData] = useState<any>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [viewMode, setViewMode] = useState<'selection' | 'village_menu' | 'village_survey' | 'profile_dashboard' | 'grid'>('selection');

  const selectedBlock = CENSUS_HIERARCHY.find((block) => block.id === selectedBlockId);
  const panchayatOptions = selectedBlock?.panchayats ?? [];
  const selectedPanchayat = panchayatOptions.find((panchayat) => panchayat.id === selectedPanchayatId);
  const villageOptions = selectedPanchayat?.villages ?? [];
  
  // Grid & Modal State
  const [households, setHouseholds] = useState<HouseholdItem[]>([]);
  const [activeModalHouse, setActiveModalHouse] = useState<number | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);
  
  // Search & Deep Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [schemeDeficitFilter, setSchemeDeficitFilter] = useState<string>('all');
  const [casteFilter, setCasteFilter] = useState<string>('all');

  // 1. Block → Gram Panchayat → Village selection
  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBlockId(e.target.value);
    setSelectedPanchayatId('');
    setSelectedVillage(null);
  };

  const handlePanchayatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPanchayatId(e.target.value);
    setSelectedVillage(null);
  };

  const handleVillageSelect = (village: Village) => {
    setSelectedVillage(village);
    setViewMode('village_menu');
  };

  // 2. Save Household Survey Form
  const handleSaveHousehold = (houseNumber: number, formData: any) => {
    setHouseholds((prev) =>
      prev.map((h) =>
        h.houseNumber === houseNumber
          ? { ...h, isCompleted: true, headName: formData.headName, data: formData }
          : h
      )
    );
    setIsEditingExisting(false);
    setActiveModalHouse(null);
  };

  // 3. Reset Individual Household Card
  const handleResetHousehold = (houseNumber: number) => {
    const isConfirmed = window.confirm(
      `⚠️ क्या आप मकान #${houseNumber} का सर्वेक्षण डेटा रीसेट करना चाहते हैं?\nयह कार्ड पुनः लाल (लंबित) हो जाएगा।`
    );
    if (isConfirmed) {
      setHouseholds((prev) =>
        prev.map((h) =>
          h.houseNumber === houseNumber
            ? { houseNumber, isCompleted: false, headName: undefined, data: undefined }
            : h
        )
      );
      setIsEditingExisting(false);
      setActiveModalHouse(null);
    }
  };

  // Counters
  const completedCount = households.filter((h) => h.isCompleted).length;
  const pendingCount = households.length - completedCount;

  // Search & Multi-Filter Logic
  const filteredHouseholds = households.filter((h) => {
    // A. Status Filter
    if (statusTab === 'completed' && !h.isCompleted) return false;
    if (statusTab === 'pending' && h.isCompleted) return false;

    // B. Text Search (House Number OR Head Name OR Mobile)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = String(h.houseNumber).includes(q) || `#${h.houseNumber}`.includes(q);
      const matchName = h.headName ? h.headName.toLowerCase().includes(q) : false;
      const matchMobile = h.data?.mobile ? h.data.mobile.includes(q) : false;
      if (!matchNum && !matchName && !matchMobile) return false;
    }

    // C. Caste Filter
    if (casteFilter !== 'all') {
      if (!h.isCompleted || h.data?.caste !== casteFilter) return false;
    }

    // D. Scheme / Deficit Filter
    if (schemeDeficitFilter !== 'all' && h.isCompleted) {
      if (schemeDeficitFilter === 'no_ration' && h.data?.hasRationCard === 'हां') return false;
      if (schemeDeficitFilter === 'no_toilet' && h.data?.hasToilet === 'हां') return false;
      if (schemeDeficitFilter === 'no_tap_water' && h.data?.hasTapWater === 'हां') return false;
      if (schemeDeficitFilter === 'no_pmay' && h.data?.hasGovtHousing === 'हां') return false;
      if (schemeDeficitFilter === 'unemployed' && Number(h.data?.unemployedCount || 0) === 0) return false;
      if (
        schemeDeficitFilter === 'missing_docs' &&
        Number(h.data?.missingAadhaar || 0) + Number(h.data?.missingAyushman || 0) === 0
      ) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-hindi pb-16">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
            DMFT
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">सर्वेक्षक कार्यक्षेत्र</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">आईडी: {surveyorId}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-xs border px-3 py-1.5 rounded-md hover:bg-slate-100 flex items-center cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-1 text-slate-600" /> लॉग आउट
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        {viewMode === 'selection' ? (
          <div className="space-y-5">
            <div className="bg-white border rounded-xl p-5 shadow-2xs">
              <div className="mb-4">
                <span className="text-xs font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ग्राम चयन
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  पहले विकासखंड एवं ग्राम पंचायत चुनें
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ग्राम पंचायत चुनने के बाद उसके अंतर्गत आने वाले सभी प्रभावित ग्राम नीचे दिखाई देंगे।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">विकासखंड *</label>
                  <select
                    value={selectedBlockId}
                    onChange={handleBlockChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- विकासखंड चुनें --</option>
                    {CENSUS_HIERARCHY.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.blockName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ग्राम पंचायत *</label>
                  <select
                    disabled={!selectedBlock}
                    value={selectedPanchayatId}
                    onChange={handlePanchayatChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- ग्राम पंचायत चुनें --</option>
                    {panchayatOptions.map((panchayat) => (
                      <option key={panchayat.id} value={panchayat.id}>
                        {panchayat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedPanchayat && (
              <div className="bg-white border rounded-xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      उपलब्ध ग्राम
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {selectedPanchayat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedPanchayat.villages.length} ग्राम उपलब्ध हैं
                    </p>
                  </div>
                </div>

                {villageOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {villageOptions.map((village) => {
                      const isSelected = selectedVillage?.id === village.id;
                      return (
                        <button
                          type="button"
                          key={village.id}
                          onClick={() => handleVillageSelect(village)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer hover:-translate-y-0.5 shadow-2xs ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                              : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-slate-900 truncate">
                                {village.nameHindi}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                {village.nameEnglish}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-3">
                            {village.action === 'Direct Affected'
                              ? 'प्रत्यक्ष प्रभावित'
                              : village.action === 'Indirect Affected'
                                ? 'अप्रत्यक्ष प्रभावित'
                                : 'प्रत्यक्ष एवं अप्रत्यक्ष प्रभावित'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-xl">
                    <p className="text-sm font-bold text-slate-700">इस ग्राम पंचायत में कोई ग्राम उपलब्ध नहीं है।</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : viewMode === 'village_menu' && selectedVillage ? (
          <div className="space-y-5">
            <div className="bg-white border rounded-xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    चयनित ग्राम
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {selectedVillage.nameHindi}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedVillage.nameEnglish} • {selectedPanchayat?.name} • {selectedBlock?.blockName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVillage(null);
                    setViewMode('selection');
                  }}
                  className="px-3.5 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-600" /> गाँवों की सूची
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setViewMode('village_survey')}
                className="bg-white border rounded-xl p-6 text-left shadow-2xs hover:-translate-y-0.5 hover:border-emerald-400 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">ग्राम सर्वे</h3>
                <p className="text-xs text-slate-500 mt-1">ग्राम का परिचय, सुविधाएँ एवं अंतराल मैट्रिक्स</p>
              </button>

              <button
                type="button"
                onClick={() => alert('हाउसहोल्ड सर्वे विकल्प अगला चरण में जोड़ा जाएगा।')}
                className="bg-white border rounded-xl p-6 text-left shadow-2xs hover:-translate-y-0.5 hover:border-blue-400 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900">हाउसहोल्ड सर्वे</h3>
                <p className="text-xs text-slate-500 mt-1">गाँव के प्रत्येक परिवार का सर्वेक्षण</p>
              </button>

              <button
                type="button"
                onClick={() => alert('रिपोर्ट विकल्प अगला चरण में जोड़ा जाएगा।')}
                className="bg-white border rounded-xl p-6 text-left shadow-2xs hover:-translate-y-0.5 hover:border-amber-400 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900">रिपोर्ट्स</h3>
                <p className="text-xs text-slate-500 mt-1">ग्राम सर्वे एवं हाउसहोल्ड सर्वे की रिपोर्ट</p>
              </button>
            </div>
          </div>
        ) : viewMode === 'village_survey' && selectedVillage ? (
          <VillageSurveyForm
            village={selectedVillage}
            blockName={selectedBlock?.blockName ?? ''}
            panchayatName={selectedPanchayat?.name ?? ''}
            onBack={() => setViewMode('village_menu')}
            onComplete={(data) => {
              const totalHouseholds = Number(data.totalHouseholds) || 0;
              setHouseholds(
                Array.from({ length: totalHouseholds }, (_, index) => ({
                  houseNumber: index + 1,
                  isCompleted: false,
                }))
              );
              setVillageData({
                ...data,
                district: 'नारायणपुर',
                block: selectedBlock?.blockName,
                panchayat: selectedPanchayat?.name,
                villageName: selectedVillage.nameHindi,
              });
              setViewMode('profile_dashboard');
            }}
          />
        ) : viewMode === 'profile_dashboard' ? (
          <VillageProfileDashboard
            villageData={villageData}
            onOpenHouseholdGrid={() => setViewMode('grid')}
            onEditProfile={() => {
              setVillageData(null);
              setSelectedVillage(null);
              setViewMode('selection');
            }}
          />
        ) : (
          <div className="space-y-5">
            <div className="bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  वर्तमान सक्रिय ग्राम
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  ग्राम: {villageData.villageName} ({villageData.panchayat}, {villageData.block})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  कुल परिवार आवंटन: <strong className="text-slate-800">{villageData.totalHouseholds}</strong> | कुल जनसंख्या: <strong className="text-slate-800">{villageData.totalPopulation}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setViewMode('profile_dashboard')} className="px-3.5 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center cursor-pointer transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-600" /> ग्राम विवरण देखें
                </button>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold">पूर्ण: {completedCount}</div>
                <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-bold">लंबित: {pendingCount}</div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                  <button type="button" onClick={() => setStatusTab('all')} className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${statusTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>सभी मकान ({households.length})</button>
                  <button type="button" onClick={() => setStatusTab('completed')} className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${statusTab === 'completed' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'}`}><span>✓ भरे हुए (पूर्ण)</span><span className="text-[11px] px-1.5 py-0.2 bg-emerald-900/30 text-white rounded-full">{completedCount}</span></button>
                  <button type="button" onClick={() => setStatusTab('pending')} className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${statusTab === 'pending' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'}`}><span>✕ छूटे हुए (लंबित)</span><span className="text-[11px] px-1.5 py-0.2 bg-rose-900/30 text-white rounded-full">{pendingCount}</span></button>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="text" placeholder="मकान #, मुखिया का नाम, या फ़ोन..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-8 py-1.5 text-xs border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-all font-medium" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2"><span className="text-slate-500 shrink-0 font-medium">वंचित योजना:</span><select value={schemeDeficitFilter} onChange={(e) => setSchemeDeficitFilter(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded-md font-medium text-slate-800 focus:bg-white"><option value="all">-- सभी परिवार --</option><option value="no_ration">राशन कार्ड नहीं है (वंचित)</option><option value="no_toilet">शौचालय नहीं है (खुले में शौच)</option><option value="no_tap_water">नल जल कनेक्शन नहीं है</option><option value="no_pmay">पक्का आवास नहीं मिला</option><option value="unemployed">बेरोजगार युवा वाले परिवार</option><option value="missing_docs">आधार/आयुष्मान कार्ड की कमी</option></select></div>
                <div className="flex items-center space-x-2"><span className="text-slate-500 shrink-0 font-medium">सामाजिक वर्ग:</span><select value={casteFilter} onChange={(e) => setCasteFilter(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded-md font-medium text-slate-800 focus:bg-white"><option value="all">-- सभी वर्ग --</option><option value="अनुसूचित जनजाति">अनुसूचित जनजाति (ST)</option><option value="अबूझमाड़िया अनुसूचित जनजाति">अबूझमाड़िया (PVTG)</option><option value="अनुसूचित जाति">अनुसूचित जाति (SC)</option><option value="अन्य पिछड़ा वर्ग">अन्य पिछड़ा वर्ग (OBC)</option><option value="सामान्य">सामान्य (General)</option></select></div>
              </div>
            </div>

            {filteredHouseholds.length === 0 ? (
              <div className="bg-white border border-dashed rounded-xl p-8 text-center space-y-2"><p className="text-sm font-bold text-slate-700">कोई मकान नहीं मिला!</p><p className="text-xs text-slate-400">चयनित फ़िल्टर या खोज के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।</p></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredHouseholds.map((h) => {
                  const isDone = h.isCompleted;
                  return <div key={h.houseNumber} onClick={() => { setActiveModalHouse(h.houseNumber); setIsEditingExisting(false); }} className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:-translate-y-0.5 shadow-2xs ${isDone ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-100/60' : 'bg-rose-50/50 border-rose-300 hover:bg-rose-100/60'}`}><div className="flex justify-between items-center"><span className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${isDone ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'}`}>#{h.houseNumber}</span>{isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}</div><div className="mt-2 text-xs">{isDone ? <div><p className="font-bold text-slate-900 truncate">{h.headName}</p><p className="text-[10px] text-slate-500 truncate">{h.data?.caste}</p><p className="text-[11px] text-emerald-800 font-semibold mt-0.5">✓ विवरण देखें</p></div> : <div><p className="font-semibold text-rose-900">लंबित</p><p className="text-[11px] text-rose-600 font-medium">सर्वे करें →</p></div>}</div></div>;
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Conditional Modal / Dashboard Switching */}
      {activeModalHouse !== null && (
        (() => {
          const currentHouse = households.find((h) => h.houseNumber === activeModalHouse);
          const isCompleted = currentHouse?.isCompleted;

          // If Completed and NOT in edit mode: Show Read-Only Dashboard
          if (isCompleted && !isEditingExisting) {
            return (
              <HouseholdAnalyticsDashboard
                houseNumber={activeModalHouse}
                villageName={villageData.villageName}
                data={currentHouse?.data}
                onBackToGrid={() => setActiveModalHouse(null)}
                onEdit={() => setIsEditingExisting(true)}
                onReset={() => handleResetHousehold(activeModalHouse)}
              />
            );
          }

          // If Pending OR explicitly clicked Edit: Show Survey Modal
          return (
            <HouseholdSurveyModal
              houseNumber={activeModalHouse}
              villageName={villageData.villageName}
              panchayatName={villageData.panchayat}
              blockName={villageData.block}
              existingData={currentHouse?.data}
              onClose={() => {
                setIsEditingExisting(false);
                setActiveModalHouse(null);
              }}
              onSave={handleSaveHousehold}
            />
          );
        })()
      )}

    </div>
  );
};