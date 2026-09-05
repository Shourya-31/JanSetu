import React, { useState } from 'react';
import { VillageProfileForm } from './VillageProfileForm';
import { VillageProfileDashboard } from './VillageProfileDashboard';
import { HouseholdSurveyModal } from './HouseholdSurveyModal';
import { HouseholdAnalyticsDashboard } from './HouseholdAnalyticsDashboard';
import { 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  LayoutGrid, 
  ArrowLeft, 
  Search,
  RotateCcw
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
  
  // Filter & Search Controls
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  // 2. Save Household Survey
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

  // 3. Edge Case 5: Single Household Reset Handler
  const handleResetHousehold = (houseNumber: number) => {
    const isConfirmed = window.confirm(
      `⚠️ क्या आप मकान #${houseNumber} का सर्वेक्षण डेटा रीसेट करना चाहते हैं?\nयह कार्ड पुनः लाल (लंबित) हो जाएगा और पूर्व डेटा हटा दिया जाएगा।`
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

  // Filter & Search Logic
  const filteredHouses = households.filter((h) => {
    if (filter === 'completed' && !h.isCompleted) return false;
    if (filter === 'pending' && h.isCompleted) return false;
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      const matchesNum = String(h.houseNumber).includes(query);
      const matchesName = h.headName ? h.headName.toLowerCase().includes(query) : false;
      return matchesNum || matchesName;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-hindi pb-16">
      
      {/* Top Bar */}
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
        {/* Step 1: Fill Village Profile if not completed */}
        {!villageData ? (
          <VillageProfileForm onComplete={handleVillageProfileSubmitted} />
        ) : viewMode === 'profile_dashboard' ? (
          /* Step 2: View Complete Village Analytics Dashboard */
          <VillageProfileDashboard
            villageData={villageData}
            onOpenHouseholdGrid={() => setViewMode('grid')}
            onEditProfile={() => setVillageData(null)}
          />
        ) : (
          /* Step 3: Interactive Household Status Grid */
          <div className="space-y-5">
            {/* Village Status Bar */}
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

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  सभी मकान ({households.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    filter === 'pending' ? 'bg-rose-600 text-white' : 'bg-white border text-rose-700 hover:bg-slate-50'
                  }`}
                >
                  लंबित ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    filter === 'completed' ? 'bg-emerald-700 text-white' : 'bg-white border text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  पूर्ण ({completedCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="मकान # या मुखिया का नाम..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Dynamic Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredHouses.map((h) => {
                const isDone = h.isCompleted;
                return (
                  <div
                    key={h.houseNumber}
                    onClick={() => {
                      setActiveModalHouse(h.houseNumber);
                      setIsEditingExisting(false); // Default to Read-Only Analytics View
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
                          <p className="text-[11px] text-emerald-800 font-semibold">✓ सत्यापित देखें</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-rose-900">खाली</p>
                          <p className="text-[11px] text-rose-600 font-medium">सर्वे करें →</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Household Survey Modal or Analytics Dashboard */}
      {activeModalHouse !== null && (
        (() => {
          const currentHouse = households.find((h) => h.houseNumber === activeModalHouse);
          const isCompleted = currentHouse?.isCompleted;

          // Edge Case 4: If completed and NOT in explicit editing mode -> Show Read-Only Dashboard
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

          // Otherwise (Pending House OR Explicit Edit mode) -> Show Form Modal
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