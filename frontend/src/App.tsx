import React, { useEffect, useState } from 'react';
import { LoginPage } from './components/surveyor/LoginPage';
import { SurveyorDashboard } from './components/surveyor/SurveyorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { login } from './services/authApi';
import { clearAuthSession, getAuthSession, onUnauthorized, setAuthSession, type AuthSession } from './services/apiClient';

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  useEffect(() => onUnauthorized(() => setSession(null)), []);

  const handleLogin = async (role: 'admin' | 'surveyor', identifier: string, password: string) => {
    const nextSession = await login(role, identifier, password);
    setAuthSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  if (session.user.role === 'surveyor') {
    return <SurveyorDashboard surveyorId={session.user.userCode} onLogout={handleLogout} />;
  }

  if (session.user.role === 'admin') {
    return <AdminDashboard adminId={session.user.userCode} onLogout={handleLogout} />;
  }

  // Baaki roles ke liye simple placeholder (jab tak unka number nahi aata)
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-hindi flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg border shadow-xs text-center space-y-4 max-w-md">
        <h2 className="text-lg font-bold text-slate-800">ग्रामीण पोर्टल</h2>
        <p className="text-xs text-slate-500">
          (यह मॉड्यूल सर्वेक्षक कार्य पूर्ण होने के बाद सक्रिय किया जाएगा)
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs rounded font-medium cursor-pointer"
        >
          लॉग आउट
        </button>
      </div>
    </div>
  );
};

export default App;