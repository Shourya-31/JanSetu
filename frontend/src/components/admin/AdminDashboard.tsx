import { useState } from "react";
import { BarChart3, FileText, LogOut } from "lucide-react";
import { AdminSurveyWorkspace } from "./AdminSurveyWorkspace";
import {
  offlineAdminReportService, liveAdminReportService,
  type AdminReportService,
} from "../../services/adminReportService";
export function AdminDashboard({
  adminId,
  onLogout,
  service = liveAdminReportService,
}: {
  adminId: string;
  onLogout: () => void;
  service?: AdminReportService;
}) {
  const [page, setPage] = useState<"analytics" | "reports">("analytics");
  return (
    <div className="min-h-screen bg-slate-50 font-hindi pb-12">
      <header className="sticky top-0 z-20 border-b bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 mr-auto">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-900 text-white grid place-items-center text-xs font-bold">
              DMFT
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900">JanSetu Admin</h1>
              <p className="truncate text-xs text-slate-500" title={adminId}>
                ID: {adminId}
              </p>
            </div>
          </div>
          <nav
            aria-label="Admin sections"
            className="flex gap-2 order-3 w-full sm:order-none sm:w-auto"
          >
            {(["analytics", "reports"] as const).map((tab) => {
              const Icon = tab === "analytics" ? BarChart3 : FileText;
              return (
                <button
                  key={tab}
                  aria-current={page === tab ? "page" : undefined}
                  onClick={() => setPage(tab)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer ${page === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Icon size={16} />
                  {tab === "analytics" ? "Analytics" : "Reports"}
                </button>
              );
            })}
          </nav>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <AdminSurveyWorkspace key={page} mode={page} service={service} />
      </main>
    </div>
  );
}
