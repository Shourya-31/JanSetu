import React, { useState } from "react";
import {
  MapPinned,
  Users,
  BarChart3,
  ArrowRight,
  Lock,
  Loader2,
} from "lucide-react";
import { ApiError } from "../../services/apiClient";

export type SurveyMode = "village" | "household";

interface LoginPageProps {
  onProfileSelect: (mode: SurveyMode, identifier: string, password: string) => Promise<void>;
  onAdminLogin: (
    role: "admin",
    identifier: string,
    password: string
  ) => Promise<void>;
}

type ActiveTab = "village" | "household" | "admin";

function loginErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : fallback;
  if (error.code === "AUTHENTICATION_ERROR") return "आईडी या पासवर्ड गलत है।";
  if (error.requestId) return `${error.message} (Request ID: ${error.requestId})`;
  return error.message || fallback;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onProfileSelect,
  onAdminLogin,
}) => {
  // Mobile tab switcher (desktop shows all 3)
  const [activeTab, setActiveTab] = useState<ActiveTab>("village");

  // ---------- Village section ----------
  const [vlgId, setVlgId] = useState("");
  const [vlgPass, setVlgPass] = useState("");
  const [vlgLoading, setVlgLoading] = useState(false);
  const [vlgError, setVlgError] = useState("");

  // ---------- Household section ----------
  const [hhdId, setHhdId] = useState("");
  const [hhdPass, setHhdPass] = useState("");
  const [hhdLoading, setHhdLoading] = useState(false);
  const [hhdError, setHhdError] = useState("");

  // ---------- Admin section ----------
  const [admId, setAdmId] = useState("");
  const [admPass, setAdmPass] = useState("");
  const [admLoading, setAdmLoading] = useState(false);
  const [admError, setAdmError] = useState("");

  /* ---------------- Village submit ---------------- */
  
  const handleVillageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vlgId.trim() || !vlgPass) {
      setVlgError("ग्राम सर्वेक्षक आईडी और पासवर्ड दोनों दर्ज करें।");
      return;
    }
    setVlgError("");
    setVlgLoading(true);
    try {
      await onProfileSelect("village", vlgId.trim(), vlgPass);
    } catch (error) {
      setVlgError(loginErrorMessage(error, "लॉगिन असफल हुआ।"));
    } finally {
      setVlgLoading(false);
    }
  };


  /* ---------------- Household submit ---------------- */
  
  const handleHouseholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hhdId.trim() || !hhdPass) {
      setHhdError("परिवार सर्वेक्षक आईडी और पासवर्ड दोनों दर्ज करें।");
      return;
    }
    setHhdError("");
    setHhdLoading(true);
    try {
      await onProfileSelect("household", hhdId.trim(), hhdPass);
    } catch (error) {
      setHhdError(loginErrorMessage(error, "लॉगिन असफल हुआ।"));
    } finally {
      setHhdLoading(false);
    }
  };


  /* ---------------- Admin submit ---------------- */
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admId.trim() || !admPass) {
      setAdmError("प्रशासनिक आईडी और पासवर्ड दोनों दर्ज करें।");
      return;
    }
    setAdmError("");
    setAdmLoading(true);
    try {
      await onAdminLogin("admin", admId.trim(), admPass);
    } catch (error) {
      setAdmError(loginErrorMessage(error, "लॉगिन असफल हुआ। कृपया पुनः प्रयास करें।"));
    } finally {
      setAdmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-xs sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-md flex items-center justify-center font-bold text-lg">
              भा
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                ग्रामीण विकासदृष्टि
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                जिला खनिज संस्थान न्यास (DMFT) • ग्रामीण विकास प्रणाली
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hidden sm:inline-block">
            आधिकारिक उपयोग हेतु
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative flex-1 w-full overflow-hidden">

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/village.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 px-4 py-8 w-full">

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              पोर्टल में प्रवेश करें
            </h2>
            <p className="text-sm text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mt-2">
              कृपया अपने कार्य के अनुसार विकल्प चुनें
            </p>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex sm:hidden p-1 bg-slate-200 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("village")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "village"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600"
                }`}
            >
              1. ग्राम सर्वे
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("household")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "household"
                ? "bg-white text-blue-800 shadow-xs"
                : "text-slate-600"
                }`}
            >
              2. परिवार सर्वे
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "admin"
                ? "bg-white text-amber-900 shadow-xs"
                : "text-slate-600"
                }`}
            >
              3. एडमिन
            </button>
          </div>

          {/* 3 Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ================= 1. VILLAGE ================= */}
            <div
              className={`border-2 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${activeTab === "village"
                ? "border-emerald-600 ring-2 ring-emerald-100"
                : "border-slate-200 hover:border-emerald-400"
                } ${activeTab !== "village" ? "hidden sm:flex" : "flex"}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <MapPinned className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    सेक्शन 1 • ग्राम प्रोफ़ाइल
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                  ग्राम सर्वे (Village Survey)
                </h3>

                <p className="text-xs text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mt-1 leading-relaxed">
                  ग्राम का संपूर्ण सर्वेक्षण एवं ग्राम संबंधी जानकारी दर्ज करें।
                </p>

                <form
                  onSubmit={handleVillageSubmit}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mb-1">
                      ग्राम सर्वेक्षक आईडी / कोड
                    </label>
                    <input
                      type="text"
                      value={vlgId}
                      onChange={(e) => setVlgId(e.target.value)}
                      placeholder="उदा. surveyor"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mb-1">
                      सुरक्षा पिन / पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={vlgPass}
                        onChange={(e) => setVlgPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {vlgError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {vlgError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={vlgLoading}
                    className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
                  >
                    {vlgLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <>
                        <span>ग्राम सर्वे में प्रवेश करें</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                <span>गाँव अवसंरचना व सुविधा स्थिति</span>
                <span className="font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">11 बिंदु फॉर्म</span>
              </div>
            </div>

            {/* ================= 2. HOUSEHOLD ================= */}
            <div
              className={`border-2 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${activeTab === "household"
                ? "border-blue-600 ring-2 ring-blue-100"
                : "border-slate-200 hover:border-blue-400"
                } ${activeTab !== "household" ? "hidden sm:flex" : "flex"}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    सेक्शन 2 • परिवार जनगणना
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                  परिवार सर्वे (Household Survey)
                </h3>

                <p className="text-xs text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mt-1 leading-relaxed">
                  ग्राम के परिवारों की संख्या एवं प्रत्येक परिवार का सर्वेक्षण करें।
                </p>

                <form
                  onSubmit={handleHouseholdSubmit}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mb-1">
                      परिवार सर्वेक्षक आईडी / कोड
                    </label>
                    <input
                      type="text"
                      value={hhdId}
                      onChange={(e) => setHhdId(e.target.value)}
                      placeholder="उदा. surveyor"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mb-1">
                      सुरक्षा पिन / पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={hhdPass}
                        onChange={(e) => setHhdPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {hhdError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {hhdError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={hhdLoading}
                    className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
                  >
                    {hhdLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <>
                        <span>परिवार सर्वे में प्रवेश करें</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                <span>परिवारवार लाल/हरा ग्रिड</span>
                <span className="font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">19 योजना ट्रैकर</span>
              </div>
            </div>

            {/* ================= 3. ADMIN ================= */}
            <div
              className={`border-2 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all ${activeTab === "admin"
                ? "border-amber-600 ring-2 ring-amber-100"
                : "border-slate-200 hover:border-amber-400"
                } ${activeTab !== "admin" ? "hidden sm:flex" : "flex"}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    सेक्शन 3 • DMFT ऑडिट
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                  प्रशासन (Admin)
                </h3>

                <p className="text-xs text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mt-1 leading-relaxed">
                  प्रशासनिक डैशबोर्ड एवं सर्वेक्षण की निगरानी के लिए प्रवेश करें।
                </p>

                <form
                  onSubmit={handleAdminSubmit}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mb-1">
                      प्रशासनिक आईडी
                    </label>
                    <input
                      type="text"
                      value={admId}
                      onChange={(e) => setAdmId(e.target.value)}
                      placeholder="उदा. admin"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] mb-1">
                      पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={admPass}
                        onChange={(e) => setAdmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {admError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      {admError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={admLoading}
                    className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-xs transition-colors"
                  >
                    {admLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <>
                        <span>प्रशासनिक पोर्टल में प्रवेश करें</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                <span>सत्यापन, सुधार टिकट व ऑडिट</span>
                <span className="font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">जिला रिपोर्टिंग</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-black [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] border-t bg-white">
        राष्ट्रीय सूचना विज्ञान केंद्र (NIC) प्रारूप अनुसार विकसित • जिला खनिज संस्थान न्यास (DMFT)
      </footer>
    </div>
  );
};

export default LoginPage;