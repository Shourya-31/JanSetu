import React, { useState } from 'react';
import { 
  Building2, 
  School, 
  Stethoscope, 
  Home, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Briefcase, 
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';

interface VillageDashboardProps {
  villageData: any;
  onOpenHouseholdGrid: () => void;
  onEditProfile: () => void;
}

export const VillageProfileDashboard: React.FC<VillageDashboardProps> = ({
  villageData,
  onOpenHouseholdGrid,
  onEditProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix'>('overview');

  const {
    villageName,
    panchayat,
    block,
    totalPopulation,
    totalHouseholds,
    scCount,
    stCount,
    puccaHouses,
    semiPuccaHouses,
    kacchaHouses,
    mineDistanceKm,
    hasPuccaRoad,
    monsoonCutOff,
    schoolType,
    hospitalType,
    electrification,
    hasAnganwadi,
    odfStatus,
    quality,
    gapMatrix,
  } = villageData;

  return (
    <div className="max-w-6xl mx-auto font-hindi space-y-6 pb-12">
      
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
              ग्राम सांख्यिकी एवं प्रोफाइल डैशबोर्ड
            </span>
            <span className="text-xs text-slate-500">ब्लॉक: {block} • पंचायत: {panchayat}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">ग्राम: {villageName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            कुल जनसंख्या: <strong className="text-slate-800">{totalPopulation}</strong> | कुल परिवार: <strong className="text-slate-800">{totalHouseholds}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEditProfile}
            className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
          >
            विवरण संशोधित करें
          </button>
          <button
            onClick={onOpenHouseholdGrid}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center shadow-xs cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" />
            परिवार सर्वेक्षण ग्रिड खोलें ({totalHouseholds} घर)
          </button>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 text-xs font-bold border-b-2 cursor-pointer ${
            activeTab === 'overview' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'
          }`}
        >
          ग्राम सिंहावलोकन एवं क्या है / क्या नहीं (Overview)
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 text-xs font-bold border-b-2 cursor-pointer ${
            activeTab === 'matrix' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'
          }`}
        >
          आधारभूत अंतराल तालिका (Infrastructure Gap Analysis)
        </button>
      </div>

      {/* TAB 1: Kya hai aur kya nahi hai (Detailed Breakdown) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-xl">
              <span className="text-xs text-slate-500 block">पक्के घर</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{puccaHouses || '0'}</p>
              <span className="text-[11px] text-slate-400">कच्चे घर: {kacchaHouses || '0'}</span>
            </div>
            <div className="p-4 bg-white border rounded-xl">
              <span className="text-xs text-slate-500 block">खदान से दूरी</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{mineDistanceKm || '0'} KM</p>
              <span className="text-[11px] text-slate-400">खनन प्रभाव क्षेत्र</span>
            </div>
            <div className="p-4 bg-white border rounded-xl">
              <span className="text-xs text-slate-500 block">बेरोजगार युवा (18-45)</span>
              <p className="text-xl font-bold text-amber-700 mt-1">{quality?.livelihood?.unemployedYouth || '0'}</p>
              <span className="text-[11px] text-slate-400">कौशल प्रशिक्षण आवश्यक</span>
            </div>
            <div className="p-4 bg-white border rounded-xl">
              <span className="text-xs text-slate-500 block">अपूर्ण आवास</span>
              <p className="text-xl font-bold text-rose-700 mt-1">{quality?.livelihood?.pendingHouses || '0'}</p>
              <span className="text-[11px] text-slate-400">स्वीकृत पर अनिर्मित</span>
            </div>
          </div>

          {/* "क्या है और क्या नहीं है" Status Grid */}
          <div className="bg-white border rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              गाँव में उपलब्ध सुविधाओं का वास्तविक स्थिति कार्ड
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Education Box */}
              <div className="p-4 bg-slate-50 border rounded-lg space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <School className="w-4 h-4 text-blue-600" />
                  <span>शिक्षा व्यवस्था</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">उपलब्ध विद्यालय:</span>
                    <strong className="text-slate-800">{schoolType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">बैठने की दरी/बेंच:</span>
                    <strong className="text-slate-800">{quality?.school?.schoolSeating}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">बालक-बालिका अलग शौचालय:</span>
                    <span className={quality?.school?.schoolToilets?.includes('हाँ') ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {quality?.school?.schoolToilets?.includes('हाँ') ? 'उपलब्ध' : 'अनुपलब्ध'}
                    </span>
                  </div>
                </div>
                {quality?.school?.schoolDeficiency && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 mt-2">
                    मुख्य कमी: {quality.school.schoolDeficiency}
                  </p>
                )}
              </div>

              {/* Health Box */}
              <div className="p-4 bg-slate-50 border rounded-lg space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <Stethoscope className="w-4 h-4 text-rose-600" />
                  <span>स्वास्थ्य एवं चिकित्सा</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">उपलब्ध अस्पताल:</span>
                    <strong className="text-slate-800">{hospitalType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">दवाइयों की उपलब्धता:</span>
                    <strong className="text-slate-800">{quality?.health?.healthMedicine}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">चिकित्सा स्टाफ उपस्थिति:</span>
                    <strong className="text-slate-800">{quality?.health?.healthStaff}</strong>
                  </div>
                </div>
                {quality?.health?.healthDeficiency && (
                  <p className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 mt-2">
                    मुख्य कमी: {quality.health.healthDeficiency}
                  </p>
                )}
              </div>

              {/* Infrastructure Box */}
              <div className="p-4 bg-slate-50 border rounded-lg space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>सड़क, बिजली व स्वच्छता</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">पक्की सड़क:</span>
                    <span className={hasPuccaRoad === 'हां' ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>{hasPuccaRoad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">बारिश में संपर्क कटना:</span>
                    <span className={monsoonCutOff === 'हां' ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>{monsoonCutOff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">विद्युतीकरण:</span>
                    <strong className="text-slate-800">{electrification}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ODF स्थिति:</span>
                    <strong className="text-slate-800">{odfStatus}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Gap Matrix (तालिका) */}
      {activeTab === 'matrix' && (
        <div className="bg-white border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">अंतराल मैट्रिक्स (Infrastructure Gap Analysis)</h3>
              <p className="text-xs text-slate-500">मौजूदा व कार्यात्मक संसाधनों के मुकाबले आवश्यकता एवं वास्तविक कमी</p>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 border-b font-semibold text-slate-700">
                <tr>
                  <th className="p-2.5 border-r">संसाधन / गतिविधि</th>
                  <th className="p-2.5 border-r text-center">मौजूदा</th>
                  <th className="p-2.5 border-r text-center">कार्यात्मक</th>
                  <th className="p-2.5 border-r text-center">अकार्यशील</th>
                  <th className="p-2.5 border-r text-center">कुल आवश्यकता</th>
                  <th className="p-2.5 text-center bg-amber-50">अंतराल (Gap)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {gapMatrix && Object.keys(gapMatrix).map((item) => (
                  <tr key={item} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium border-r">{item}</td>
                    <td className="p-2 border-r text-center">{gapMatrix[item].current || 0}</td>
                    <td className="p-2 border-r text-center text-emerald-700 font-bold">{gapMatrix[item].functional || 0}</td>
                    <td className="p-2 border-r text-center text-rose-600 font-bold">{gapMatrix[item].nonFunctional || 0}</td>
                    <td className="p-2 border-r text-center text-blue-700 font-bold">{gapMatrix[item].required || 0}</td>
                    <td className="p-2 text-center font-bold text-amber-800 bg-amber-50/60">{gapMatrix[item].gap || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};