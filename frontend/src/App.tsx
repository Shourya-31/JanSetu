import React, { useState } from 'react';
import { LoginPage } from './components/surveyor/LoginPage';
import { SurveyorDashboard } from './components/surveyor/SurveyorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import type { UserRole } from './types/auth';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    id: string;
  } | null>(null);

  const handleLogin = (role: UserRole, id: string) => {
    setCurrentUser({ role, id });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 1. Agar login nahi hai toh Login Page dikhega
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  // 2. Surveyor Flow (Village Profile -> Red/Green Household Grid -> Household Survey Form)
  if (currentUser.role === 'surveyor') {
    return <SurveyorDashboard surveyorId={currentUser.id} onLogout={handleLogout} />;
  }

  // 3. Admin / Block Auditor Flow
  if (currentUser.role === 'admin') {
    return <AdminDashboard adminId={currentUser.id} onLogout={handleLogout} />;
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