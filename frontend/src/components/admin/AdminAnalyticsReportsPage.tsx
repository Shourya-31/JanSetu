import React from 'react';
import type { HouseholdRecord, SchemeGapStat, VillageRecord } from '../../types/admin';
import { ProgressBar, SectionCard, StatCard, PriorityBadge, EmptyState } from './AdminUI';
import { AlertTriangle, Download, FileBarChart2 } from 'lucide-react';

type AnalyticsSection = 'home' | 'census' | 'infrastructure' | 'scheme' | 'priority' | 'exports';

interface Props { villages: VillageRecord[]; households: HouseholdRecord[]; schemeGaps: SchemeGapStat[]; section: AnalyticsSection; onSectionChange:(section:AnalyticsSection)=>void; onExportVillages:()=>void; onExportHouseholds:()=>void; onExportGaps:()=>void; }

export const AdminAnalyticsReportsPage: React.FC<Props> = ({ villages, households, schemeGaps, section, onSectionChange, onExportVillages, onExportHouseholds, onExportGaps }) => {
  const totalHouseholds=villages.reduce((s,v)=>s+v.totalHouseholds,0);
  const surveyed=villages.reduce((s,v)=>s+v.surveyedHouseholds,0);
  const population=villages.reduce((s,v)=>s+v.totalPopulation,0);
  const flagged=households.filter(h=>h.auditStatus==='फ्लैग').length;
  const completion=totalHouseholds?Math.round(surveyed/totalHouseholds*100):0;
  const infrastructure=villages.flatMap(v=>Object.entries(v.gapMatrix).map(([label,gap])=>({label,gap,village:v.villageName}))).sort((a,b)=>b.gap.gap-a.gap.gap);

  const nav: {id:AnalyticsSection;label:string}[] = [
    {id:'home',label:'विश्लेषण (Analytics)'},
    {id:'census',label:'जनगणना व जनसांख्यिकी (Census & Demographic)'},
    {id:'infrastructure',label:'बुनियादी ढांचा कमी (Infrastructure Deficit)'},
    {id:'scheme',label:'योजना संतृप्ति (Scheme Saturation)'},
    {id:'priority',label:'प्राथमिकता डैशबोर्ड (Priority Dashboard)'},
    {id:'exports',label:'रिपोर्ट निर्यात (Export Reports)'},
  ];

  return <div className="space-y-5">
    <nav aria-label="Analytics sections" className="bg-white border border-slate-200 rounded-xl p-2 flex gap-1.5 overflow-x-auto">
      {nav.map(item=><button key={item.id} type="button" onClick={()=>onSectionChange(item.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold cursor-pointer ${section===item.id?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-50'}`}>{item.label}</button>)}
    </nav>

    {section==='home' && <SectionCard title="विश्लेषण (Analytics)" sub="एक अलग page चुनें ताकि हर analytics/report section focused view में खुले।"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{nav.slice(1).map(item=><button key={item.id} onClick={()=>onSectionChange(item.id)} className="text-left border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"><p className="text-xs font-bold">{item.label}</p><p className="text-[10px] text-slate-400 mt-1">इस section को खोलें →</p></button>)}</div></SectionCard>}

    {section==='census' && <SectionCard title="जनगणना और जनसांख्यिकीय विश्लेषण (Census & Demographic Analytics)" sub="जनसंख्या, परिवार, सामाजिक समूह और survey coverage का प्रशासनिक सारांश"><div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><StatCard label="जनसंख्या (Population)" value={population}/><StatCard label="परिवार (Households)" value={totalHouseholds}/><StatCard label="सर्वेक्षित (Surveyed)" value={surveyed}/><StatCard label="कवरेज (Coverage)" value={`${completion}%`}/><StatCard label="ऑडिट फ्लैग (Flags)" value={flagged} tone={flagged?'bad':'good'}/></div><div className="mt-4 space-y-3">{villages.map(v=><ProgressBar key={v.id} percent={v.completionPercent} label={`${v.villageName} · ${v.totalPopulation} जनसंख्या`}/>)}</div></SectionCard>}

    {section==='infrastructure' && <SectionCard title="बुनियादी ढांचा कमी विश्लेषण (Infrastructure Deficit Analytics)" sub="ग्राम प्रोफ़ाइल के infrastructure gap matrix से प्राथमिकता वाले deficits">{infrastructure.length?<div className="grid md:grid-cols-2 gap-3">{infrastructure.map(item=><div key={`${item.village}-${item.label}`} className="border rounded-lg p-3"><div className="flex justify-between gap-3 text-xs"><b>{item.label}</b><span className="font-mono">gap {item.gap.gap}</span></div><p className="text-[11px] text-slate-400 mt-1">{item.village} · वर्तमान {item.gap.current} · कार्यशील {item.gap.functional} · आवश्यक {item.gap.required}</p></div>)}</div>:<EmptyState message="Infrastructure gap data उपलब्ध नहीं है."/>}</SectionCard>}

    {section==='scheme' && <SectionCard title="योजना संतृप्ति विश्लेषण (Scheme Saturation Analytics)" sub="दस्तावेज़ और योजनाओं की coverage/gap स्थिति">{schemeGaps.length?<div className="space-y-4">{schemeGaps.map(item=><div key={item.key}><ProgressBar percent={100-item.gapPercent} label={`${item.label} · coverage`}/><div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>{item.gapCount} gap / {item.totalHouseholds} records</span><PriorityBadge priority={item.priority}/></div></div>)}</div>:<EmptyState message="Scheme gap data उपलब्ध नहीं है."/>}</SectionCard>}

    {section==='priority' && <SectionCard title="प्राथमिकता डैशबोर्ड (Priority Dashboard)" sub="सबसे अधिक gap वाले मुद्दे पहले दिखाए जाते हैं"><div className="space-y-2">{schemeGaps.slice(0,5).map(item=><div key={item.key} className="flex items-center justify-between border-b last:border-0 py-2 text-xs"><span className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-600"/>{item.label}</span><PriorityBadge priority={item.priority}/></div>)}</div></SectionCard>}

    {section==='exports' && <SectionCard title="रिपोर्ट निर्यात (Export Reports)" sub="प्रशासनिक उपयोग के लिए CSV reports"><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><ReportButton title="ग्राम रिपोर्ट (Village Report)" onClick={onExportVillages}/><ReportButton title="परिवार रिपोर्ट (Household Report)" onClick={onExportHouseholds}/><ReportButton title="योजना अंतराल रिपोर्ट (Scheme Gap Report)" onClick={onExportGaps}/></div></SectionCard>}
  </div>;
};

const ReportButton:React.FC<{title:string;onClick:()=>void}>=({title,onClick})=><button onClick={onClick} className="text-left border rounded-lg p-3 hover:bg-slate-50 cursor-pointer"><div className="flex items-center gap-2"><FileBarChart2 className="w-4 h-4"/><span className="text-[11px] font-bold">{title}</span></div><span className="inline-flex items-center text-[10px] font-semibold mt-2 text-blue-700"><Download className="w-3 h-3 mr-1"/>CSV</span></button>;
