import React, { useState } from 'react';
import { VillageProfileForm } from './VillageProfileForm';
import { HouseholdSurveyModal } from './HouseholdSurveyModal';
import { 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  MapPin, 
  Edit3, 
  Home, 
  ArrowLeft 
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
  const [villageData, setVillageData] = useState<any>(null);
  const [households, setHouseholds] = useState<HouseholdItem[]>([]);
  const [activeModalHouse, setActiveModalHouse] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Village Form Submit
  const handleVillageProfileSubmitted = (data: any) => {
    setVillageData(data);
    const count = Number(data.totalHouseholds) || 20;
    const initialHouses: HouseholdItem[] = Array.from({ length: count }, (_, i) => ({
      houseNumber: i + 1,
      isCompleted: false,
    }));
    setHouseholds(initialHouses);
  };

  // Parivar Form Submit -> Card turns Green
  const handleSaveHousehold = (houseNumber: number, formData: any) => {
    setHouseholds((prev) =>
      prev.map((h) =>
        h.houseNumber === houseNumber
          ? {
              ...h,
              isCompleted: true,
              headName: formData.headName,
              data: formData,
            }
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
    <div className="min-h-screen bg-slate-50 font-hindi pb-12">
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-700 text-white rounded flex items-center justify-center font-bold">
              स
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                क्षेत्रीय सर्वेक्षक कार्यक्षेत्र (Surveyor Workspace)
              </h1>
              <p className="text-[11px] text-slate-500">
                सर्वेक्षक आईडी: <span className="font-semibold text-slate-700">{surveyorId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md cursor-pointer border border-slate-300"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            लॉग आउट
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {!villageData ? (
          /* Step 1: Village Profile Form */
          <VillageProfileForm onComplete={handleVillageProfileSubmitted} />
        ) : (
          /* Step 2: Red/Green Grid */
          <div className="space-y-5">
            {/* Header Details */}
            <div className="bg-white border rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-500 uppercase">आवंटित ग्राम</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  ग्राम: {villageData.villageName} ({villageData.panchayat}, {villageData.block})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  कुल परिवार: {villageData.totalHouseholds} | कुल जनसंख्या: {villageData.totalPopulation}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVillageData(null)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 border rounded-lg hover:bg-slate-50 flex items-center cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  ग्राम विवरण बदलें
                </button>

                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">पूर्ण (हरे)</span>
                    <span className="text-base font-bold text-emerald-900">{completedCount}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <div>
                    <span className="text-[10px] text-rose-800 font-semibold block">लंबित (लाल)</span>
                    <span className="text-base font-bold text-rose-900">{pendingCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                    filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'
                  }`}
                >
                  सभी परिवार ({households.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                    filter === 'pending' ? 'bg-rose-700 text-white' : 'bg-white border text-rose-700'
                  }`}
                >
                  लंबित / खाली ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                    filter === 'completed' ? 'bg-emerald-700 text-white' : 'bg-white border text-emerald-700'
                  }`}
                >
                  सत्यापित / पूर्ण ({completedCount})
                </button>
              </div>

              <span className="text-xs text-slate-500 hidden sm:inline">
                * लाल कार्ड पर क्लिक करके परिवार प्रपत्र भरें
              </span>
            </div>

            {/* Green / Red Interactive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredHouses.map((h) => {
                const isDone = h.isCompleted;

                return (
                  <button
                    key={h.houseNumber}
                    type="button"
                    onClick={() => setActiveModalHouse(h.houseNumber)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-150 relative cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-500 hover:bg-emerald-100/80 shadow-2xs'
                        : 'bg-rose-50 border-rose-400 hover:bg-rose-100/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isDone ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        मकान #{h.houseNumber}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>

                    <div className="mt-2">
                      {isDone ? (
                        <>
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {h.headName}
                          </p>
                          <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                            ✓ प्रपत्र पूर्ण
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-xs text-rose-900">
                            प्रपत्र रिक्त है
                          </p>
                          <p className="text-[11px] text-rose-600 mt-0.5 font-medium">
                            भरने हेतु क्लिक करें →
                          </p>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Parivar Survey Modal */}
     {activeModalHouse !== null && (
  <HouseholdSurveyModal
    houseNumber={activeModalHouse}
    villageName={villageData.villageName}
    panchayatName={villageData.panchayat}
    blockName={villageData.block}
    existingData={households.find((h) => h.houseNumber === activeModalHouse)?.data}
    onClose={() => setActiveModalHouse(null)}
    onSave={handleSaveHousehold}
  />
)}
    </div>
  );
};