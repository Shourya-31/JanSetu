import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Home,
  Users,
} from "lucide-react";

interface VillageReportDashboardProps {
  villageName: string;
  blockName: string;
  panchayatName: string;
  onBack: () => void;
  onVillageOverview: () => void;
  onHouseholdOverview: () => void;
}

export default function VillageReportDashboard({
  villageName,
  blockName,
  panchayatName,
  onBack,
  onVillageOverview,
  onHouseholdOverview,
}: VillageReportDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            वापस जाएँ
          </button>

          <div>
            <p className="text-xs font-bold text-blue-600">
              ग्राम रिपोर्ट
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {villageName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ग्राम पंचायत: {panchayatName} · ब्लॉक: {blockName}
            </p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            रिपोर्ट का अवलोकन
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            जिस जानकारी को देखना चाहते हैं, उसे चुनें।
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Village Overview */}
          <button
            type="button"
            onClick={onVillageOverview}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Home size={25} />
              </div>

              <ChevronRight
                size={20}
                className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              ग्राम अवलोकन
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              ग्राम की समग्र स्थिति, मूलभूत सुविधाएँ,
              विकास आवश्यकताएँ एवं प्रमुख कमियों की जानकारी देखें।
            </p>

            <div className="mt-5 text-sm font-bold text-blue-600">
              ग्राम की जानकारी देखें →
            </div>
          </button>

          {/* Household Overview */}
          <button
            type="button"
            onClick={onHouseholdOverview}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users size={25} />
              </div>

              <ChevronRight
                size={20}
                className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              परिवार अवलोकन
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              कुल परिवार, सर्वे की प्रगति, पूर्ण एवं अपूर्ण
              परिवारों तथा परिवार-वार जानकारी देखें।
            </p>

            <div className="mt-5 text-sm font-bold text-emerald-600">
              परिवारों की जानकारी देखें →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}