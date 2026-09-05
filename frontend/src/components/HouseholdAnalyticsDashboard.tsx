import React from 'react';
import { 
  Home, 
  Printer, 
  CreditCard, 
  GraduationCap,
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  Edit3,
  Wheat,
  Pickaxe,
  HardHat,
  Landmark,
  Sprout,
  HeartHandshake,
  Baby,
  ShoppingBag,
  HeartPulse,
  Droplets,
  Zap,
  Sun,
  FileBadge,
  UserX,
  FileCheck,
  Stethoscope,
  Building,
  School,
  Activity,
  RotateCcw
} from 'lucide-react';

interface HouseholdDashboardProps {
  houseNumber: number;
  villageName: string;
  data: any;
  onBackToGrid: () => void;
  onEdit: () => void;
  onReset: () => void;
}

const StatusTile = ({ 
  label, 
  value, 
  icon: Icon,
  subtext 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  subtext?: string;
}) => {
  const isYes = value === 'हां' || value === 'पक्का घर' || value === 'पूर्णतः विद्युतीकृत';
  const isNo = value === 'नहीं' || value === 'कच्चा घर';
  const isMissingCount = typeof value === 'number' && value > 0;

  return (
    <div
      className={`p-2 rounded-lg border flex items-center justify-between transition-all print:p-1.5 print:border-slate-300 ${
        isMissingCount
          ? 'bg-amber-50/60 border-amber-200'
          : isYes
          ? 'bg-emerald-50/40 border-emerald-200/80'
          : isNo
          ? 'bg-rose-50/40 border-rose-200/80'
          : 'bg-slate-50/60 border-slate-200'
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0 pr-1">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 print:hidden ${
            isMissingCount
              ? 'bg-amber-100 text-amber-800'
              : isYes
              ? 'bg-emerald-100 text-emerald-700'
              : isNo
              ? 'bg-rose-100 text-rose-700'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <p className="font-semibold text-xs text-slate-800 truncate print:text-[11px]">{label}</p>
          {subtext && <p className="text-[10px] text-slate-400 truncate print:hidden">{subtext}</p>}
        </div>
      </div>

      <div className="shrink-0">
        {typeof value === 'number' ? (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${value > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
            {value} सदस्य
          </span>
        ) : isYes ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 print:text-[9px] print:py-0">
            <CheckCircle2 className="w-3 h-3 mr-0.5 text-emerald-600 print:hidden" />
            हां / उपलब्ध
          </span>
        ) : isNo ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 print:text-[9px] print:py-0">
            <XCircle className="w-3 h-3 mr-0.5 text-rose-600 print:hidden" />
            नहीं / वंचित
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 print:text-[9px] print:py-0">
            {value}
          </span>
        )}
      </div>
    </div>
  );
};

export const HouseholdAnalyticsDashboard: React.FC<HouseholdDashboardProps> = ({
  houseNumber,
  villageName,
  data,
  onBackToGrid,
  onEdit,
  onReset,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 font-hindi print:p-0 print:bg-transparent">
      
      {/* Yahan id="printable-receipt" zaroor add karein */}
      <div 
        id="printable-receipt" 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
      >
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700/60 shrink-0 print:bg-white print:text-slate-900 print:px-0 print:py-2 print:border-b-2 print:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded text-xs font-black font-mono tracking-wide print:bg-slate-100 print:border print:border-slate-300">
                मकान #{houseNumber}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-white/10 text-slate-200 rounded border border-white/10 print:text-slate-800 print:bg-transparent print:border-slate-300">
                ट्रैकिंग आईडी: {data.trackingId}
              </span>
              <span className="text-[11px] text-slate-400 print:text-slate-600 ml-2">
                ग्राम: {villageName}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight print:text-base print:mt-1">
              जिला खनिज संस्थान न्यास (DMFT) • परिवार सर्वेक्षण पावती एवं विश्लेषण
            </h2>
          </div>

          <button
            onClick={onBackToGrid}
            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors font-medium border border-white/10 cursor-pointer print:hidden"
          >
            बंद करें ✕
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3.5 text-xs text-slate-700 bg-white print:p-0 print:overflow-visible print:space-y-3">
          
          {/* Identity & Basic Header Card */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 print:bg-white print:border-slate-300">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div>
                <span className="text-[10px] font-medium text-slate-400 block print:text-slate-600">मुखिया का नाम</span>
                <strong className="text-sm font-bold text-slate-900 block truncate">{data.headName}</strong>
              </div>
              <div className="sm:pl-3">
                <span className="text-[10px] font-medium text-slate-400 block print:text-slate-600">मोबाइल नंबर</span>
                <strong className="text-xs font-semibold text-slate-800 block font-mono">{data.mobile}</strong>
              </div>
              <div className="sm:pl-3">
                <span className="text-[10px] font-medium text-slate-400 block print:text-slate-600">जाति / सामाजिक श्रेणी</span>
                <span className="font-semibold text-slate-800 text-xs block">{data.caste}</span>
              </div>
              <div className="sm:pl-3">
                <span className="text-[10px] font-medium text-slate-400 block print:text-slate-600">BPL स्थिति</span>
                <span className="font-bold text-emerald-800 text-xs block">{data.isBPL}</span>
              </div>
            </div>
          </div>

          {/* 4 Core Summary Metrics */}
          <div className="grid grid-cols-4 gap-2.5 print:gap-2">
            <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-lg print:bg-white print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-500 block">कुल सदस्य</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{data.totalMembers} व्यक्ति</p>
              <p className="text-[9px] text-slate-400 print:text-slate-600">बुजुर्ग: {data.eldersCount || 0} • बच्चे: {data.childrenCount || 0}</p>
            </div>

            <div className="p-2.5 bg-amber-50/40 border border-amber-100 rounded-lg print:bg-white print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-500 block">बेरोजगार युवा (18-35)</span>
              <p className="text-lg font-black text-amber-700 print:text-slate-900 mt-0.5">{data.unemployedCount} युवा</p>
              <p className="text-[9px] text-amber-800/80 print:text-slate-600">आजीविका सहायता</p>
            </div>

            <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-lg print:bg-white print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-500 block">आय का स्रोत</span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{data.incomeSource}</p>
              <p className="text-[9px] text-slate-400 print:text-slate-600">खनन कार्य: {data.isMiningWorker}</p>
            </div>

            <div className="p-2.5 bg-purple-50/40 border border-purple-100 rounded-lg print:bg-white print:border-slate-300">
              <span className="text-[10px] font-semibold text-slate-500 block">मकान ढांचा</span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{data.houseType}</p>
              <p className="text-[9px] text-slate-400 print:text-slate-600">शासकीय आवास: {data.hasGovtHousing || 'नहीं'}</p>
            </div>
          </div>

          {/* Section 1: पहचान पत्र एवं दस्तावेज */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2 print:border-slate-300 print:p-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center print:text-[11px]">
              <FileBadge className="w-3.5 h-3.5 mr-1 text-indigo-600 print:hidden" />
              1. पहचान पत्र एवं आवश्यक दस्तावेज (कमी स्थिति)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatusTile label="आधार कार्ड नहीं है" value={data.missingAadhaar} icon={UserX} />
              <StatusTile label="जाति प्रमाण-पत्र नहीं" value={data.missingCasteCert} icon={FileBadge} />
              <StatusTile label="आयुष्मान कार्ड नहीं" value={data.missingAyushman} icon={HeartPulse} />
              <StatusTile label="वोटर आईडी (18+) नहीं" value={data.missingVoterId} icon={FileCheck} />
            </div>
          </div>

          {/* Section 2: शासकीय योजनाओं का वास्तविक आच्छादन */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2 print:border-slate-300 print:p-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center print:text-[11px]">
              <CreditCard className="w-3.5 h-3.5 mr-1 text-blue-600 print:hidden" />
              2. शासकीय योजनाएँ एवं आर्थिक लाभ स्थिति
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatusTile label="राशन कार्ड" value={data.hasRationCard} icon={Wheat} />
              <StatusTile label="मनरेगा जॉब कार्ड" value={data.hasMNREGA} icon={Pickaxe} />
              <StatusTile label="श्रमिक कार्ड (18-40)" value={data.hasShramikCard} icon={HardHat} />
              <StatusTile label="जन-धन बैंक खाता" value={data.hasJanDhan} icon={Landmark} />
              <StatusTile label="किसान क्रेडिट (KCC)" value={data.hasKCC} icon={CreditCard} />
              <StatusTile label="PM गरीब कल्याण राशन" value={data.hasFreeRation} icon={ShoppingBag} />
              <StatusTile label="PM किसान सम्मान (₹6k)" value={data.hasPMKisan} icon={Sprout} />
              <StatusTile label="मृत्यु प्रमाण-पत्र" value={data.hasDeathCert} icon={FileCheck} />
            </div>
          </div>

          {/* Section 3: महिला, बाल कल्याण एवं शिक्षा */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2 print:border-slate-300 print:p-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center print:text-[11px]">
              <GraduationCap className="w-3.5 h-3.5 mr-1 text-amber-600 print:hidden" />
              3. महिला, बाल कल्याण एवं शिक्षा विवरण
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <StatusTile label="जननी सुरक्षा (JSY)" value={data.jsyReceived} icon={Baby} />
              <StatusTile label="मातृ वंदना (PMMVY)" value={data.pmmvyReceived} icon={HeartHandshake} />
              <StatusTile label="महतारी वंदना योजना" value={data.mahtariVandana} icon={HeartHandshake} />
              <StatusTile label="विधवा पेंशन लाभ" value={data.widowPension} icon={Users} />
              <StatusTile label="दिव्यांग पेंशन लाभ" value={data.divyangPension} icon={Activity} />
              <StatusTile label="जन्म प्रमाण-पत्र" value={data.hasBirthCert} icon={FileCheck} />
              <StatusTile label="बच्चों का टीकाकरण" value={data.childrenVaccinated} icon={Stethoscope} />
              <StatusTile label="आंगनबाड़ी गर्म भोजन" value={data.hotMealAWC} icon={Baby} />
              <StatusTile label="बच्चे स्कूल जाते हैं?" value={data.childrenGoSchool} icon={School} subtext={data.schoolDropReason} />
            </div>
          </div>

          {/* Section 4: आवास, जल, स्वच्छता एवं स्वास्थ्य */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2 print:border-slate-300 print:p-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center print:text-[11px]">
              <Home className="w-3.5 h-3.5 mr-1 text-emerald-600 print:hidden" />
              4. आवास, पेयजल, स्वच्छता एवं स्वास्थ्य
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatusTile label="शौचालय उपलब्धता" value={data.hasToilet} icon={Home} />
              <StatusTile label="नल जल कनेक्शन" value={data.hasTapWater} icon={Droplets} />
              <StatusTile label="पेयजल का स्रोत" value={data.waterSource || 'हैंडपंप'} icon={Droplets} />
              <StatusTile label="बिजली कनेक्शन" value={data.hasElectricity} icon={Zap} />
              <StatusTile label="सौर ऊर्जा उपयोग" value={data.usesSolar} icon={Sun} />
              <StatusTile label="शासकीय आवास लाभ" value={data.hasGovtHousing} icon={Building} />
              <StatusTile label="दमा/खांसी/टीबी रोग" value={data.chronicIllness} icon={Activity} />
              <StatusTile label="अस्पताल से मुफ्त दवा" value={data.freeMedicine} icon={Stethoscope} />
            </div>
          </div>

          {/* Signatures */}
          <div className="hidden print:flex justify-between items-end pt-6 text-[11px] text-slate-800">
            <div>
              <p>सर्वेक्षण तिथि: {new Date().toLocaleDateString('hi-IN')}</p>
              <p className="mt-6 border-t border-slate-400 pt-1">सर्वेक्षक के हस्ताक्षर</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-1">परिवार के मुखिया के हस्ताक्षर / अंगूठा</p>
            </div>
          </div>

        </div>

        {/* Footer Actions (Completely hidden in Print) */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onEdit}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-100 font-semibold cursor-pointer transition-colors inline-flex items-center text-xs shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              प्रपत्र संशोधित करें
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-3.5 py-2 border border-rose-200 text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-lg font-semibold text-xs cursor-pointer transition-colors inline-flex items-center shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              डेटा रीसेट करें
            </button>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-100 font-semibold cursor-pointer transition-colors inline-flex items-center text-xs shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              पावती प्रिंट करें
            </button>

            <button
              type="button"
              onClick={onBackToGrid}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer transition-all shadow-xs text-xs"
            >
              ग्रिड पर लौटें
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};