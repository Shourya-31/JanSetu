import React, { useState } from 'react';
import { VillageProfileForm } from './VillageProfileForm';
import { VillageProfileDashboard } from './VillageProfileDashboard';
import { HouseholdAnalyticsDashboard } from './HouseholdAnalyticsDashboard';
import { HouseholdSurveyModal } from './HouseholdSurveyModal';
import { CheckCircle2, AlertCircle, LogOut, LayoutGrid, ArrowLeft } from 'lucide-react';

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
  const [villageData, setVillageData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'profile_dashboard' | 'grid'>('profile_dashboard');
  const [households, setHouseholds] = useState<HouseholdItem[]>([]);
  const [activeModalHouse, setActiveModalHouse] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const handleVillageProfileSubmitted = (data: any) => {
    setVillageData(data);
    const count = Number(data.totalHouseholds) || 24;
    const initialHouses: HouseholdItem[] = Array.from({ length: count }, (_, i) => ({
      houseNumber: i + 1,
      isCompleted: false,
    }));
    setHouseholds(initialHouses);
    setViewMode('profile_dashboard'); // Pehle Village Dashboard khulega
  };

  const handleSaveHousehold = (houseNumber: number, formData: any) => {
    setHouseholds((prev) =>
      prev.map((h) =>
        h.houseNumber === houseNumber
          ? { ...h, isCompleted: true, headName: formData.headName, data: formData }
          : h
      )
    );
    setActiveModalHouse(null);
  };

  const completedCount = households.filter((h) => h.isCompleted).length;
  const pendingCount = households.length - completedCount;

  const filteredHouses = households.filter((h) => {
    if (filter === 'completed') return h.isCompleted;
    if (filter === 'pending') return !h.isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-hindi pb-16">
      
      {/* Top Bar */}
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xs">
            D
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">सर्वेक्षक कार्यक्षेत्र</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">आईडी: {surveyorId}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-xs border px-3 py-1.5 rounded hover:bg-slate-100 flex items-center cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 mr-1" /> लॉग आउट
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {!villageData ? (
          <VillageProfileForm onComplete={handleVillageProfileSubmitted} />
        ) : viewMode === 'profile_dashboard' ? (
          /* View 1: Complete Village Analytics Dashboard */
          <VillageProfileDashboard
            villageData={villageData}
            onOpenHouseholdGrid={() => setViewMode('grid')}
            onEditProfile={() => setVillageData(null)}
          />
        ) : (
          /* View 2: Red/Green Household Grid */
          <div className="space-y-5">
            <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">आवंटित ग्राम</span>
                <h2 className="text-lg font-bold text-slate-900">
                  ग्राम: {villageData.villageName} ({villageData.panchayat}, {villageData.block})
                </h2>
                <p className="text-xs text-slate-500">कुल परिवार: {villageData.totalHouseholds}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('profile_dashboard')}
                  className="px-3 py-1.5 border text-xs rounded hover:bg-slate-50 flex items-center cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> ग्राम डैशबोर्ड देखें
                </button>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-bold">
                  पूर्ण: {completedCount}
                </div>
                <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-bold">
                  लंबित: {pendingCount}
                </div>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
                }`}
              >
                सभी ({households.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  filter === 'pending' ? 'bg-rose-600 text-white' : 'bg-white border text-rose-700'
                }`}
              >
                लंबित ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  filter === 'completed' ? 'bg-emerald-700 text-white' : 'bg-white border text-emerald-700'
                }`}
              >
                पूर्ण ({completedCount})
              </button>
            </div>

            {/* Household Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredHouses.map((h) => {
                const isDone = h.isCompleted;
                return (
                  <div
                    key={h.houseNumber}
                    onClick={() => setActiveModalHouse(h.houseNumber)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-400 hover:bg-emerald-100'
                        : 'bg-rose-50/60 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
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
                          <p className="text-[11px] text-emerald-800">✓ सत्यापित</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-rose-900">खाली</p>
                          <p className="text-[11px] text-rose-600">भरें →</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

     // SurveyorDashboard.tsx ke andar modal/dashboard rendering:

{activeModalHouse !== null && (
  households.find((h) => h.houseNumber === activeModalHouse)?.isCompleted ? (
    /* Completed: Open Analytics Dashboard */
    <HouseholdAnalyticsDashboard
      houseNumber={activeModalHouse}
      villageName={villageData.villageName}
      data={households.find((h) => h.houseNumber === activeModalHouse)?.data}
      onBackToGrid={() => setActiveModalHouse(null)}
      onEdit={() => {
        // Edit mode me modal kholne ke liye
        const currentData = households.find((h) => h.houseNumber === activeModalHouse)?.data;
        setHouseholds((p) => p.map((h) => h.houseNumber === activeModalHouse ? { ...h, isCompleted: false } : h));
      }}
    />
  ) : (
    /* Pending: Open 34-Question Survey Modal */
    <HouseholdSurveyModal
      houseNumber={activeModalHouse}
      villageName={villageData.villageName}
      panchayatName={villageData.panchayat}
      blockName={villageData.block}
      existingData={households.find((h) => h.houseNumber === activeModalHouse)?.data}
      onClose={() => setActiveModalHouse(null)}
      onSave={handleSaveHousehold}
    />
  )
)}

    </div>
  );
};