import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Printer, 
  ShieldCheck, 
  Users, 
  Home, 
  CreditCard,
  Download
} from 'lucide-react';

interface HouseholdSurveyModalProps {
  houseNumber: number;
  villageName: string;
  panchayatName: string;
  blockName: string;
  existingData?: any;
  onClose: () => void;
  onSave: (houseNumber: number, fullData: any) => void;
}

const SUB_CATEGORY_MAP: Record<string, string[]> = {
  'अनुसूचित जनजाति': ['गोंड', 'माड़िया', 'मुरिया', 'भतरा', 'हल्बा', 'धुरवा', 'अन्य'],
  'अबूझमाड़िया अनुसूचित जनजाति': ['अबूझमाड़िया', 'हिल माड़िया', 'अन्य'],
  'अनुसूचित जाति': ['सतनामी', 'मेहरा', 'गांडा', 'घसिया', 'अन्य'],
  'अन्य पिछड़ा वर्ग': ['तेली', 'यादव (राउत)', 'कलार', 'कुम्हार', 'देवांगन', 'अन्य'],
  'सामान्य': ['ब्राह्मण', 'क्षत्रिय / राजपूत', 'वैश्य / बनिया', 'अन्य'],
};

export const HouseholdSurveyModal: React.FC<HouseholdSurveyModalProps> = ({
  houseNumber,
  villageName,
  panchayatName,
  blockName,
  existingData,
  onClose,
  onSave,
}) => {
  // Agar pehle se bhara hua hai toh direct receipt dekhne ka option de sakte hain
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(existingData?.trackingId));
  const [currentStep, setCurrentStep] = useState<number>(existingData?.trackingId ? 5 : 1);
  const [trackingId, setTrackingId] = useState<string>(
    existingData?.trackingId || ''
  );

  const [formData, setFormData] = useState({
    headName: existingData?.headName || '',
    mobile: existingData?.mobile || '',
    category: existingData?.category || 'अनुसूचित जनजाति',
    subTribe: existingData?.subTribe || 'गोंड',
    isBPL: existingData?.isBPL || 'हां',

    totalMembers: existingData?.totalMembers || '5',
    eldersCount: existingData?.eldersCount || '1',
    childrenCount: existingData?.childrenCount || '2',
    unemployedCount: existingData?.unemployedCount || '1',
    incomeSource: existingData?.incomeSource || 'कृषि',
    isMiningWorker: existingData?.isMiningWorker || 'नहीं',

    houseType: existingData?.houseType || 'कच्चा घर',
    hasToilet: existingData?.hasToilet || 'हां',
    hasTapWater: existingData?.hasTapWater || 'नहीं',
    waterSource: existingData?.waterSource || 'हैंडपंप',
    hasElectricity: existingData?.hasElectricity || 'हां',
    usesSolar: existingData?.usesSolar || 'नहीं',
    hasChronicIllness: existingData?.hasChronicIllness || 'नहीं',
    freeMedicineAvailable: existingData?.freeMedicineAvailable || 'हां',

    missingAadhaarCount: existingData?.missingAadhaarCount || '0',
    missingVoterCount: existingData?.missingVoterCount || '0',
    hasRationCard: existingData?.hasRationCard || 'हां',
    hasMNREGA: existingData?.hasMNREGA || 'हां',
    hasJanDhan: existingData?.hasJanDhan || 'हां',
    hasKCC: existingData?.hasKCC || 'नहीं',
    mahtariVandana: existingData?.mahtariVandana || 'हां',
    pmKisan: existingData?.pmKisan || 'हां',
    childrenVaccinated: existingData?.childrenVaccinated || 'हां',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCat = e.target.value;
    const defaultSub = SUB_CATEGORY_MAP[selectedCat]?.[0] || 'अन्य';
    setFormData({
      ...formData,
      category: selectedCat,
      subTribe: defaultSub,
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.headName.trim()) {
      alert('कृपया परिवार के मुखिया का नाम दर्ज करें');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // STEP 1: Sirf local submit & Receipt show (Modal close nahi hoga)
  const handleGenerateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrackingId = `DMFT-NYR-${Date.now().toString().slice(-6)}`;
    setTrackingId(newTrackingId);
    setIsSubmitted(true);
  };

  // STEP 2: Surveyor jab receipt dekh le aur "ग्रिड पर वापस जाएं" dabaye
  const handleFinishAndSave = () => {
    onSave(houseNumber, { ...formData, trackingId });
  };

  const stepTitles = [
    { num: 1, title: 'पहचान सत्यापन', icon: <ShieldCheck className="w-4 h-4" /> },
    { num: 2, title: 'जनसांख्यिकी', icon: <Users className="w-4 h-4" /> },
    { num: 3, title: 'आवास व स्वास्थ्य', icon: <Home className="w-4 h-4" /> },
    { num: 4, title: 'योजनाएँ व कार्ड', icon: <CreditCard className="w-4 h-4" /> },
    { num: 5, title: 'समीक्षा व पावती', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 font-hindi">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-600 rounded text-white shadow-2xs">
              मकान #{houseNumber}
            </span>
            <div>
              <h3 className="text-sm font-bold">परिवार सर्वेक्षण प्रपत्र</h3>
              <p className="text-[11px] text-slate-300">
                {villageName} • ग्राम पंचायत: {panchayatName} • विकासखंड: {blockName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Bar (Only visible when not showing final receipt) */}
        {!isSubmitted && (
          <div className="bg-slate-100 border-b px-6 py-2.5">
            <div className="flex items-center justify-between">
              {stepTitles.map((step) => {
                const isActive = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <div key={step.num} className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-xs'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : step.num}
                    </div>
                    <span
                      className={`text-xs hidden md:inline font-medium ${
                        isActive ? 'text-blue-900 font-bold' : isPassed ? 'text-emerald-900' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700">
          
          {/* FINAL RECEIPT SCREEN */}
          {isSubmitted ? (
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs print:border-none" id="printable-receipt">
                {/* Receipt Official Header */}
                <div className="border-b pb-4 text-center space-y-1">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    ✓ सर्वेक्षण पावती (Acknowledge Receipt)
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-2">
                    जिला खनिज संस्थान न्यास (DMFT) सामाजिक-आर्थिक सर्वेक्षण
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    ग्राम: <strong className="text-slate-700">{villageName}</strong> | पंचायत: <strong className="text-slate-700">{panchayatName}</strong> | विकासखंड: <strong className="text-slate-700">{blockName}</strong>
                  </p>
                </div>

                {/* Tracking & ID Row */}
                <div className="grid grid-cols-2 bg-slate-50 border my-4 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block">पंजीयन / ट्रैकिंग आईडी:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{trackingId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">मकान नंबर:</span>
                    <span className="font-bold text-slate-900 text-sm">#{houseNumber}</span>
                  </div>
                </div>

                {/* Key Summary Data */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-b pb-3">
                    <div>
                      <span className="text-slate-400 block">मुखिया का नाम:</span>
                      <strong className="text-slate-900 text-sm">{formData.headName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">मोबाइल नंबर:</span>
                      <strong className="text-slate-900">{formData.mobile || 'दर्ज नहीं'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">सामाजिक वर्ग / उपजाति:</span>
                      <strong className="text-slate-900">{formData.category} ({formData.subTribe})</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b pb-3">
                    <div>
                      <span className="text-slate-400 block">कुल सदस्य:</span>
                      <strong className="text-slate-900">{formData.totalMembers} व्यक्ति</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">BPL स्थिति:</span>
                      <strong className="text-slate-900">{formData.isBPL}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">मकान का प्रकार:</span>
                      <strong className="text-slate-900">{formData.houseType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">शौचालय:</span>
                      <strong className="text-slate-900">{formData.hasToilet}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 block">राशन कार्ड:</span>
                      <strong className="text-slate-900">{formData.hasRationCard}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">महतारी वंदना:</span>
                      <strong className="text-slate-900">{formData.mahtariVandana}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">PM किसान निधि:</span>
                      <strong className="text-slate-900">{formData.pmKisan}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between text-[11px] text-slate-400">
                  <span>सत्यापन तिथि: {new Date().toLocaleDateString('hi-IN')}</span>
                  <span>हस्ताक्षर / मुहर: अधिकृत प्रगणक</span>
                </div>
              </div>

              {/* Action Buttons on Receipt Screen */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border rounded-md text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  <Printer className="w-4 h-4 mr-1.5 text-slate-600" />
                  पावती रसीद प्रिंट करें
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndSave}
                  className="inline-flex items-center px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  पूर्ण करें एवं ग्रिड पर वापस लौटें
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: IDENTITY */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-900">चरण 1: परिवार मुखिया पहचान सत्यापन</h4>
                    <p className="text-[11px] text-slate-500">मुखिया एवं सामाजिक वर्ग की प्राथमिक जानकारी दर्ज करें।</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1 text-slate-800">परिवार के मुखिया का नाम *</label>
                      <input
                        type="text"
                        required
                        name="headName"
                        value={formData.headName}
                        onChange={handleChange}
                        placeholder="उदा. सोमारू मंडावी"
                        className="w-full px-3 py-2 border rounded-md font-semibold text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-800">मोबाइल नंबर</label>
                      <input
                        type="tel"
                        maxLength={10}
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10 अंकों का फोन नंबर"
                        className="w-full px-3 py-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block font-medium mb-1 text-slate-800">सामाजिक वर्ग / जाति *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="अनुसूचित जनजाति">अनुसूचित जनजाति</option>
                        <option value="अबूझमाड़िया अनुसूचित जनजाति">अबूझमाड़िया अनुसूचित जनजाति</option>
                        <option value="अनुसूचित जाति">अनुसूचित जाति</option>
                        <option value="अन्य पिछड़ा वर्ग">अन्य पिछड़ा वर्ग</option>
                        <option value="सामान्य">सामान्य</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-800">उपजाति / वर्ग विवरण *</label>
                      <select
                        name="subTribe"
                        value={formData.subTribe}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        {(SUB_CATEGORY_MAP[formData.category] || ['अन्य']).map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-slate-800">गरीबी रेखा के नीचे (BPL)?</label>
                      <select
                        name="isBPL"
                        value={formData.isBPL}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="हां">हां</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DEMOGRAPHICS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-900">चरण 2: जनसांख्यिकी एवं आयु गणना</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-medium mb-1">परिवार में कुल सदस्य *</label>
                      <input
                        type="number"
                        min={1}
                        name="totalMembers"
                        value={formData.totalMembers}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">बुजुर्ग (60+)</label>
                      <input
                        type="number"
                        min={0}
                        name="eldersCount"
                        value={formData.eldersCount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">बच्चे (0-14)</label>
                      <input
                        type="number"
                        min={0}
                        name="childrenCount"
                        value={formData.childrenCount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">बेरोजगार युवा (18-35)</label>
                      <input
                        type="number"
                        min={0}
                        name="unemployedCount"
                        value={formData.unemployedCount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-medium mb-1">आय का मुख्य स्रोत</label>
                      <select
                        name="incomeSource"
                        value={formData.incomeSource}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="कृषि">कृषि</option>
                        <option value="पशुपालन">पशुपालन</option>
                        <option value="दैनिक मजदूर गांव में">दैनिक मजदूर गांव में</option>
                        <option value="दैनिक मजदूर शहर में">दैनिक मजदूर शहर में</option>
                        <option value="दुकानदार / लघु व्यवसाय">दुकानदार / लघु व्यवसाय</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">खनन में कार्यरत?</label>
                      <select
                        name="isMiningWorker"
                        value={formData.isMiningWorker}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="नहीं">नहीं</option>
                        <option value="हां">हां</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LIVING STANDARDS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-900">चरण 3: आवास, जीवन स्तर एवं स्वास्थ्य</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-medium mb-1">घर का प्रकार</label>
                      <select
                        name="houseType"
                        value={formData.houseType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="कच्चा घर">कच्चा घर</option>
                        <option value="पक्का घर">पक्का घर</option>
                        <option value="आधा कच्चा आधा पक्का घर">आधा कच्चा आधा पक्का घर</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">शौचालय उपलब्ध?</label>
                      <select
                        name="hasToilet"
                        value={formData.hasToilet}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="हां">हां</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">नल जल कनेक्शन?</label>
                      <select
                        name="hasTapWater"
                        value={formData.hasTapWater}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md bg-white text-xs"
                      >
                        <option value="नहीं">नहीं</option>
                        <option value="हां">हां</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SCHEMES */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-900">चरण 4: शासकीय योजनाएँ एवं दस्तावेज</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1">राशन कार्ड?</label>
                      <select
                        name="hasRationCard"
                        value={formData.hasRationCard}
                        onChange={handleChange}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                      >
                        <option value="हां">हां</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">मनरेगा जॉब कार्ड?</label>
                      <select
                        name="hasMNREGA"
                        value={formData.hasMNREGA}
                        onChange={handleChange}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                      >
                        <option value="हां">हां</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">महतारी वंदना लाभ?</label>
                      <select
                        name="mahtariVandana"
                        value={formData.mahtariVandana}
                        onChange={handleChange}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                      >
                        <option value="हां">हां</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">PM किसान सम्मान निधि?</label>
                      <select
                        name="pmKisan"
                        value={formData.pmKisan}
                        onChange={handleChange}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                      >
                        <option value="हां">हां</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">बिना आधार कार्ड वाले सदस्य संख्या</label>
                      <input
                        type="number"
                        min={0}
                        name="missingAadhaarCount"
                        value={formData.missingAadhaarCount}
                        onChange={handleChange}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW BEFORE RECEIPT */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h4 className="text-sm font-bold text-slate-900">चरण 5: समीक्षा एवं पावती जनरेशन</h4>
                    <p className="text-[11px] text-slate-500">विवरण जांचें और रसीद तैयार करें।</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">मुखिया का नाम:</span>
                      <strong className="text-slate-900">{formData.headName}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">सामाजिक वर्ग:</span>
                      <strong className="text-slate-900">{formData.category} ({formData.subTribe})</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">कुल सदस्य:</span>
                      <strong className="text-slate-900">{formData.totalMembers} व्यक्ति</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">मकान प्रकार:</span>
                      <strong className="text-slate-900">{formData.houseType}</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wizard Footer Controls */}
        {!isSubmitted && (
          <div className="bg-slate-50 border-t px-6 py-3 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrev}
              className={`inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md border cursor-pointer ${
                currentStep === 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              पिछला चरण
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-5 py-2 text-xs font-semibold rounded-md bg-blue-700 hover:bg-blue-800 text-white cursor-pointer shadow-xs"
              >
                अगला चरण
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateReceipt}
                className="inline-flex items-center px-6 py-2 text-xs font-bold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                प्रपत्र जमा करें एवं रसीद देखें
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};