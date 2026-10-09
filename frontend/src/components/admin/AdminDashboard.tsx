import React, { useEffect, useMemo, useState } from 'react';
import { LogOut, LayoutDashboard, ClipboardList, BarChart3 } from 'lucide-react';
import type { Block } from '../../data/narayanpurHierarchy';
import { fetchAuditLogs, fetchHouseholds, fetchSchemeGapStats, fetchVillages, sendCorrectionTicket, updateRegistryStatus, verifyHousehold } from '../../services/liveAdminApi';
const fetchHierarchy = async () => [];
import { downloadApiFile } from '../../services/apiClient';
import type { AuditStatus, AuditLogEntry, HouseholdRecord, LocationFilters, RegistryStatus, SchemeGapStat, VerificationResult, VillageRecord } from '../../types/admin';
import { EmptyState, LoadingBlock, SectionCard, StatCard } from './AdminUI';
import { AdminRecordsPage, type AdminRecordSection } from './AdminRecordsPage';
import { AdminAnalyticsReportsPage } from './AdminAnalyticsReportsPage';
import { downloadCsv } from '../../utils/csv';

type AdminPage = 'overview' | 'records' | 'analytics';
type AnalyticsSection = 'home' | 'census' | 'infrastructure' | 'scheme' | 'priority' | 'exports' | 'gram-report';

const NAV: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'अवलोकन (Overview)', icon: LayoutDashboard },
  { id: 'records', label: 'एडमिन रिकॉर्ड (Admin Records)', icon: ClipboardList },
  { id: 'analytics', label: 'विश्लेषण और रिपोर्ट (Analytics & Reports)', icon: BarChart3 },
];

export const AdminDashboard: React.FC<{ adminId: string; onLogout: () => void }> = ({ adminId, onLogout }) => {
  const [page, setPage] = useState<AdminPage>('overview');
  const [recordSection, setRecordSection] = useState<AdminRecordSection>('home');
  const [analyticsSection, setAnalyticsSection] = useState<AnalyticsSection>('home');
  const [filters, setFilters] = useState<LocationFilters>({ district: '', block: '', panchayat: '', village: '', houseNumber: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'सभी' | AuditStatus>('सभी');
  const [villages, setVillages] = useState<VillageRecord[]>([]);
  const [households, setHouseholds] = useState<HouseholdRecord[]>([]);
  const [schemeGaps, setSchemeGaps] = useState<SchemeGapStat[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [hierarchy, setHierarchy] = useState<Block[]>([]);
  const [dataError, setDataError] = useState('');
  const [ticketTarget, setTicketTarget] = useState<HouseholdRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const districtOptions = ['नारायणपुर'];
  const blockOptions = filters.district ? hierarchy.map((b) => b.blockName) : [];
  const panchayatOptions = useMemo(() => {
    if (!filters.block) return [];
    return hierarchy.find((b) => b.blockName === filters.block)?.panchayats.map((p) => p.name) ?? [];
  }, [filters.block, hierarchy]);
  const villageOptions = useMemo(() => {
    if (!filters.block || !filters.panchayat) return [];
    const block = hierarchy.find((b) => b.blockName === filters.block);
    return block?.panchayats.find((p) => p.name === filters.panchayat)?.villages.map((v) => v.nameHindi) ?? [];
  }, [filters.block, filters.panchayat, hierarchy]);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [v, h, g, logs, blocks] = await Promise.all([
          fetchVillages(filters), fetchHouseholds(filters, { status: statusFilter, search }),
          fetchSchemeGapStats(filters), fetchAuditLogs(), fetchHierarchy().catch(() => [])
        ]);
        if (!active) return;
        setVillages(v);
        setHouseholds(h);
        setSchemeGaps(g);
        setAuditLog(logs);
        setHierarchy(blocks);
        setDataError('');
        setLoading(false);
      } catch (error: unknown) {
        if (!active) return;
        setDataError(error instanceof Error ? error.message : 'प्रशासनिक डेटा लोड नहीं हो सका।');
        setLoading(false);
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, [filters, search, statusFilter]);

  const handleVerify = async (id: string, result: VerificationResult) => {
    try {
      const updated = await verifyHousehold(id, result);
      if (!updated) return;
      setHouseholds((rows) => rows.map((row) => row.id === id ? updated : row));
      setAuditLog(await fetchAuditLogs());
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'सत्यापन सहेजा नहीं जा सका।');
    }
  };

  const handleUpdateStatus = async (id: string, status: RegistryStatus) => {
    try {
      const updated = await updateRegistryStatus(id, status);
      if (!updated) return;
      setHouseholds((rows) => rows.map((row) => row.id === id ? updated : row));
      setAuditLog(await fetchAuditLogs());
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'रजिस्ट्री स्थिति सहेजी नहीं जा सकी।');
    }
  };

  const handleTicket = async (id: string, reason: string, note: string) => {
    try {
      const result = await sendCorrectionTicket(id, reason, note);
      const household = households.find((row) => row.id === id);
      if (!result.success || !household) return;
      setHouseholds((rows) => rows.map((row) => row.id === id ? { ...row, correctionTicketId: result.ticketId, correctionReason: reason, correctionNote: note, correctionCreatedAt: new Date().toISOString(), auditNote: `${reason}${note ? `: ${note}` : ''}`, registryStatus: 'सुधार आवश्यक', auditStatus: 'फ्लैग' } : row));
      setAuditLog(await fetchAuditLogs());
      setTicketTarget(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'सुधार टिकट नहीं बनाया जा सका।');
    }
  };

  const resetFilters = () => { setFilters({ district: '', block: '', panchayat: '', village: '', houseNumber: '' }); setSearch(''); setStatusFilter('सभी'); };
  const exportFilteredHouseholds = async () => {
    const params = new URLSearchParams();
    if (filters.block) params.set('block', filters.block);
    if (filters.panchayat) params.set('panchayat', filters.panchayat);
    if (filters.village) params.set('village', filters.village);
    if (filters.houseNumber) params.set('houseNumber', filters.houseNumber);
    if (statusFilter !== 'सभी') params.set('auditStatus', statusFilter);
    if (search.trim()) params.set('searchQuery', search.trim());
    try {
      await downloadApiFile(`/api/admin/export${params.size ? `?${params}` : ''}`, 'jansetu_households.csv');
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'CSV निर्यात नहीं हो सका।');
    }
  };
  const totalHouseholds = villages.reduce((sum, v) => sum + v.totalHouseholds, 0);
  const surveyed = villages.reduce((sum, v) => sum + v.surveyedHouseholds, 0);
  const flagged = households.filter((h) => h.auditStatus === 'फ्लैग');
  const houseNumberOptions = useMemo(() => Array.from(new Set(households.map((h) => String(h.houseNumber)))).sort((a, b) => Number(a) - Number(b)), [households]);

  return <div className="min-h-screen bg-slate-50 font-hindi">
    <header className="bg-white border-b sticky top-0 z-30"><div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">DMFT</div><div><h1 className="text-sm font-bold text-slate-900">प्रशासनिक / ब्लॉक ऑडिटर कार्यक्षेत्र (Administrative / Block Auditor Workspace)</h1><p className="text-[11px] text-slate-500">आईडी (ID): {adminId}</p></div></div><button onClick={onLogout} className="text-xs border rounded-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"><LogOut className="w-3.5 h-3.5" /> लॉग आउट (Log Out)</button></div></header>
    <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-5"><aside className="bg-white border rounded-xl p-2 h-fit lg:sticky lg:top-20">{NAV.map((item) => { const Icon=item.icon; return <button key={item.id} onClick={()=>setPage(item.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${page===item.id?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-50'}`}><Icon className="w-4 h-4" />{item.label}</button>; })}</aside>
      <main className="space-y-5 min-w-0">{dataError && <div role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 rounded-lg">{dataError}</div>}{loading ? <LoadingBlock message="डेटा लोड हो रहा है…" /> : <>
        {page==='overview' && <Overview villages={villages} totalHouseholds={totalHouseholds} surveyed={surveyed} flagged={flagged} auditLog={auditLog} onOpenRecords={()=>{setPage('records'); setRecordSection('home');}} />}
        {page==='records' && <><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">एडमिन रिकॉर्ड (Admin Records)</h2><p className="text-xs text-slate-500">सभी प्रशासनिक रिकॉर्ड कार्य एक ही जगह से देखें और प्रबंधित करें।</p></div><button onClick={resetFilters} className="text-xs border rounded-md px-3 py-1.5 hover:bg-white cursor-pointer">फ़िल्टर रीसेट (Reset Filters)</button></div><AdminRecordsPage households={households} villages={villages} filters={filters} districtOptions={districtOptions} blockOptions={blockOptions} panchayatOptions={panchayatOptions} villageOptions={villageOptions} houseNumberOptions={houseNumberOptions} onFiltersChange={setFilters} search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onVerify={handleVerify} onUpdateStatus={handleUpdateStatus} onOpenTicket={setTicketTarget} onExportCsv={exportFilteredHouseholds} section={recordSection} onSectionChange={setRecordSection} />{ticketTarget && <TicketModal household={ticketTarget} onClose={()=>setTicketTarget(null)} onSend={handleTicket} />}</>}
        {page==='analytics' && <><div><h2 className="text-lg font-bold text-slate-900">विश्लेषण और रिपोर्ट (Analytics & Reports)</h2><p className="text-xs text-slate-500">प्रत्येक विश्लेषण और रिपोर्ट भाग अलग page पर उपलब्ध है।</p></div><AdminAnalyticsReportsPage villages={villages} households={households} schemeGaps={schemeGaps} section={analyticsSection} onSectionChange={setAnalyticsSection} onExportVillages={()=>downloadCsv('jansetu_villages.csv',villages.map(v=>({village:v.villageName,panchayat:v.panchayat,block:v.block,population:v.totalPopulation,households:v.totalHouseholds,surveyed:v.surveyedHouseholds,completionPercent:v.completionPercent})))} onExportHouseholds={()=>downloadCsv('jansetu_households.csv',households.map(h=>({id:h.id,village:h.villageName,houseNumber:h.houseNumber,head:h.headName,members:h.totalMembers,income:h.incomeSource,auditStatus:h.auditStatus,registryStatus:h.registryStatus||'लंबित'})))} onExportGaps={()=>downloadCsv('jansetu_scheme_gaps.csv',schemeGaps.map(s=>({scheme:s.label,category:s.category,gapPercent:s.gapPercent,gapCount:s.gapCount,priority:s.priority})))} /></>}
      </>}</main></div>
  </div>;
};

const Overview: React.FC<{ villages:VillageRecord[]; totalHouseholds:number; surveyed:number; flagged:HouseholdRecord[]; auditLog:AuditLogEntry[]; onOpenRecords:()=>void }> = ({villages,totalHouseholds,surveyed,flagged,auditLog,onOpenRecords}) => <div className="space-y-5"><div><h2 className="text-lg font-bold text-slate-900">अवलोकन (Overview)</h2><p className="text-xs text-slate-500">सर्वेक्षण की वर्तमान स्थिति का संक्षिप्त सारांश।</p></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><StatCard label="सर्वेक्षित परिवार (Surveyed Households)" value={surveyed} sub={`कुल ${totalHouseholds}`} /><StatCard label="कुल जनसंख्या (Total Population)" value={villages.reduce((s,v)=>s+v.totalPopulation,0)} /><StatCard label="सर्वेक्षण पूर्णता (Survey Completion)" value={`${totalHouseholds?Math.round(surveyed/totalHouseholds*100):0}%`} /><StatCard label="ऑडिट फ्लैग (Audit Flags)" value={flagged.length} tone={flagged.length?'bad':'good'} /></div><SectionCard title="लंबित रिकॉर्ड (Pending Records)" sub="जिन रिकॉर्ड पर प्रशासनिक कार्रवाई की आवश्यकता है" action={<button onClick={onOpenRecords} className="text-xs text-blue-700 font-semibold cursor-pointer">रिकॉर्ड खोलें →</button>}>{flagged.length ? flagged.map(h=><div key={h.id} className="flex justify-between border-b last:border-0 py-2 text-xs"><div><b>{h.headName}</b><p className="text-slate-400">{h.villageName} · मकान {h.houseNumber}</p></div><span className="text-rose-700 font-semibold">फ्लैग</span></div>) : <EmptyState message="कोई लंबित रिकॉर्ड नहीं" />}</SectionCard><SectionCard title="हाल की गतिविधि (Recent Activity)" sub="सिर्फ आवश्यक प्रशासनिक घटनाएं">{auditLog.slice(0,5).map(log=><div key={log.id} className="py-2 border-b last:border-0 text-xs"><p className="text-slate-700">{log.message}</p><span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString('hi-IN')} · {log.actor}</span></div>)}</SectionCard></div>;

const TicketModal: React.FC<{ household:HouseholdRecord; onClose:()=>void; onSend:(id:string,reason:string,note:string)=>void }> = ({household,onClose,onSend}) => { const [reason,setReason]=useState('दस्तावेज़ अंतराल पुनः सत्यापन आवश्यक'); const [note,setNote]=useState(''); return <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-xl w-full max-w-md p-5 shadow-2xl" onClick={e=>e.stopPropagation()}><h3 className="font-bold text-sm">सुधार टिकट / नोटिस (Correction Ticket / Notice)</h3><p className="text-xs text-slate-500 mt-1">{household.villageName} · मकान {household.houseNumber} · {household.headName}</p><label className="block text-xs font-semibold mt-4 mb-1">कारण (Reason)</label><select value={reason} onChange={e=>setReason(e.target.value)} className="w-full border rounded-md px-2.5 py-2 text-xs"><option>दस्तावेज़ अंतराल पुनः सत्यापन आवश्यक</option><option>योजना पात्रता विसंगति</option><option>जनसांख्यिकी डेटा त्रुटि</option><option>बुनियादी सुविधा डेटा त्रुटि</option><option>अन्य</option></select><label className="block text-xs font-semibold mt-3 mb-1">टिप्पणी (Note)</label><textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full border rounded-md p-2 text-xs min-h-20" placeholder="आवश्यक टिप्पणी"/><div className="flex justify-end gap-2 mt-4"><button onClick={onClose} className="border rounded-md px-3 py-1.5 text-xs cursor-pointer">रद्द करें (Cancel)</button><button onClick={()=>onSend(household.id,reason,note)} className="bg-slate-900 text-white rounded-md px-3 py-1.5 text-xs cursor-pointer">टिकट भेजें (Send Ticket)</button></div></div></div>; };
