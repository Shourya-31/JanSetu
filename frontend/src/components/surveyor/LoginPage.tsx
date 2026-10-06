import React, { useState } from "react";
import {
  MapPinned,
  Users,
  BarChart3,
  ArrowRight,
  Lock,
} from "lucide-react";

export type SurveyMode = "village" | "household";

interface LoginPageProps {
  onProfileSelect: (mode: SurveyMode) => void;

  onAdminLogin: (
    role: "admin",
    identifier: string,
    password: string
  ) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onProfileSelect,
  onAdminLogin,
}) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      setErrorMessage("प्रशासनिक आईडी और पासवर्ड दोनों दर्ज करें।");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onAdminLogin(
        "admin",
        identifier.trim(),
        password
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "लॉगिन असफल हुआ। कृपया पुनः प्रयास करें।"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    setShowAdminLogin(false);
    setIdentifier("");
    setPassword("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-md flex items-center justify-center font-bold text-lg">
              भा
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                सामाजिक-आर्थिक सर्वेक्षण एवं जनगणना पोर्टल
              </h1>

              <p className="text-xs text-slate-500 font-medium">
                जिला खनिज संस्थान न्यास (DMFT) • ग्रामीण विकास प्रणाली
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            आधिकारिक उपयोग हेतु
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {!showAdminLogin ? (
          <>
            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                पोर्टल में प्रवेश करें
              </h2>

              <p className="text-sm text-slate-600 mt-2">
                कृपया अपने कार्य के अनुसार विकल्प चुनें
              </p>
            </div>

            {/* Three Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* ================= ग्राम प्रोफाइल ================= */}
              <button
                type="button"
                onClick={() => onProfileSelect("village")}
                className="group text-left bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <MapPinned className="w-6 h-6 text-emerald-600" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  ग्राम प्रोफाइल
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  ग्राम का संपूर्ण सर्वेक्षण एवं ग्राम संबंधी जानकारी दर्ज करें।
                </p>

                <div className="mt-5 text-xs font-semibold text-emerald-700">
                  ग्राम सर्वेक्षण शुरू करें →
                </div>
              </button>

              {/* ================= परिवार प्रोफाइल ================= */}
              <button
                type="button"
                onClick={() => onProfileSelect("household")}
                className="group text-left bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  परिवार प्रोफाइल
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  ग्राम के परिवारों की संख्या एवं प्रत्येक परिवार का सर्वेक्षण
                  करें।
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-700">
                  परिवार सर्वेक्षण शुरू करें →
                </div>
              </button>

              {/* ================= प्रशासन ================= */}
              <button
                type="button"
                onClick={() => setShowAdminLogin(true)}
                className="group text-left bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  प्रशासन
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  प्रशासनिक डैशबोर्ड एवं सर्वेक्षण की निगरानी के लिए प्रवेश करें।
                </p>

                <div className="mt-5 text-xs font-semibold text-amber-700">
                  प्रशासनिक लॉगिन →
                </div>
              </button>
            </div>
          </>
        ) : (
          /* ================= ADMIN LOGIN ================= */
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">

              {/* Back */}
              <button
                type="button"
                onClick={handleBackToHome}
                className="text-sm text-slate-500 hover:text-slate-800 mb-6"
              >
                ← वापस जाएँ
              </button>

              {/* Login Heading */}
              <div className="text-center mb-7">
                <div className="w-14 h-14 mx-auto rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-amber-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  प्रशासनिक लॉगिन
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  प्रशासनिक खाते से प्रवेश करें
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleAdminLogin}
                className="space-y-5"
              >
                {/* ID */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    प्रशासनिक आईडी
                  </label>

                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(e.target.value)
                    }
                    placeholder="प्रशासनिक आईडी दर्ज करें"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    पासवर्ड
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="पासवर्ड दर्ज करें"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting
                    ? "लॉगिन हो रहा है..."
                    : "प्रवेश करें"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LoginPage;