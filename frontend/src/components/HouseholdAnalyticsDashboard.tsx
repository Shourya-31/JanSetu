import React from 'react';
import { 
  Home, 
  Printer, 
  CreditCard, 
  GraduationCap 
} from 'lucide-react';

interface HouseholdDashboardProps {
  houseNumber: number;
  villageName: string;
  data: any;
  onBackToGrid: () => void;
  onEdit: () => void;
}

export const HouseholdAnalyticsDashboard: React.FC<HouseholdDashboardProps> = ({
  houseNumber,
  villageName,
  data,
  onBackToGrid,
  onEdit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-hindi">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-emerald-600 rounded text-xs font-bold font-mono">
                मकान #{houseNumber}
              </span>
              <span className="text-xs text-slate-300">ट्रैकिंग आईडी: {data.trackingId}</span>
            </div>
            <h2 className="text-lg font-bold mt-1">परिवार सर्वेक्षण प्रोफाइल एवं सामाजिक विश्लेषण</h2>
          </div>
          <button
            onClick={onBackToGrid}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded cursor-pointer"
          >
            बंद करें ✕
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          
          {/* Top Profile Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border">
            <div>
              <span className="text-slate-400 block">मुखिया का नाम:</span>
              <strong className="text-base text-slate-900">{data.headName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">मोबाइल नंबर:</span>
              <strong className="text-slate-900">{data.mobile}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">सामाजिक श्रेणी:</span>
              <strong className="text-slate-900">{data.caste}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">BPL स्थिति:</span>
              <strong className="text-emerald-700">{data.isBPL}</strong>
            </div>
          </div>

          {/* Demographic & Livelihood */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border rounded-lg">
              <span className="text-slate-500 block">कुल सदस्य</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{data.totalMembers} व्यक्ति</p>
              <span className="text-[11px] text-slate-400">बुजुर्ग: {data.eldersCount} | बच्चे: {data.childrenCount}</span>
            </div>
            <div className="p-3 bg-white border rounded-lg">
              <span className="text-slate-500 block">बेरोजगार युवा (18-35)</span>
              <p className="text-xl font-bold text-amber-700 mt-0.5">{data.unemployedCount} युवा</p>
              <span className="text-[11px] text-slate-400">आजीविका सहायता आवश्यक</span>
            </div>
            <div className="p-3 bg-white border rounded-lg">
              <span className="text-slate-500 block">आय का स्रोत</span>
              <p className="text-base font-bold text-slate-900 mt-1">{data.incomeSource}</p>
              <span className="text-[11px] text-slate-400">खनन कार्य: {data.isMiningWorker}</span>
            </div>
            <div className="p-3 bg-white border rounded-lg">
              <span className="text-slate-500 block">मकान ढांचा</span>
              <p className="text-base font-bold text-slate-900 mt-1">{data.houseType}</p>
              <span className="text-[11px] text-slate-400">सरकारी आवास: {data.hasGovtHousing}</span>
            </div>
          </div>

          {/* Scheme Entitlement Cards */}
          <div className="border rounded-xl p-4 bg-slate-50/50 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-blue-600" /> शासकीय योजनाओं का वास्तविक आच्छादन (34 प्रश्न डेटा)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>राशन कार्ड:</span>
                <strong>{data.hasRationCard}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>मनरेगा कार्ड:</span>
                <strong>{data.hasMNREGA}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>श्रमिक कार्ड:</span>
                <strong>{data.hasShramikCard}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>जन-धन खाता:</span>
                <strong>{data.hasJanDhan}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>PM किसान सम्मान:</span>
                <strong>{data.hasPMKisan}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>महतारी वंदना:</span>
                <strong>{data.mahtariVandana}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>जननी सुरक्षा (JSY):</span>
                <strong>{data.jsyReceived}</strong>
              </div>
              <div className="p-2 bg-white border rounded flex justify-between">
                <span>मुफ्त राशन योजना:</span>
                <strong>{data.hasFreeRation}</strong>
              </div>
            </div>
          </div>

          {/* Living Standards & Health */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 border rounded-xl bg-white space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center">
                <Home className="w-4 h-4 mr-1 text-emerald-600" /> जल, स्वच्छता एवं बिजली
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">शौचालय:</span>
                  <strong className={data.hasToilet === 'हां' ? 'text-emerald-700' : 'text-rose-600'}>{data.hasToilet}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">नल कनेक्शन / पानी स्रोत:</span>
                  <strong>{data.hasTapWater === 'हां' ? 'नल' : data.waterSource}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">बिजली / सौर ऊर्जा:</span>
                  <strong>{data.hasElectricity} / सोलर: {data.usesSolar}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-xl bg-white space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center">
                <GraduationCap className="w-4 h-4 mr-1 text-indigo-600" /> शिक्षा एवं स्वास्थ्य स्थिति
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">बच्चे स्कूल जाते हैं?</span>
                  <strong>{data.childrenGoSchool} ({data.schoolDropReason})</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">टीकाकरण / गर्म भोजन:</span>
                  <strong>टीका: {data.childrenVaccinated} | पोषण: {data.hotMealAWC}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">दमा/खांसी/टीबी / दवा:</span>
                  <strong>रोग: {data.chronicIllness} | मुफ्त दवा: {data.freeMedicine}</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t px-6 py-3 flex items-center justify-between">
          <button
            onClick={onEdit}
            className="px-4 py-2 border rounded text-slate-700 bg-white hover:bg-slate-100 font-semibold cursor-pointer"
          >
            प्रपत्र संशोधित करें
          </button>
          <div className="space-x-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border rounded text-slate-700 bg-white hover:bg-slate-100 font-semibold cursor-pointer inline-flex items-center"
            >
              <Printer className="w-4 h-4 mr-1.5" /> पावती प्रिंट करें
            </button>
            <button
              onClick={onBackToGrid}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer"
            >
              ग्रिड पर लौटें
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};