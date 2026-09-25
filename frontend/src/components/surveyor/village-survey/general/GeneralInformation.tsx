import React from "react";
import { Save } from "lucide-react";

export interface GeneralInformationFormData {
  totalHouseholds: string;
  scPopulation: string;
  totalSchools: string;
  totalAnganwadi: string;
  fairPriceShop: string;
  mobileNetwork: string;
  electricity: string;
  road: string;
  roadconnectivity: string;
  roadReasons: string[];
  tapWater: string;
  ponds: string;
  puccaHouses: string;
  completedHouses: string;
  pendingHouses: string;
  totalAgriculturalLand: string;
  odf: string;
  totalPopulation: string;
  stPopulation: string;
  totalHealthFacilities: string;
  totalHostels: string;
  shopDistance: string;
  networkDistance: string;
  solarLight: string;
  rainCutoff: string;
  tapWaterExcludedFamilies: string;
  vet: string;
  rawHouses: string;
  housingNotSanctioned: string;
  banking: string;
  irrigatedLand: string;
}

export interface GeneralInformationProps {
  villageName: string;
  blockName: string;
  panchayatName: string;
  formData: GeneralInformationFormData;
  setValue: <K extends keyof GeneralInformationFormData>(
    key: K,
    value: GeneralInformationFormData[K]
  ) => void;
  onSave: () => void;
}

const inputClass =
  "w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900";

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  required?: boolean;
}> = ({ label, children, required }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-600">*</span>}
    </label>
    {children}
  </div>
);

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
  villageName,
  blockName,
  panchayatName,
  formData,
  setValue,
  onSave,
}) => {
  return (
    <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-blue-700">खंड 1</span>
                  <h3 className="text-lg font-bold text-slate-900">ग्राम की सामान्य जानकारी</h3>
                  <p className="text-xs text-slate-500 mt-1">प्रपत्र के पृष्ठ 5 में दिए गए ग्राम-स्तरीय प्रश्नों के अनुसार जानकारी भरें।</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="कुल घर / परिवार संख्या" required>
                    <input type="number" min="1" className={inputClass} value={formData.totalHouseholds} onChange={(e) => setValue('totalHouseholds', e.target.value)} placeholder="संख्या" />
                  </Field>

                  <Field label="अनुसूचित जाति (SC) की संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.scPopulation} onChange={(e) => setValue('scPopulation', e.target.value)} />
                  </Field>

                  <Field label="गाँव में कुल उपलब्ध कुल स्कूल (प्राथमिक, उच्च प्राथमिक हाई स्कूल, उच्चतर माध्यमिक) संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.totalSchools || ''} onChange={(e) => setValue('totalSchools', e.target.value)} />
                  </Field>

                  <Field label="गाँव में उपलब्ध कुल आंगनबाड़ी केंद्र संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.totalAnganwadi || ''} onChange={(e) => setValue('totalAnganwadi', e.target.value)} />
                  </Field>

                  <Field label="क्या ग्राम में शासकीय उचित मूल्य की दुकान संचालित है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.fairPriceShop === option}
                            onChange={() => setValue('fairPriceShop', formData.fairPriceShop === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="क्या ग्राम में मोबाइल नेटवर्क की सुविधा उपलब्ध है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.mobileNetwork === option}
                            onChange={() => setValue('mobileNetwork', formData.mobileNetwork === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="क्या गाँव में बिजली की सुविधा उपलब्ध है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.electricity === option}
                            onChange={() => setValue('electricity', formData.electricity === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="क्या गाँव ब्लॉक से पक्की सड़क से जुड़ा है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.road === option}
                            onChange={() => setValue('road', formData.road === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="क्या नल-जल योजना के तहत पेयजल उपलब्ध है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.tapWater === option}
                            onChange={() => setValue('tapWater', formData.tapWater === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="ग्राम में उपलब्ध तालाबों की संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.ponds || ''} onChange={(e) => setValue('ponds', e.target.value)} />
                  </Field>

                  <Field label="गाँव में कुल पक्के घरों की संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.puccaHouses || ''} onChange={(e) => setValue('puccaHouses', e.target.value)} />
                  </Field>

                  <Field label="प्रधानमंत्री आवास योजना के अंतर्गत कितने आवासों का निर्माण पूर्ण हो चुका है? संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.completedHouses || ''} onChange={(e) => setValue('completedHouses', e.target.value)} />
                  </Field>

                  <Field label="कितने परिवारों को आवास स्वीकृत हो चुका है, परंतु निर्माण अभी तक पूर्ण नहीं हुआ है? संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.pendingHouses || ''} onChange={(e) => setValue('pendingHouses', e.target.value)} />
                  </Field>

                  <Field label="ग्राम में कुल कृषि योग्य भूमि">
                    <input className={inputClass} value={formData.totalAgriculturalLand || ''} onChange={(e) => setValue('totalAgriculturalLand', e.target.value)} placeholder="एकड़ / हेक्टेयर" />
                  </Field>

                  <Field label="मुख्य सड़क से ग्राम तक पहुँचने के लिए 12 माह (बारहों महीने) कितने मार्ग उपलब्ध हैं? संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.roadconnectivity || ''} onChange={(e) => setValue('roadconnectivity', e.target.value)} />
                  </Field>

                  <Field label="गाँव की ODF स्थिति">
                    <select className={inputClass} value={formData.odf || ''} onChange={(e) => setValue('odf', e.target.value)}>
                      <option value="">चुनें</option><option>ODF</option><option>ODF+</option><option>ODF++</option><option>Not ODF</option>
                    </select>
                  </Field>

                  <Field label="कुल जनसंख्या संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.totalPopulation || ''} onChange={(e) => setValue('totalPopulation', e.target.value)} />
                  </Field>

                  <Field label="अनुसूचित जनजाति (ST) की संख्या संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.stPopulation || ''} onChange={(e) => setValue('stPopulation', e.target.value)} />
                  </Field>

                  <Field label="गाँव में कुल उपलब्ध कुल अस्पताल (उप-स्वास्थ्य केंद्र, प्राथमिक स्वास्थ्य, सामुदायिक स्वास्थ्य केंद्र) संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.totalHealthFacilities || ''} onChange={(e) => setValue('totalHealthFacilities', e.target.value)} />
                  </Field>

                  <Field label="गाँव में कुल उपलब्ध कुल आश्रम/छात्रावास संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.totalHostels || ''} onChange={(e) => setValue('totalHostels', e.target.value)} />
                  </Field>

                  <Field label="यदि नहीं, तो निकटतम उचित मूल्य की दुकान की दूरी">
                    <input className={inputClass} value={formData.shopDistance || ''} onChange={(e) => setValue('shopDistance', e.target.value)} placeholder="किमी" />
                  </Field>

                  <Field label="यदि नहीं, तो मोबाइल नेटवर्क की सुविधा प्राप्त करने के लिए ग्रामवासियों को लगभग तय करनी पड़ती है दूरी">
                    <input className={inputClass} value={formData.networkDistance || ''} onChange={(e) => setValue('networkDistance', e.target.value)} placeholder="किमी" />
                  </Field>

                  <Field label="क्या गाँव में सोलर स्ट्रीट लाइटिंग प्रणाली है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.solarLight === option}
                            onChange={() => setValue('solarLight', formData.solarLight === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="क्या बारिश के कारण गाँव का संपर्क कट जाता है?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.rainCutoff === option}
                            onChange={() => setValue('rainCutoff', formData.rainCutoff === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="यदि हाँ, तो ग्राम में कितने परिवार नल-जल सुविधा से वंचित हैं? संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.tapWaterExcludedFamilies || ''} onChange={(e) => setValue('tapWaterExcludedFamilies', e.target.value)} />
                  </Field>

                  <Field label="क्या गाँव में पशु चिकित्सक आते हैं या नहीं?">
                    <div className="flex items-center gap-6 h-10">
                      {(['हाँ', 'नहीं'] as const).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.vet === option}
                            onChange={() => setValue('vet', formData.vet === option ? '' : option)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </Field>

                  <Field label="गाँव में कुल कच्चे घरों की संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.rawHouses || ''} onChange={(e) => setValue('rawHouses', e.target.value)} />
                  </Field>

                  <Field label="योजना के लिए पात्र कितने परिवारों को अभी तक आवास स्वीकृत नहीं हुआ है? संख्या">
                    <input type="number" min="0" className={inputClass} value={formData.housingNotSanctioned || ''} onChange={(e) => setValue('housingNotSanctioned', e.target.value)} />
                  </Field>

                  <Field label="ग्राम में बैंकिंग सुविधा">
                    <select className={inputClass} value={formData.banking || ''} onChange={(e) => setValue('banking', e.target.value)}>
                      <option value="">चुनें</option>
                      <option>बैंक शाखा</option>
                      <option>बैंक मित्र/BC</option>
                      <option>दोनों</option>
                      <option>नहीं</option>
                    </select>
                  </Field>

                  <Field label="कुल सिंचित भूमि">
                    <input className={inputClass} value={formData.irrigatedLand || ''} onChange={(e) => setValue('irrigatedLand', e.target.value)} placeholder="एकड़ / हेक्टेयर" />
                  </Field>

                  <Field label="यदि नहीं, तो मुख्य कारण क्या है?">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {[
                            'सड़क की खराब स्थिति',
                            'बारिश के दौरान सड़क पर पानी भरना',
                            'पुलिया/पुल का अभाव',
                            'कच्ची सड़क',
                            'मार्ग अवरुद्ध होना',
                        ].map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer"
                          >
                            <input
                             type="checkbox"
                             checked={formData.roadReasons?.includes(option) || false}
                             onChange={() => {
                              const current = formData.roadReasons || [];

                              const updated = current.includes(option)
                               ? current.filter((item) => item !== option)
                               : [...current, option];

                              setValue('roadReasons', updated);
                              }}
                             className="w-4 h-4 cursor-pointer"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </Field>
                    </div>

                <div className="flex justify-end">
                  <button type="button" onClick={onSave} className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer hover:bg-slate-800">
                    <Save className="w-4 h-4" /> सामान्य जानकारी सहेजें और अगला अनुभाग खोलें
                  </button>
                </div>
              </div>

  );
};

export default GeneralInformation;
