import React from 'react';
import type { HouseholdRecord, SchemeGapStat, VillageRecord } from '../../types/admin';
import { ProgressBar, SectionCard, StatCard, PriorityBadge, EmptyState } from './AdminUI';
import { AlertTriangle, Download, FileBarChart2 } from 'lucide-react';

type AnalyticsSection = 'home' | 'census' | 'infrastructure' | 'scheme' | 'priority' | 'exports' | 'gram-report';

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
    {id:'gram-report',label:'ग्राम वार रिपोर्ट (Gram-wise Report)'},
    {id:'census',label:'जनगणना व जनसांख्यिकी (Census)'},
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

    {section==='gram-report' && <GramReportSection villages={villages} />}
  </div>;
};

const ReportButton:React.FC<{title:string;onClick:()=>void}>=({title,onClick})=><button onClick={onClick} className="text-left border rounded-lg p-3 hover:bg-slate-50 cursor-pointer"><div className="flex items-center gap-2"><FileBarChart2 className="w-4 h-4"/><span className="text-[11px] font-bold">{title}</span></div><span className="inline-flex items-center text-[10px] font-semibold mt-2 text-blue-700"><Download className="w-3 h-3 mr-1"/>CSV</span></button>;

const GramReportSection: React.FC<{ villages: VillageRecord[] }> = ({ villages }) => {
  // Aggregate data by block -> panchayat
  const summary = villages.reduce((acc, v) => {
    if (!acc[v.block]) acc[v.block] = { totalVillages: 0, surveyedVillages: 0, households: 0, surveyedHouseholds: 0, directCount: 0, indirectCount: 0, panchayats: {} };
    const b = acc[v.block];
    if (!b.panchayats[v.panchayat]) b.panchayats[v.panchayat] = { totalVillages: 0, surveyedVillages: 0, directCount: 0, indirectCount: 0, villages: [] };
    const p = b.panchayats[v.panchayat];

    b.totalVillages++;
    p.totalVillages++;
    if (v.completionPercent > 0) { b.surveyedVillages++; p.surveyedVillages++; }
    
    b.households += v.totalHouseholds;
    b.surveyedHouseholds += v.surveyedHouseholds;

    // Direct / Indirect logic mock - customize based on actual DB flag
    // Assume a mock logic for now or add to schema
    const isDirect = Math.random() > 0.5; 
    if (isDirect) { b.directCount++; p.directCount++; } else { b.indirectCount++; p.indirectCount++; }

    p.villages.push({
      name: v.villageName,
      status: v.completionPercent >= 100 ? 'Completed' : (v.completionPercent > 0 ? 'In Progress' : 'Pending'),
      total: v.totalHouseholds,
      filled: v.surveyedHouseholds,
      type: isDirect ? 'Direct' : 'Indirect'
    });

    return acc;
  }, {} as Record<string, any>);

  return (
    <SectionCard title="ग्राम वार रिपोर्ट (Gram-wise Report)" sub="Block, Panchayat, and Village level survey status">
      <div className="space-y-6">
        {Object.entries(summary).map(([blockName, bData]: [string, any]) => (
          <div key={blockName} className="border p-4 rounded-lg bg-slate-50 shadow-sm">
            <h3 className="text-sm font-bold border-b pb-2 mb-3">ब्लॉक (Block): {blockName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
               <StatCard label="Total Villages" value={bData.totalVillages} />
               <StatCard label="Direct/Indirect" value={`${bData.directCount} / ${bData.indirectCount}`} />
               <StatCard label="Target Households" value={bData.households} />
               <StatCard label="Forms Filled" value={`${bData.surveyedHouseholds} (${bData.households ? Math.round(bData.surveyedHouseholds/bData.households*100) : 0}%)`} />
            </div>

            {Object.entries(bData.panchayats).map(([panchayatName, pData]: [string, any]) => (
              <div key={panchayatName} className="mt-4 border-l-2 border-blue-400 pl-3">
                <h4 className="text-[11px] font-bold text-slate-700">ग्राम पंचायत (Panchayat): {panchayatName}</h4>
                <p className="text-[10px] text-slate-500 mb-2">Villages: {pData.totalVillages} | Direct: {pData.directCount} | Indirect: {pData.indirectCount}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[10px] text-left border-collapse">
                    <thead className="bg-slate-200">
                      <tr>
                        <th className="p-1.5 border">Village Name</th>
                        <th className="p-1.5 border">Type</th>
                        <th className="p-1.5 border">Households (Filled / Total)</th>
                        <th className="p-1.5 border">Form Fill %</th>
                        <th className="p-1.5 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pData.villages.map((v: any) => (
                        <tr key={v.name} className="border-b bg-white">
                          <td className="p-1.5 font-semibold">{v.name}</td>
                          <td className="p-1.5">{v.type}</td>
                          <td className="p-1.5">{v.filled} / {v.total}</td>
                          <td className="p-1.5">{v.total ? Math.round((v.filled/v.total)*100) : 0}%</td>
                          <td className="p-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] ${v.status === 'Completed' ? 'bg-green-100 text-green-700' : v.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{v.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};
