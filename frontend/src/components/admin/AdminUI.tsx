import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'good' | 'bad' | 'warn';
}> = ({ label, value, sub, tone = 'default' }) => {
  const toneClass =
    tone === 'good' ? 'text-emerald-700' : tone === 'bad' ? 'text-rose-700' : tone === 'warn' ? 'text-amber-700' : 'text-slate-900';
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
      <span className="text-xs text-slate-500 block">{label}</span>
      <p className={`text-2xl font-bold mt-1 font-mono ${toneClass}`}>{value}</p>
      {sub && <span className="text-[11px] text-slate-400">{sub}</span>}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: 'सत्यापित' | 'लंबित' | 'फ्लैग' }> = ({ status }) => {
  const styles = {
    सत्यापित: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    लंबित: 'bg-amber-50 text-amber-700 border-amber-200',
    फ्लैग: 'bg-rose-50 text-rose-700 border-rose-200',
  } as const;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: 'उच्च' | 'मध्यम' | 'निम्न' }> = ({ priority }) => {
  const styles = {
    उच्च: 'bg-rose-50 text-rose-700 border-rose-200',
    मध्यम: 'bg-amber-50 text-amber-700 border-amber-200',
    निम्न: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  } as const;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const ProgressBar: React.FC<{ percent: number; label?: string; tone?: 'default' | 'bad' }> = ({
  percent,
  label,
  tone = 'default',
}) => (
  <div>
    {label && (
      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-mono font-semibold text-slate-700">{percent}%</span>
      </div>
    )}
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${tone === 'bad' ? 'bg-rose-500' : 'bg-blue-700'}`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  </div>
);

export const SectionCard: React.FC<{
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, sub, action, children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-2xs ${className}`}>
    <div className="flex items-start justify-between mb-3 gap-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
    <Inbox className="w-6 h-6 mb-2" />
    <p className="text-xs">{message}</p>
  </div>
);

export const LoadingBlock: React.FC<{ message?: string }> = ({ message = 'लोड हो रहा है…' }) => (
  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
    <Loader2 className="w-5 h-5 mb-2 animate-spin" />
    <p className="text-xs">{message}</p>
  </div>
);
