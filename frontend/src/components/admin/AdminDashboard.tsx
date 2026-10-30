import {
  Component,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";

import {
  BarChart3,
  FileText,
  LogOut,
  TableProperties,
  House,
  MapPinned,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

import { AdminSurveyWorkspace } from "./AdminSurveyWorkspace";

import HouseholdSurveyAnalysis from "./HouseholdSurveyAnalysis";

import { StatisticalAnalysisPage } from "./StatisticalAnalysisPage";

import VillageSurveyAnalysis from "./VillageSurveyAnalysis";

import {
  liveAdminReportService,
  type AdminReportService,
} from "../../services/adminReportService";

type DashboardPage =
  | "analytics"
  | "statistical-analysis"
  | "reports"
  | "survey-analysis";

type SurveyType = "household" | "village";

/** Dashboard page में render error आने पर recovery UI दिखाता है। */
class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "JanSetu Admin dashboard rendering failed",
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-1 text-rose-600"
              size={24}
              aria-hidden="true"
            />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                यह पेज अभी खुल नहीं पाया
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                पेज में unexpected error आया है। दोबारा कोशिश करें।
                समस्या बनी रहे तो browser console और backend logs देखें।
              </p>

              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                <RotateCcw size={16} aria-hidden="true" />
                फिर कोशिश करें
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
export function AdminDashboard({
  adminId,
  onLogout,
  service = liveAdminReportService,
}: {
  adminId: string;
  onLogout: () => void;
  service?: AdminReportService;
}) {
  const [page, setPage] = useState<DashboardPage>("survey-analysis");
  const [surveyType, setSurveyType] = useState<SurveyType | null>(null);

  const tabs: {
    id: DashboardPage;
    label: string;
    Icon: typeof BarChart3;
  }[] = [
    {
      id: "survey-analysis",
      label: "Survey Analysis",
      Icon: House,
    },
    {
      id: "analytics",
      label: "Analytics",
      Icon: BarChart3,
    },
    {
      id: "statistical-analysis",
      label: "Statistical Analysis",
      Icon: TableProperties,
    },
    {
      id: "reports",
      label: "Reports",
      Icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-hindi pb-12">
      <header className="sticky top-0 z-20 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <div className="mr-auto flex min-w-0 flex-1 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              DMFT
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-slate-900">
                JanSetu Admin
              </h1>

              <p
                className="truncate text-xs text-slate-500"
                title={adminId}
              >
                ID: {adminId}
              </p>
            </div>
          </div>

          <nav
            aria-label="Admin sections"
            className="order-3 flex w-full flex-wrap gap-2 sm:order-none sm:w-auto"
          >
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={page === id ? "page" : undefined}
                onClick={() => {
                  setPage(id);

                  if (id !== "survey-analysis") {
                    setSurveyType(null);
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  page === id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <LogOut size={14} aria-hidden="true" />
            Log Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <DashboardErrorBoundary
          key={
            page === "survey-analysis"
              ? `survey-analysis-${surveyType ?? "choose"}`
              : page
          }
        >
          {page === "statistical-analysis" ? (
            <StatisticalAnalysisPage />
          ) : page === "survey-analysis" ? (
            <section
              aria-labelledby="survey-analysis-title"
              className="space-y-5"
            >
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setPage("analytics");
                    setSurveyType(null);
                  }}
                  className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-indigo-700"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  वापस Analytics पर जाएँ
                </button>

                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  ADMIN WORKSPACE
                </p>

                <h2
                  id="survey-analysis-title"
                  className="mt-1 text-3xl font-bold tracking-tight text-slate-900"
                >
                  Survey Analysis
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  विश्लेषण शुरू करने के लिए सर्वे का प्रकार चुनें।
                </p>
              </div>

              {surveyType === "household" ? (
                <HouseholdSurveyAnalysis onBack={() => setSurveyType(null)} />
              ) : surveyType === "village" ? (
                <section className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSurveyType(null)}
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    सर्वे प्रकार चुनें
                  </button>

                  <VillageSurveyAnalysis />
                </section>
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setSurveyType("household")}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                        <House size={24} aria-hidden="true" />
                      </span>

                      <span className="block text-lg font-bold text-slate-900">
                        परिवार सर्वे विश्लेषण
                      </span>

                      <span className="mt-1 block text-sm text-slate-500">
                        Household Survey Analysis
                      </span>

                      <span className="mt-3 block text-sm text-slate-600">
                        परिवारों से संबंधित सवालों के आधार पर
                        सुविधा-विहीन परिवारों का विश्लेषण।
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSurveyType("village")}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                      <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <MapPinned size={24} aria-hidden="true" />
                      </span>

                      <span className="block text-lg font-bold text-slate-900">
                        ग्राम सर्वे विश्लेषण
                      </span>

                      <span className="mt-1 block text-sm text-slate-500">
                        Village Survey Analysis
                      </span>

                      <span className="mt-3 block text-sm text-slate-600">
                        ग्राम की सुविधाओं, सेवाओं और विकास संबंधी
                        सवालों का विश्लेषण।
                      </span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    अगर सर्वे डेटा लोड नहीं होता है, तो browser
                    console और backend logs में error details जाँचें।
                  </p>
                </>
              )}
            </section>
          ) : (
            <AdminSurveyWorkspace
              key={page}
              mode={page}
              service={service}
            />
          )}
        </DashboardErrorBoundary>
      </main>
    </div>
  );
}