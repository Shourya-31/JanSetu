import React, { useEffect, useMemo, useState } from 'react';
import type { AuditLogEntry, AuditStatus, HouseholdRecord, LocationFilters, RegistryStatus, VerificationResult, VillageRecord } from '../../types/admin';
import { fetchAuditLogs } from '../../services/liveAdminApi';
import { EmptyState, SectionCard, StatusBadge } from './AdminUI';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Eye, FileWarning, Search, Send, SlidersHorizontal } from 'lucide-react';

export type AdminRecordSection =
  | 'home'
  | 'village-profile'
  | 'scheme-document-gaps'
  | 'audit-verification'
  | 'discrepancy-review'
  | 'correction-ticket'
  | 'registry-status'
  | 'audit-logs';

interface Props {
  households: HouseholdRecord[];
  villages: VillageRecord[];
  filters: LocationFilters;
  districtOptions: string[];
  blockOptions: string[];
  panchayatOptions: string[];
  villageOptions: string[];
  houseNumberOptions: string[];
  onFiltersChange: (filters: LocationFilters) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'सभी' | AuditStatus;
  onStatusFilterChange: (value: 'सभी' | AuditStatus) => void;
  onVerify: (id: string, result: VerificationResult) => void;
  onUpdateStatus: (id: string, status: RegistryStatus) => void;
  onOpenTicket: (household: HouseholdRecord) => void;
  onExportCsv: () => void;
  section: AdminRecordSection;
  onSectionChange: (section: AdminRecordSection) => void;
}

type SectionFilter = {
  query: string;
  block: string;
  panchayat: string;
  village: string;
  auditStatus: 'सभी' | AuditStatus;
  registryStatus: 'सभी' | RegistryStatus;
  verification: 'सभी' | VerificationResult | 'अभी सत्यापित नहीं';
  gapType: 'सभी' | 'दस्तावेज़' | 'योजनाएं' | 'सुविधाएं';
  gapStatus: 'सभी' | 'अंतराल' | 'उपलब्ध';
  discrepancyCategory: 'सभी' | 'दस्तावेज़' | 'योजना' | 'बाल एवं कल्याण' | 'आवास एवं सुविधाएं';
  ticketStatus: 'सभी' | 'टिकट मौजूद' | 'टिकट नहीं';
  ticketReason: 'सभी' | 'दस्तावेज़' | 'योजना' | 'जनसांख्यिकी' | 'सुविधा' | 'अन्य';
  verified: 'सभी' | 'सत्यापित' | 'असत्यापित';
  action: 'सभी' | 'सर्वेक्षण प्राप्त' | 'सर्वेक्षण संशोधन' | 'रिकॉर्ड हटाया' | 'फील्ड सत्यापन' | 'सुधार टिकट' | 'रजिस्ट्री स्थिति अपडेट';
  actor: string;
  fromDate: string;
  toDate: string;
};

const EMPTY_FILTER: SectionFilter = {
  query: '', block: '', panchayat: '', village: '', auditStatus: 'सभी', registryStatus: 'सभी', verification: 'सभी',
  gapType: 'सभी', gapStatus: 'सभी', discrepancyCategory: 'सभी', ticketStatus: 'सभी', ticketReason: 'सभी',
  verified: 'सभी', action: 'सभी', actor: '', fromDate: '', toDate: '',
};

export const AdminRecordsPage: React.FC<Props> = ({
  households, villages, filters, districtOptions, blockOptions, panchayatOptions, villageOptions, houseNumberOptions,
  onFiltersChange, search, onSearchChange, statusFilter, onStatusFilterChange,
  onVerify, onUpdateStatus, onOpenTicket, onExportCsv, section, onSectionChange,
}) => {
  const [selectedId, setSelectedId] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>(EMPTY_FILTER);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    let active = true;
    fetchAuditLogs().then((rows) => { if (active) setAuditLogs(rows); }).catch(() => {
      if (active) setAuditLogs([]);
    });
    return () => { active = false; };
  }, []);

  const selected = households.find((h) => h.id === selectedId) ?? households[0] ?? null;
  const flagged = households.filter((h) => h.auditStatus === 'फ्लैग');

  const updateFilter = (key: keyof LocationFilters, value: string) => {
    // Cascading rule: selecting a parent limits the next field to that parent's children.
    // Clearing/changing a parent clears every descendant to prevent invalid combinations.
    if (key === 'district') return onFiltersChange({ district: value, block: '', panchayat: '', village: '', houseNumber: '' });
    if (key === 'block') return onFiltersChange({ ...filters, block: value, panchayat: '', village: '', houseNumber: '' });
    if (key === 'panchayat') return onFiltersChange({ ...filters, panchayat: value, village: '', houseNumber: '' });
    if (key === 'village') return onFiltersChange({ ...filters, village: value, houseNumber: '' });
    return onFiltersChange({ ...filters, houseNumber: value });
  };

  const updateSectionFilter = <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => {
    setSectionFilter((prev) => ({ ...prev, [key]: value }));
  };

  const resetSectionFilter = () => setSectionFilter(EMPTY_FILTER);

  const selectedForRows = (rows: HouseholdRecord[]) => rows.find((h) => h.id === selectedId) ?? rows[0] ?? null;

  const sectionRows = useMemo(() => applyHouseholdSectionFilter(households, sectionFilter), [households, sectionFilter]);
  const selectedSectionHousehold = selectedForRows(sectionRows);

  const selectedVillage = useMemo(() => {
    if (!selectedSectionHousehold) return null;
    return villages.find((v) => v.villageName === selectedSectionHousehold.villageName) ?? null;
  }, [selectedSectionHousehold, villages]);

  return (
    <div className="space-y-5">
      <AdminRecordNav active={section} onSelect={onSectionChange} />

      {section === 'home' && (
        <>
          <SearchFilterSection
            filters={filters}
            districtOptions={districtOptions}
            blockOptions={blockOptions}
            panchayatOptions={panchayatOptions}
            villageOptions={villageOptions}
            houseNumberOptions={houseNumberOptions}
            onUpdateFilter={updateFilter}
            search={search}
            onSearchChange={onSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
          />
          <HouseholdProfileSection
            household={selected}
            households={households}
            onSelect={setSelectedId}
            onVerify={onVerify}
            onOpenTicket={onOpenTicket}
            onExportCsv={onExportCsv}
            filters={filters}
          />
        </>
      )}

      {section === 'village-profile' && <VillageProfilePage villages={villages} selectedVillage={selectedVillage} resetFilter={resetSectionFilter} />}
      {section === 'scheme-document-gaps' && <SchemeGapSection households={sectionRows} household={selectedSectionHousehold} selectedId={selectedId} onSelect={setSelectedId} filter={sectionFilter} setFilter={updateSectionFilter} resetFilter={resetSectionFilter} />}
      {section === 'audit-verification' && <AuditVerificationSection households={sectionRows} household={selectedSectionHousehold} selectedId={selectedId} onSelect={setSelectedId} flaggedCount={flagged.length} onVerify={onVerify} onOpenTicket={onOpenTicket} filter={sectionFilter} setFilter={updateSectionFilter} resetFilter={resetSectionFilter} />}
      {section === 'discrepancy-review' && <DiscrepancySection households={sectionRows} household={selectedSectionHousehold} selectedId={selectedId} onSelect={setSelectedId} filter={sectionFilter} setFilter={updateSectionFilter} resetFilter={resetSectionFilter} />}
      {section === 'correction-ticket' && <CorrectionSection households={sectionRows} household={selectedSectionHousehold} selectedId={selectedId} onSelect={setSelectedId} onOpenTicket={onOpenTicket} filter={sectionFilter} setFilter={updateSectionFilter} resetFilter={resetSectionFilter} />}
      {section === 'registry-status' && <RegistryStatusSection households={sectionRows} household={selectedSectionHousehold} selectedId={selectedId} onSelect={setSelectedId} onUpdateStatus={onUpdateStatus} filter={sectionFilter} setFilter={updateSectionFilter} resetFilter={resetSectionFilter} />}
      {section === 'audit-logs' && <AuditLogsSection auditLogs={auditLogs} households={sectionRows} household={selectedSectionHousehold} selectedId={selectedId} onSelect={setSelectedId} filter={sectionFilter} setFilter={updateSectionFilter} resetFilter={resetSectionFilter} />}

      {section !== 'home' && (
        <div className="flex justify-end">
          <button onClick={() => onSectionChange('home')} className="text-xs border rounded-md px-3 py-1.5 hover:bg-slate-50 cursor-pointer">रिकॉर्ड पर वापस जाएँ (Back to Records)</button>
        </div>
      )}
    </div>
  );
};

const AdminRecordNav: React.FC<{ active: AdminRecordSection; onSelect: (section: AdminRecordSection) => void }> = ({ active, onSelect }) => {
  const links: { id: AdminRecordSection; label: string }[] = [
    { id: 'home', label: 'रिकॉर्ड (Records)' },
    { id: 'village-profile', label: 'ग्राम प्रोफ़ाइल (Village Profile)' },
    { id: 'scheme-document-gaps', label: 'योजना व दस्तावेज़ अंतराल (Scheme & Document Gaps)' },
    { id: 'audit-verification', label: 'ऑडिट / फील्ड सत्यापन (Audit / Field Verification)' },
    { id: 'discrepancy-review', label: 'विसंगति समीक्षा (Discrepancy Review)' },
    { id: 'correction-ticket', label: 'सुधार टिकट / नोटिस (Correction Ticket / Notice)' },
    { id: 'registry-status', label: 'रजिस्ट्री स्थिति (Registry Status)' },
    { id: 'audit-logs', label: 'ऑडिट लॉग (Audit Logs)' },
  ];
  return <nav aria-label="Admin record sections" className="bg-white border border-slate-200 rounded-xl p-2 flex gap-1.5 overflow-x-auto">
    {links.map((link) => <button key={link.id} type="button" onClick={() => onSelect(link.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors cursor-pointer ${active === link.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{link.label}</button>)}
  </nav>;
};

const FilterSelect: React.FC<{ label: string; value: string; options: string[]; onChange: (value: string) => void }> = ({ label, value, options, onChange }) => (
  <div><label className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-xs bg-white"><option value="सभी">सभी (All)</option>{options.filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
);

const FilterSearch: React.FC<{ value: string; placeholder: string; onChange: (value: string) => void }> = ({ value, placeholder, onChange }) => (
  <div><label className="block text-[10px] font-semibold text-slate-500 mb-1">खोजें (Search)</label><div className="relative"><Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-slate-200 rounded-md pl-8 pr-2.5 py-2 text-xs" /></div></div>
);

const FilterReset: React.FC<{ onReset: () => void }> = ({ onReset }) => <button type="button" onClick={onReset} className="self-end border border-slate-200 rounded-md px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer">रीसेट (Reset)</button>;

const CascadeSelect: React.FC<{ label: string; value: string; options: string[]; placeholder: string; disabled?: boolean; onChange: (value: string) => void }> = ({ label, value, options, placeholder, disabled = false, onChange }) => (
  <div><label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label><select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-xs bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"><option value="">{disabled ? placeholder : `चुनें — ${label.split(' (')[0]}`}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
);

const SearchFilterSection: React.FC<{
  filters: LocationFilters; districtOptions: string[]; blockOptions: string[]; panchayatOptions: string[]; villageOptions: string[]; houseNumberOptions: string[];
  onUpdateFilter: (key: keyof LocationFilters, value: string) => void; search: string; onSearchChange: (value: string) => void; statusFilter: 'सभी' | AuditStatus; onStatusFilterChange: (value: 'सभी' | AuditStatus) => void;
}> = ({ filters, districtOptions, blockOptions, panchayatOptions, villageOptions, houseNumberOptions, onUpdateFilter, search, onSearchChange, statusFilter, onStatusFilterChange }) => (
  <SectionCard title="रिकॉर्ड खोजें और फ़िल्टर करें (Search & Filter Records)" sub="क्रमिक फ़िल्टर: जिला → विकासखंड → ग्राम पंचायत → ग्राम → मकान नंबर। प्रत्येक अगला field पिछले चयन के बाद ही उपलब्ध होता है।" action={<SlidersHorizontal className="w-4 h-4 text-slate-400" />}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
      <CascadeSelect label="जिला (District)" value={filters.district} options={districtOptions} placeholder="जिला चुनें" onChange={(v) => onUpdateFilter('district', v)} />
      <CascadeSelect label="विकासखंड (Block)" value={filters.block} options={blockOptions} placeholder="पहले जिला चुनें" disabled={!filters.district} onChange={(v) => onUpdateFilter('block', v)} />
      <CascadeSelect label="ग्राम पंचायत (Gram Panchayat)" value={filters.panchayat} options={panchayatOptions} placeholder="पहले विकासखंड चुनें" disabled={!filters.block} onChange={(v) => onUpdateFilter('panchayat', v)} />
      <CascadeSelect label="ग्राम (Village)" value={filters.village} options={villageOptions} placeholder="पहले ग्राम पंचायत चुनें" disabled={!filters.panchayat} onChange={(v) => onUpdateFilter('village', v)} />
      <CascadeSelect label="मकान नंबर (House No.)" value={filters.houseNumber} options={houseNumberOptions} placeholder="पहले ग्राम चुनें" disabled={!filters.village} onChange={(v) => onUpdateFilter('houseNumber', v)} />
      <FilterSelect label="ऑडिट स्थिति (Audit Status)" value={statusFilter} options={['सत्यापित', 'लंबित', 'फ्लैग']} onChange={(v) => onStatusFilterChange(v as 'सभी' | AuditStatus)} />
      <FilterSearch value={search} placeholder="ID, मुखिया, मकान नं." onChange={onSearchChange} />
    </div>
    <div className="mt-3 text-[11px] text-slate-500">{filters.district ? <>जिला: <b>{filters.district}</b> · </> : 'जिला नहीं चुना गया'}{filters.block ? <>विकासखंड: <b>{filters.block}</b></> : 'विकासखंड नहीं चुना गया'}{filters.panchayat && <> · ग्राम पंचायत: <b>{filters.panchayat}</b></>}{filters.village && <> · ग्राम: <b>{filters.village}</b></>}{filters.houseNumber && <> · मकान: <b>{filters.houseNumber}</b></>}</div>
  </SectionCard>
);

const toTime = (value: string, end = false) => {
  const time = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00'}`).getTime();
  return Number.isNaN(time) ? null : time;
};

function applyHouseholdSectionFilter(rows: HouseholdRecord[], f: SectionFilter): HouseholdRecord[] {
  const q = f.query.trim().toLowerCase();
  const dateStart = f.fromDate ? new Date(`${f.fromDate}T00:00:00`).getTime() : null;
  const dateEnd = f.toDate ? new Date(`${f.toDate}T23:59:59`).getTime() : null;
  return rows.filter((h) => {
    const text = [h.id, h.trackingId, h.headName, h.mobile, h.villageName, h.panchayat, h.block, String(h.houseNumber)].join(' ').toLowerCase();
    if (q && !text.includes(q)) return false;
    if (f.block && h.block !== f.block) return false;
    if (f.panchayat && h.panchayat !== f.panchayat) return false;
    if (f.village && h.villageName !== f.village) return false;
    if (f.auditStatus !== 'सभी' && h.auditStatus !== f.auditStatus) return false;
    if (f.registryStatus !== 'सभी' && (h.registryStatus || 'लंबित') !== f.registryStatus) return false;
    if (f.verification === 'अभी सत्यापित नहीं' && h.verificationResult) return false;
    if (f.verification !== 'सभी' && f.verification !== 'अभी सत्यापित नहीं' && h.verificationResult !== f.verification) return false;
    if (f.verified === 'सत्यापित' && !h.verifiedAt) return false;
    if (f.verified === 'असत्यापित' && h.verifiedAt) return false;
    if (f.ticketStatus === 'टिकट मौजूद' && !h.correctionTicketId) return false;
    if (f.ticketStatus === 'टिकट नहीं' && h.correctionTicketId) return false;
    if (f.ticketReason !== 'सभी') {
      const reason = h.correctionReason || '';
      const map: Record<string, string[]> = { दस्तावेज़: ['दस्तावेज़'], योजना: ['योजना'], जनसांख्यिकी: ['जनसांख्यिकी'], सुविधा: ['सुविधा'], अन्य: ['अन्य'] };
      if (!map[f.ticketReason]?.some((word) => reason.includes(word))) return false;
    }
    const submitted = new Date(h.submittedAt).getTime();
    if (dateStart !== null && submitted < dateStart) return false;
    if (dateEnd !== null && submitted > dateEnd) return false;
    if (f.gapStatus !== 'सभी') {
      const hasGap = getGapItems(h).some((item) => item.value === 'अंतराल' && (f.gapType === 'सभी' || item.type === f.gapType));
      if (f.gapStatus === 'अंतराल' && !hasGap) return false;
      if (f.gapStatus === 'उपलब्ध' && hasGap) return false;
    }
    if (f.gapType !== 'सभी' && f.gapStatus === 'सभी' && !getGapItems(h).some((item) => item.type === f.gapType)) return false;
    if (f.discrepancyCategory !== 'सभी' && !getDiscrepancies(h, f.discrepancyCategory).length) return false;
    return true;
  });
}

function getGapItems(h: HouseholdRecord): { label: string; value: string; type: 'दस्तावेज़' | 'योजनाएं' | 'सुविधाएं' }[] {
  const items: Array<{ label: string; value: string; type: 'दस्तावेज़' | 'योजनाएं' | 'सुविधाएं' }> = [
    { label: 'आधार', value: h.missingAadhaar ? 'अंतराल' : 'उपलब्ध', type: 'दस्तावेज़' },
    { label: 'जाति प्रमाणपत्र', value: h.missingCasteCert ? 'अंतराल' : 'उपलब्ध', type: 'दस्तावेज़' },
    { label: 'आयुष्मान', value: h.missingAyushman ? 'अंतराल' : 'उपलब्ध', type: 'दस्तावेज़' },
    { label: 'मतदाता ID', value: h.missingVoterId ? 'अंतराल' : 'उपलब्ध', type: 'दस्तावेज़' },
    { label: 'राशन', value: h.hasRationCard, type: 'योजनाएं' }, { label: 'मनरेगा', value: h.hasMNREGA, type: 'योजनाएं' },
    { label: 'श्रमिक कार्ड', value: h.hasShramikCard, type: 'योजनाएं' }, { label: 'जन-धन', value: h.hasJanDhan, type: 'योजनाएं' },
    { label: 'PM-KISAN', value: h.hasPMKisan, type: 'योजनाएं' }, { label: 'JSY', value: h.jsyReceived, type: 'योजनाएं' },
    { label: 'PMMVY', value: h.pmmvyReceived, type: 'योजनाएं' }, { label: 'महतारी वंदना', value: h.mahtariVandana, type: 'योजनाएं' },
    { label: 'विधवा पेंशन', value: h.widowPension, type: 'योजनाएं' }, { label: 'दिव्यांग पेंशन', value: h.divyangPension, type: 'योजनाएं' },
    { label: 'जन्म प्रमाणपत्र', value: h.hasBirthCert, type: 'दस्तावेज़' }, { label: 'टीकाकरण', value: h.childrenVaccinated, type: 'योजनाएं' },
    { label: 'शौचालय', value: h.hasToilet, type: 'सुविधाएं' }, { label: 'नल जल', value: h.hasTapWater, type: 'सुविधाएं' }, { label: 'बिजली', value: h.hasElectricity, type: 'सुविधाएं' },
  ];
  return items.map((item) => ({ ...item, value: item.value === 'नहीं' ? 'अंतराल' : item.value }));
}

function getDiscrepancies(h: HouseholdRecord, category: SectionFilter['discrepancyCategory']): string[] {
  const docs = [h.missingAadhaar ? 'आधार विवरण अधूरा है' : null, h.missingCasteCert ? 'जाति प्रमाणपत्र उपलब्ध नहीं है' : null, h.missingAyushman ? 'आयुष्मान विवरण अधूरा है' : null, h.missingVoterId ? 'मतदाता पहचान विवरण अधूरा है' : null, h.hasBirthCert === 'नहीं' ? 'जन्म प्रमाणपत्र उपलब्ध नहीं है' : null];
  const schemes = [h.hasRationCard === 'नहीं' ? 'राशन कार्ड उपलब्ध नहीं है' : null, h.hasMNREGA === 'नहीं' ? 'मनरेगा कवरेज नहीं है' : null, h.hasShramikCard === 'नहीं' ? 'श्रमिक कार्ड उपलब्ध नहीं है' : null, h.hasJanDhan === 'नहीं' ? 'जन-धन खाता उपलब्ध नहीं है' : null, h.hasPMKisan === 'नहीं' ? 'PM-KISAN लाभ नहीं मिला' : null];
  const child = [h.childrenVaccinated === 'नहीं' ? 'बाल टीकाकरण अधूरा है' : null, h.childrenGoSchool === 'नहीं' ? 'बच्चे स्कूल नहीं जा रहे हैं' : null, h.hotMealAWC === 'नहीं' ? 'आंगनवाड़ी भोजन उपलब्ध नहीं है' : null];
  const utility = [h.hasToilet === 'नहीं' ? 'शौचालय उपलब्ध नहीं है' : null, h.hasTapWater === 'नहीं' ? 'नल जल उपलब्ध नहीं है' : null, h.hasElectricity === 'नहीं' ? 'बिजली उपलब्ध नहीं है' : null];
  if (category === 'दस्तावेज़') return docs.filter(Boolean) as string[];
  if (category === 'योजना') return schemes.filter(Boolean) as string[];
  if (category === 'बाल एवं कल्याण') return child.filter(Boolean) as string[];
  if (category === 'आवास एवं सुविधाएं') return utility.filter(Boolean) as string[];
  return [...docs, ...schemes, ...child, ...utility].filter(Boolean) as string[];
}

const HouseholdPicker: React.FC<{ households: HouseholdRecord[]; selectedId: string; onSelect: (id: string) => void }> = ({ households, selectedId, onSelect }) => (
  <div className="border-t pt-4">
    <div className="flex items-center justify-between mb-2"><h4 className="text-xs font-bold">रिकॉर्ड परिणाम (Record Results)</h4><span className="text-[10px] text-slate-400">{households.length} मिले</span></div>
    {!households.length ? <EmptyState message="इन फ़िल्टर के लिए कोई रिकॉर्ड नहीं मिला।" /> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b bg-slate-50 text-slate-500"><tr><th className="p-2">ID</th><th className="p-2">ग्राम (Village)</th><th className="p-2">मकान (House)</th><th className="p-2">मुखिया (Head)</th><th className="p-2">स्थिति (Status)</th><th className="p-2 text-right">चुनें</th></tr></thead><tbody className="divide-y">{households.map((h) => <tr key={h.id} className={selectedId === h.id ? 'bg-slate-50' : ''}><td className="p-2 font-mono">{h.id}</td><td className="p-2">{h.villageName}</td><td className="p-2">{h.houseNumber}</td><td className="p-2">{h.headName}</td><td className="p-2"><StatusBadge status={h.auditStatus} /></td><td className="p-2 text-right"><button onClick={() => onSelect(h.id)} className="border rounded-md p-1.5 hover:bg-white cursor-pointer" title="रिकॉर्ड चुनें"><Eye className="w-3.5 h-3.5" /></button></td></tr>)}</tbody></table></div>}
  </div>
);

const HouseholdProfileSection: React.FC<{ household: HouseholdRecord | null; households: HouseholdRecord[]; onSelect: (id: string) => void; onVerify: (id: string, result: VerificationResult) => void; onOpenTicket: (h: HouseholdRecord) => void; onExportCsv: () => void; filters: LocationFilters }> = ({ household: h, households, onSelect, onVerify, onOpenTicket, onExportCsv, filters }) => {
  const groups: [string, [string, React.ReactNode][]][] = [
    ['परिवार पहचान (Household Identity)', [['ट्रैकिंग आईडी (Tracking ID)', h?.trackingId], ['परिवार मुखिया (Head)', h?.headName], ['मोबाइल (Mobile)', h?.mobile], ['मकान नंबर (House No.)', h?.houseNumber], ['ग्राम (Village)', h?.villageName], ['BPL स्थिति (BPL)', h?.isBPL]]],
    ['जनसांख्यिकी (Demographics)', [['जाति (Caste)', h?.caste], ['कुल सदस्य (Members)', h?.totalMembers], ['वृद्ध सदस्य (Elders)', h?.eldersCount], ['बच्चे (Children)', h?.childrenCount], ['बेरोजगार (Unemployed)', h?.unemployedCount], ['आय स्रोत (Income Source)', h?.incomeSource]]],
    ['दस्तावेज़ स्थिति (Identity Documents)', [['आधार अंतराल (Aadhaar Gap)', h?.missingAadhaar], ['जाति प्रमाणपत्र अंतराल (Caste Gap)', h?.missingCasteCert], ['आयुष्मान अंतराल (Ayushman Gap)', h?.missingAyushman], ['मतदाता पहचान अंतराल (Voter Gap)', h?.missingVoterId]]],
    ['योजना स्थिति (Scheme Status)', [['राशन कार्ड (Ration)', h?.hasRationCard], ['मनरेगा (MGNREGA)', h?.hasMNREGA], ['श्रमिक कार्ड (Shramik Card)', h?.hasShramikCard], ['जन-धन (Jan-Dhan)', h?.hasJanDhan], ['KCC', h?.hasKCC], ['PM-KISAN', h?.hasPMKisan], ['JSY', h?.jsyReceived], ['PMMVY', h?.pmmvyReceived], ['महतारी वंदना (Mahtari Vandana)', h?.mahtariVandana], ['विधवा पेंशन (Widow Pension)', h?.widowPension], ['दिव्यांग पेंशन (Disability Pension)', h?.divyangPension]]],
    ['बाल एवं कल्याण (Child & Welfare)', [['जन्म प्रमाणपत्र (Birth Certificate)', h?.hasBirthCert], ['टीकाकरण (Vaccination)', h?.childrenVaccinated], ['आंगनवाड़ी भोजन (AWC Hot Meal)', h?.hotMealAWC], ['स्कूल उपस्थिति (School Attendance)', h?.childrenGoSchool]]],
    ['आवास एवं सुविधाएं (Housing & Utilities)', [['खनन श्रमिक (Mining Worker)', h?.isMiningWorker], ['घर का प्रकार (House Type)', h?.houseType], ['सरकारी आवास (Govt Housing)', h?.hasGovtHousing], ['शौचालय (Toilet)', h?.hasToilet], ['नल जल (Tap Water)', h?.hasTapWater], ['जल स्रोत (Water Source)', h?.waterSource], ['बिजली (Electricity)', h?.hasElectricity], ['सोलर (Solar)', h?.usesSolar]]],
    ['स्वास्थ्य स्थिति (Health Profile)', [['दीर्घकालिक बीमारी (Chronic Illness)', h?.chronicIllness], ['निःशुल्क दवा (Free Medicine)', h?.freeMedicine]]],
  ];
  return <SectionCard title="परिवार प्रोफ़ाइल (Household Profile)" sub={`${households.length} रिकॉर्ड प्रदर्शित`} action={<button onClick={onExportCsv} className="text-xs font-semibold border rounded-md px-3 py-1.5 hover:bg-slate-50 cursor-pointer">CSV निर्यात (Export)</button>}>
    {!filters.district ? <EmptyState message="पहले जिला चुनें।" /> : !filters.block ? <EmptyState message="पहले विकासखंड चुनें।" /> : !households.length ? <EmptyState message="चयनित फ़िल्टर के लिए कोई रिकॉर्ड नहीं मिला।" /> : <div className="space-y-5"><HouseholdPicker households={households} selectedId={h?.id || ''} onSelect={onSelect} /><div className="border-t pt-4"><h4 className="text-xs font-bold text-slate-900 mb-3">चयनित परिवार का विवरण (Selected Household Details)</h4>{!h ? <EmptyState message="विवरण देखने के लिए कोई रिकॉर्ड चुनें।" /> : <div className="space-y-4">{groups.map(([title, fields]) => <div key={title}><h5 className="text-xs font-bold text-slate-700 mb-2">{title}</h5><div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{fields.map(([label, value]) => <Field key={label} label={label} value={value ?? '—'} />)}</div></div>)}<div className="flex flex-wrap gap-2"><button onClick={() => onVerify(h.id, 'सत्यापित')} className="px-3 py-2 rounded-md bg-slate-900 text-white text-xs cursor-pointer">सत्यापित (Verify)</button>{h.auditStatus === 'फ्लैग' && <button onClick={() => onOpenTicket(h)} className="px-3 py-2 rounded-md border text-xs cursor-pointer">सुधार टिकट (Correction Ticket)</button>}</div></div>}</div></div>}
  </SectionCard>;
};

const HouseholdSectionFilters: React.FC<{ kind: 'scheme' | 'audit' | 'discrepancy' | 'ticket' | 'registry' | 'logs'; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ kind, filter, setFilter, resetFilter }) => {
  const common = <FilterSearch value={filter.query} placeholder="ID, मुखिया, गांव, मकान..." onChange={(v) => setFilter('query', v)} />;
  return <SectionCard title="खोज और फ़िल्टर (Search & Filter)" sub="इस section के रिकॉर्ड को आवश्यक fields से जल्दी खोजें और सीमित करें।" action={<SlidersHorizontal className="w-4 h-4 text-slate-400" />}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
      {common}
      {kind === 'scheme' && <><FilterSelect label="प्रकार (Type)" value={filter.gapType} options={['दस्तावेज़', 'योजनाएं', 'सुविधाएं']} onChange={(v) => setFilter('gapType', v as SectionFilter['gapType'])} /><FilterSelect label="स्थिति (Gap Status)" value={filter.gapStatus} options={['अंतराल', 'उपलब्ध']} onChange={(v) => setFilter('gapStatus', v as SectionFilter['gapStatus'])} /></>}
      {kind === 'audit' && <><FilterSelect label="ऑडिट स्थिति (Audit)" value={filter.auditStatus} options={['सत्यापित', 'लंबित', 'फ्लैग']} onChange={(v) => setFilter('auditStatus', v as SectionFilter['auditStatus'])} /><FilterSelect label="सत्यापन परिणाम (Verification)" value={filter.verification} options={['सत्यापित', 'विसंगति मिली', 'पुनः सत्यापन आवश्यक', 'अभी सत्यापित नहीं']} onChange={(v) => setFilter('verification', v as SectionFilter['verification'])} /><FilterSelect label="सत्यापन (Verified)" value={filter.verified} options={['सत्यापित', 'असत्यापित']} onChange={(v) => setFilter('verified', v as SectionFilter['verified'])} /><FilterSelect label="रजिस्ट्री (Registry)" value={filter.registryStatus} options={['लंबित', 'सत्यापित', 'सुधार आवश्यक', 'पुनः सत्यापन आवश्यक', 'बंद']} onChange={(v) => setFilter('registryStatus', v as SectionFilter['registryStatus'])} /></>}
      {kind === 'discrepancy' && <FilterSelect label="विसंगति प्रकार (Category)" value={filter.discrepancyCategory} options={['दस्तावेज़', 'योजना', 'बाल एवं कल्याण', 'आवास एवं सुविधाएं']} onChange={(v) => setFilter('discrepancyCategory', v as SectionFilter['discrepancyCategory'])} />}
      {kind === 'ticket' && <><FilterSelect label="टिकट (Ticket)" value={filter.ticketStatus} options={['टिकट मौजूद', 'टिकट नहीं']} onChange={(v) => setFilter('ticketStatus', v as SectionFilter['ticketStatus'])} /><FilterSelect label="कारण (Reason)" value={filter.ticketReason} options={['दस्तावेज़', 'योजना', 'जनसांख्यिकी', 'सुविधा', 'अन्य']} onChange={(v) => setFilter('ticketReason', v as SectionFilter['ticketReason'])} /><FilterSelect label="ऑडिट (Audit)" value={filter.auditStatus} options={['सत्यापित', 'लंबित', 'फ्लैग']} onChange={(v) => setFilter('auditStatus', v as SectionFilter['auditStatus'])} /></>}
      {kind === 'registry' && <><FilterSelect label="रजिस्ट्री स्थिति (Registry)" value={filter.registryStatus} options={['लंबित', 'सत्यापित', 'सुधार आवश्यक', 'पुनः सत्यापन आवश्यक', 'बंद']} onChange={(v) => setFilter('registryStatus', v as SectionFilter['registryStatus'])} /><FilterSelect label="ऑडिट स्थिति (Audit)" value={filter.auditStatus} options={['सत्यापित', 'लंबित', 'फ्लैग']} onChange={(v) => setFilter('auditStatus', v as SectionFilter['auditStatus'])} /><DateField label="से (From)" value={filter.fromDate} onChange={(v) => setFilter('fromDate', v)} /><DateField label="तक (To)" value={filter.toDate} onChange={(v) => setFilter('toDate', v)} /></>}
      {kind === 'logs' && <><FilterSelect label="कार्रवाई (Action)" value={filter.action} options={['सर्वेक्षण प्राप्त', 'सर्वेक्षण संशोधन', 'रिकॉर्ड हटाया', 'फील्ड सत्यापन', 'सुधार टिकट', 'रजिस्ट्री स्थिति अपडेट']} onChange={(v) => setFilter('action', v as SectionFilter['action'])} /><div><label className="block text-[10px] font-semibold text-slate-500 mb-1">अभिनेता (Actor)</label><input value={filter.actor} onChange={(e) => setFilter('actor', e.target.value)} placeholder="उदा. Block Auditor" className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-xs" /></div><DateField label="से (From)" value={filter.fromDate} onChange={(v) => setFilter('fromDate', v)} /><DateField label="तक (To)" value={filter.toDate} onChange={(v) => setFilter('toDate', v)} /></>}
      <FilterReset onReset={resetFilter} />
    </div>
  </SectionCard>;
};

const DateField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => <div><label className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</label><input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-md px-2.5 py-2 text-xs" /></div>;

const VillageProfilePage: React.FC<{ villages: VillageRecord[]; selectedVillage: VillageRecord | null; resetFilter: () => void }> = ({ villages, selectedVillage, resetFilter }) => {
  const [villageQuery, setVillageQuery] = useState('');
  const [block, setBlock] = useState('सभी');
  const [panchayat, setPanchayat] = useState('सभी');
  const [road, setRoad] = useState('सभी');
  const [odf, setOdf] = useState('सभी');
  const blocks = Array.from(new Set(villages.map((v) => v.block)));
  const panchayats = Array.from(new Set(villages.filter((v) => block === 'सभी' || v.block === block).map((v) => v.panchayat)));
  const results = villages.filter((v) => (!villageQuery || [v.id, v.villageName, v.panchayat, v.block].join(' ').toLowerCase().includes(villageQuery.toLowerCase())) && (block === 'सभी' || v.block === block) && (panchayat === 'सभी' || v.panchayat === panchayat) && (road === 'सभी' || v.hasPuccaRoad === road) && (odf === 'सभी' || v.odfStatus === odf));
  const activeVillage = selectedVillage && results.some((v) => v.id === selectedVillage.id) ? selectedVillage : results[0] ?? null;
  return <div className="space-y-4"><SectionCard title="खोज और फ़िल्टर (Search & Filter)" sub="ग्राम प्रोफ़ाइल को ग्राम, विकासखंड, पंचायत और सुविधा स्थिति से फ़िल्टर करें."><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5"><FilterSearch value={villageQuery} placeholder="ग्राम, पंचायत, ID..." onChange={setVillageQuery} /><FilterSelect label="विकासखंड (Block)" value={block} options={blocks} onChange={(v) => { setBlock(v); setPanchayat('सभी'); }} /><FilterSelect label="ग्राम पंचायत (Panchayat)" value={panchayat} options={panchayats} onChange={setPanchayat} /><FilterSelect label="पक्की सड़क (Pucca Road)" value={road} options={['हां', 'नहीं']} onChange={setRoad} /><FilterSelect label="ODF स्थिति (ODF)" value={odf} options={Array.from(new Set(villages.map((v) => v.odfStatus)))} onChange={setOdf} /><FilterReset onReset={() => { setVillageQuery(''); setBlock('सभी'); setPanchayat('सभी'); setRoad('सभी'); setOdf('सभी'); resetFilter(); }} /></div></SectionCard><SectionCard title="ग्राम परिणाम (Village Results)" sub={`${results.length} ग्राम मिले`}><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b bg-slate-50 text-slate-500"><tr><th className="p-2">ग्राम</th><th className="p-2">पंचायत</th><th className="p-2">विकासखंड</th><th className="p-2">जनसंख्या</th><th className="p-2">पूर्णता</th></tr></thead><tbody className="divide-y">{results.map((v) => <tr key={v.id} className={activeVillage?.id === v.id ? 'bg-slate-50' : ''}><td className="p-2 font-medium">{v.villageName}</td><td className="p-2">{v.panchayat}</td><td className="p-2">{v.block}</td><td className="p-2">{v.totalPopulation}</td><td className="p-2">{v.completionPercent}%</td></tr>)}</tbody></table></div></SectionCard><VillageDetails village={activeVillage} /></div>;
};

const VillageDetails: React.FC<{ village: VillageRecord | null }> = ({ village: v }) => <SectionCard title="ग्राम प्रोफ़ाइल (Village Profile)" sub="ग्राम सर्वेक्षण और आधारभूत संरचना का प्रशासनिक सारांश">{!v ? <EmptyState message="इन फ़िल्टर के लिए कोई ग्राम नहीं मिला।" /> : <div className="space-y-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{[['ग्राम (Village)', v.villageName], ['पंचायत (Panchayat)', v.panchayat], ['विकासखंड (Block)', v.block], ['जनसंख्या (Population)', v.totalPopulation], ['कुल परिवार (Households)', v.totalHouseholds], ['SC जनसंख्या (SC)', v.scCount], ['ST जनसंख्या (ST)', v.stCount], ['पक्का घर (Pucca)', v.puccaHouses], ['अर्ध-पक्का (Semi-pucca)', v.semiPuccaHouses], ['कच्चा घर (Kaccha)', v.kacchaHouses], ['खदान दूरी (Mine Distance)', v.mineDistanceKm], ['पक्की सड़क (Pucca Road)', v.hasPuccaRoad], ['मानसून कट-ऑफ (Monsoon)', v.monsoonCutOff], ['विद्यालय (School)', v.schoolType], ['स्वास्थ्य केंद्र (Health Centre)', v.hospitalType], ['विद्युतीकरण (Electrification)', v.electrification], ['आंगनवाड़ी (AWC)', v.hasAnganwadi], ['ODF स्थिति (ODF)', v.odfStatus]].map(([l, val]) => <Field key={String(l)} label={String(l)} value={val} />)}</div><div><h4 className="text-xs font-bold mb-2">अंतराल मैट्रिक्स (Infrastructure Gap Matrix)</h4><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50"><tr><th className="p-2 text-left">सुविधा (Facility)</th><th>वर्तमान</th><th>कार्यशील</th><th>आवश्यक</th><th>अंतराल</th></tr></thead><tbody className="divide-y">{Object.entries(v.gapMatrix).map(([label, g]) => <tr key={label}><td className="p-2">{label}</td><td className="text-center">{g.current}</td><td className="text-center">{g.functional}</td><td className="text-center">{g.required}</td><td className="text-center font-bold">{g.gap}</td></tr>)}</tbody></table></div></div></div>}</SectionCard>;

const SchemeGapSection: React.FC<{ households: HouseholdRecord[]; household: HouseholdRecord | null; selectedId: string; onSelect: (id: string) => void; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ households, household: h, selectedId, onSelect, filter, setFilter, resetFilter }) => <div className="space-y-4"><HouseholdSectionFilters kind="scheme" filter={filter} setFilter={setFilter} resetFilter={resetFilter} /><SectionCard title="परिवार अंतराल परिणाम (Household Gap Results)" sub="दस्तावेज़, योजनाओं और सुविधाओं के gaps के आधार पर फ़िल्टर किए गए रिकॉर्ड"><HouseholdPicker households={households} selectedId={selectedId} onSelect={onSelect} /></SectionCard><SectionCard title="योजना और दस्तावेज़ अंतराल (Scheme & Document Gaps)" sub="चयनित परिवार की स्थिति">{!h ? <EmptyState message="ऊपर से परिवार रिकॉर्ड चुनें।" /> : <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{getGapItems(h).map((item) => <div key={item.label} className={`rounded-lg border p-3 ${item.value === 'अंतराल' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-[10px] text-slate-500">{item.label}</p><p className="text-xs font-bold mt-1">{item.value}</p><p className="text-[9px] text-slate-400 mt-1">{item.type}</p></div>)}</div>}</SectionCard></div>;

const AuditVerificationSection: React.FC<{ households: HouseholdRecord[]; household: HouseholdRecord | null; selectedId: string; onSelect: (id: string) => void; flaggedCount: number; onVerify: (id: string, result: VerificationResult) => void; onOpenTicket: (h: HouseholdRecord) => void; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ households, household: h, selectedId, onSelect, flaggedCount, onVerify, onOpenTicket, filter, setFilter, resetFilter }) => <div className="space-y-4"><HouseholdSectionFilters kind="audit" filter={filter} setFilter={setFilter} resetFilter={resetFilter} /><SectionCard title="सत्यापन के लिए रिकॉर्ड (Records for Verification)" sub={`${households.length} रिकॉर्ड · ${flaggedCount} फ्लैग कुल`}><HouseholdPicker households={households} selectedId={selectedId} onSelect={onSelect} /></SectionCard><SectionCard title="ऑडिट / फील्ड सत्यापन (Audit / Field Verification)" sub="चयनित रिकॉर्ड पर सत्यापन कार्रवाई">{!h ? <EmptyState message="ऊपर से परिवार रिकॉर्ड चुनें।" /> : <div className="space-y-3"><div className="grid grid-cols-1 md:grid-cols-3 gap-2"><Field label="वर्तमान स्थिति (Current Status)" value={<StatusBadge status={h.auditStatus} />} /><Field label="सत्यापन परिणाम (Verification Result)" value={h.verificationResult || 'अभी नहीं'} /><Field label="सत्यापनकर्ता (Verified By)" value={h.verifiedBy || '—'} /></div><div className="flex flex-wrap gap-2"><button onClick={() => onVerify(h.id, 'सत्यापित')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-900 text-white text-xs cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" /> सत्यापित (Verified)</button><button onClick={() => onVerify(h.id, 'विसंगति मिली')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs cursor-pointer"><AlertTriangle className="w-3.5 h-3.5" /> विसंगति मिली (Discrepancy)</button><button onClick={() => onVerify(h.id, 'पुनः सत्यापन आवश्यक')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs cursor-pointer">पुनः सत्यापन (Re-verify)</button>{h.auditStatus === 'फ्लैग' && <button onClick={() => onOpenTicket(h)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs cursor-pointer"><Send className="w-3.5 h-3.5" /> सुधार टिकट</button>}</div></div>}</SectionCard></div>;

const DiscrepancySection: React.FC<{ households: HouseholdRecord[]; household: HouseholdRecord | null; selectedId: string; onSelect: (id: string) => void; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ households, household: h, selectedId, onSelect, filter, setFilter, resetFilter }) => <div className="space-y-4"><HouseholdSectionFilters kind="discrepancy" filter={filter} setFilter={setFilter} resetFilter={resetFilter} /><SectionCard title="विसंगति वाले रिकॉर्ड (Records with Discrepancies)" sub="चयनित category में कम-से-कम एक review point वाले रिकॉर्ड"><HouseholdPicker households={households.filter((row) => getDiscrepancies(row, filter.discrepancyCategory).length > 0)} selectedId={selectedId} onSelect={onSelect} /></SectionCard><SectionCard title="विसंगति समीक्षा (Discrepancy Review)" sub="चयनित परिवार के review points">{!h ? <EmptyState message="ऊपर से परिवार रिकॉर्ड चुनें।" /> : (() => { const issues = getDiscrepancies(h, filter.discrepancyCategory); return issues.length ? <div className="grid md:grid-cols-2 gap-2">{issues.map((issue) => <div key={issue} className="flex items-center gap-2 text-xs text-rose-700 border border-rose-100 bg-rose-50 rounded-md p-2"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />{issue}</div>)}</div> : <div className="text-xs text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />कोई स्पष्ट विसंगति नहीं मिली (No clear discrepancy found).</div>; })()}</SectionCard></div>;

const CorrectionSection: React.FC<{ households: HouseholdRecord[]; household: HouseholdRecord | null; selectedId: string; onSelect: (id: string) => void; onOpenTicket: (h: HouseholdRecord) => void; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ households, household: h, selectedId, onSelect, onOpenTicket, filter, setFilter, resetFilter }) => <div className="space-y-4"><HouseholdSectionFilters kind="ticket" filter={filter} setFilter={setFilter} resetFilter={resetFilter} /><SectionCard title="सुधार टिकट रिकॉर्ड (Correction Ticket Records)" sub="टिकट वाले और टिकट के बिना रिकॉर्ड"><HouseholdPicker households={households} selectedId={selectedId} onSelect={onSelect} /></SectionCard><SectionCard title="सुधार टिकट / नोटिस (Correction Ticket / Notice)" sub="चयनित रिकॉर्ड के correction workflow">{!h ? <EmptyState message="ऊपर से परिवार रिकॉर्ड चुनें।" /> : <div className="flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-slate-600"><FileWarning className="inline w-4 h-4 mr-2" />{h.correctionTicketId ? <><b>{h.correctionTicketId}</b> · {h.correctionReason}<br /><span className="text-slate-400">{h.correctionNote || 'कोई अतिरिक्त टिप्पणी नहीं।'}</span></> : (h.auditNote || 'अभी कोई correction ticket नहीं है।')}</div><button onClick={() => onOpenTicket(h)} className="border rounded-md px-3 py-2 text-xs font-semibold cursor-pointer">{h.correctionTicketId ? 'टिकट अपडेट करें (Update Ticket)' : 'टिकट बनाएं (Create Ticket)'}</button></div>}</SectionCard></div>;

const RegistryStatusSection: React.FC<{ households: HouseholdRecord[]; household: HouseholdRecord | null; selectedId: string; onSelect: (id: string) => void; onUpdateStatus: (id: string, status: RegistryStatus) => void; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ households, household: h, selectedId, onSelect, onUpdateStatus, filter, setFilter, resetFilter }) => <div className="space-y-4"><HouseholdSectionFilters kind="registry" filter={filter} setFilter={setFilter} resetFilter={resetFilter} /><SectionCard title="रजिस्ट्री रिकॉर्ड (Registry Records)" sub="स्थिति और submission date से फ़िल्टर किए गए रिकॉर्ड"><HouseholdPicker households={households} selectedId={selectedId} onSelect={onSelect} /></SectionCard><SectionCard title="रजिस्ट्री स्थिति अपडेट (Update Registry Status)" sub="चयनित रिकॉर्ड की registry स्थिति बदलें">{!h ? <EmptyState message="ऊपर से परिवार रिकॉर्ड चुनें।" /> : <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"><Field label="रिकॉर्ड ID (Record ID)" value={h.id} /><Field label="वर्तमान स्थिति (Current Status)" value={h.registryStatus || 'लंबित'} /><Field label="अंतिम सबमिशन (Submitted At)" value={new Date(h.submittedAt).toLocaleString('en-IN')} /><div><label className="block text-[10px] text-slate-400 mb-1">नई स्थिति (New Status)</label><select defaultValue={h.registryStatus || 'लंबित'} onChange={(e) => onUpdateStatus(h.id, e.target.value as RegistryStatus)} className="w-full border rounded-md px-2.5 py-2 text-xs"><option>लंबित</option><option>सत्यापित</option><option>सुधार आवश्यक</option><option>पुनः सत्यापन आवश्यक</option><option>बंद</option></select></div></div>}</SectionCard></div>;

const AuditLogsSection: React.FC<{ auditLogs: AuditLogEntry[]; households: HouseholdRecord[]; household: HouseholdRecord | null; selectedId: string; onSelect: (id: string) => void; filter: SectionFilter; setFilter: <K extends keyof SectionFilter>(key: K, value: SectionFilter[K]) => void; resetFilter: () => void }> = ({ auditLogs, households, household: h, selectedId, onSelect, filter, setFilter, resetFilter }) => {
  const events = auditLogs
    .map((log) => ({ type: log.action, actor: log.actor, timestamp: log.timestamp, message: log.message }))
    .filter((event) => filter.action === 'सभी' || event.type === filter.action)
    .filter((event) => !filter.actor || event.actor.toLowerCase().includes(filter.actor.toLowerCase()))
    .filter((event) => !filter.fromDate || new Date(event.timestamp).getTime() >= (toTime(filter.fromDate) ?? Infinity))
    .filter((event) => !filter.toDate || new Date(event.timestamp).getTime() <= (toTime(filter.toDate, true) ?? -Infinity))
    .filter((event) => !filter.query || `${event.message} ${event.actor}`.toLowerCase().includes(filter.query.toLowerCase()));
  return <div className="space-y-4"><HouseholdSectionFilters kind="logs" filter={filter} setFilter={setFilter} resetFilter={resetFilter} /><SectionCard title="ऑडिट लॉग परिणाम (Audit Log Results)" sub={`${events.length} events मिले`}><div className="space-y-2">{events.length ? events.map((event, index) => <div key={`${event.timestamp}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg"><ClipboardCheck className="w-4 h-4 mt-0.5 text-slate-500" /><div><p className="font-semibold text-xs">{event.message}</p><p className="text-[10px] text-slate-500">{event.type} · {event.actor} · {new Date(event.timestamp).toLocaleString('en-IN')}</p></div></div>) : <EmptyState message="इन फ़िल्टर के लिए कोई audit event नहीं मिला।" />}</div></SectionCard><SectionCard title="संबंधित रिकॉर्ड (Related Records)" sub="किसी रिकॉर्ड को चुनकर उसकी activity देखें"><HouseholdPicker households={households} selectedId={selectedId} onSelect={onSelect} /></SectionCard>{h && <SectionCard title="चयनित रिकॉर्ड (Selected Record)" sub={h.id}><div className="grid grid-cols-2 lg:grid-cols-4 gap-2"><Field label="मुखिया (Head)" value={h.headName} /><Field label="ग्राम (Village)" value={h.villageName} /><Field label="ऑडिट स्थिति (Audit)" value={h.auditStatus} /><Field label="रजिस्ट्री स्थिति (Registry)" value={h.registryStatus || 'लंबित'} /></div></SectionCard>}</div>;
};

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => <div className="border border-slate-100 rounded-lg px-3 py-2"><span className="block text-[10px] text-slate-400">{label}</span><strong className="block text-xs text-slate-800 mt-0.5">{value}</strong></div>;
