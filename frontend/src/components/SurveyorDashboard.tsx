import React, { useState } from 'react';
import { VillageProfileForm } from './VillageProfileForm';
import { VillageProfileDashboard } from './VillageProfileDashboard';
import { HouseholdSurveyModal } from './HouseholdSurveyModal';
import { HouseholdAnalyticsDashboard } from './HouseholdAnalyticsDashboard';
import { 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  ArrowLeft, 
  Search,
  Filter
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
  const [viewMode, setViewMode] = useState<'profile_dashboard' | 'grid'>('profile_dashboard');
  
  // Grid & Modal State
  const [households, setHouseholds] = useState<HouseholdItem[]>([]);
  const [activeModalHouse, setActiveModalHouse] = useState<number | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);
  
  // Search & Deep Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [schemeDeficitFilter, setSchemeDeficitFilter] = useState<string>('all');
  const [casteFilter, setCasteFilter] = useState<string>('all');

  // 1. Handle Village Profile Submission
  const handleVillageProfileSubmitted = (data: any) => {
    setVillageData(data);
    const count = Number(data.totalHouseholds) || 24;
    const initialHouses: HouseholdItem[] = Array.from({ length: count }, (_, i) => ({
      houseNumber: i + 1,
      isCompleted: false,
    }));
    setHouseholds(initialHouses);
    setViewMode('profile_dashboard');
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
        
        {/* Step 1: Village Profile Entry Form */}
        {!villageData ? (
          <VillageProfileForm onComplete={handleVillageProfileSubmitted} />
        ) : viewMode === 'profile_dashboard' ? (
          /* Step 2: Village Analytics Dashboard */
          <VillageProfileDashboard
            villageData={villageData}
            onOpenHouseholdGrid={() => setViewMode('grid')}
            onEditProfile={() => setVillageData(null)}
          />
        ) : (
          /* Step 3: Interactive Household Grid with Deep Filters */
          <div className="space-y-5">
            
            {/* Active Village Info Banner */}
            <div className="bg-white border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  वर्तमान सक्रिय ग्राम
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  ग्राम: {villageData.villageName} ({villageData.panchayat}, {villageData.block})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  कुल परिवार आवंटन: <strong className="text-slate-800">{villageData.totalHouseholds}</strong> | 
                  कुल जनसंख्या: <strong className="text-slate-800">{villageData.totalPopulation}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setViewMode('profile_dashboard')}
                  className="px-3.5 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-600" /> ग्राम विवरण देखें
                </button>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold">
                  पूर्ण: {completedCount}
                </div>
                <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-bold">
                  लंबित: {pendingCount}
                </div>
              </div>
            </div>

            {/* Search & Deep Filter Control Toolbar */}
            <div className="bg-white border rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Status Tabs */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setStatusTab('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                      statusTab === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    सभी मकान ({households.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusTab('completed')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${
                      statusTab === 'completed'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span>✓ भरे हुए (पूर्ण)</span>
                    <span className="text-[11px] px-1.5 py-0.2 bg-emerald-900/30 text-white rounded-full">
                      {completedCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusTab('pending')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1 ${
                      statusTab === 'pending'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <span>✕ छूटे हुए (लंबित)</span>
                    <span className="text-[11px] px-1.5 py-0.2 bg-rose-900/30 text-white rounded-full">
                      {pendingCount}
                    </span>
                  </button>
                </div>

                {/* Text Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="मकान #, मुखिया का नाम, या फ़ोन..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-xs border rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

              </div>

              {/* Secondary Filter Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 shrink-0 font-medium">वंचित योजना:</span>
                  <select
                    value={schemeDeficitFilter}
                    onChange={(e) => setSchemeDeficitFilter(e.target.value)}
                    className="w-full p-1.5 bg-slate-50 border rounded-md font-medium text-slate-800 focus:bg-white"
                  >
                    <option value="all">-- सभी परिवार --</option>
                    <option value="no_ration">राशन कार्ड नहीं है (वंचित)</option>
                    <option value="no_toilet">शौचालय नहीं है (खुले में शौच)</option>
                    <option value="no_tap_water">नल जल कनेक्शन नहीं है</option>
                    <option value="no_pmay">पक्का आवास नहीं मिला</option>
                    <option value="unemployed">बेरोजगार युवा वाले परिवार</option>
                    <option value="missing_docs">आधार/आयुष्मान कार्ड की कमी</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 shrink-0 font-medium">सामाजिक वर्ग:</span>
                  <select
                    value={casteFilter}
                    onChange={(e) => setCasteFilter(e.target.value)}
                    className="w-full p-1.5 bg-slate-50 border rounded-md font-medium text-slate-800 focus:bg-white"
                  >
                    <option value="all">-- सभी वर्ग --</option>
                    <option value="अनुसूचित जनजाति">अनुसूचित जनजाति (ST)</option>
                    <option value="अबूझमाड़िया अनुसूचित जनजाति">अबूझमाड़िया (PVTG)</option>
                    <option value="अनुसूचित जाति">अनुसूचित जाति (SC)</option>
                    <option value="अन्य पिछड़ा वर्ग">अन्य पिछड़ा वर्ग (OBC)</option>
                    <option value="सामान्य">सामान्य (General)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end">
                  {(searchQuery || statusTab !== 'all' || schemeDeficitFilter !== 'all' || casteFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusTab('all');
                        setSchemeDeficitFilter('all');
                        setCasteFilter('all');
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                    >
                      फ़िल्टर रीसेट करें ↺
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Filtered Grid Cards */}
            {filteredHouseholds.length === 0 ? (
              <div className="bg-white border border-dashed rounded-xl p-8 text-center space-y-2">
                <p className="text-sm font-bold text-slate-700">कोई मकान नहीं मिला!</p>
                <p className="text-xs text-slate-400">
                  चयनित फ़िल्टर या खोज के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredHouseholds.map((h) => {
                  const isDone = h.isCompleted;
                  return (
                    <div
                      key={h.houseNumber}
                      onClick={() => {
                        setActiveModalHouse(h.houseNumber);
                        setIsEditingExisting(false);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:-translate-y-0.5 shadow-2xs ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-100/60'
                          : 'bg-rose-50/50 border-rose-300 hover:bg-rose-100/60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          isDone ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          #{h.houseNumber}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>

                      <div className="mt-2 text-xs">
                        {isDone ? (
                          <div>
                            <p className="font-bold text-slate-900 truncate">{h.headName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{h.data?.caste}</p>
                            <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">✓ विवरण देखें</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-rose-900">लंबित</p>
                            <p className="text-[11px] text-rose-600 font-medium">सर्वे करें →</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
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