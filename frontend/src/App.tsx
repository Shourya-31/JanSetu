import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import type { UserRole } from './types/auth';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    id: string;
    isNew?: boolean;
  } | null>(null);

  const handleLogin = (role: UserRole, id: string, isNewRegistration?: boolean) => {
    setCurrentUser({ role, id, isNew: isNewRegistration });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-hindi">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded">
            {currentUser.isNew ? 'नया पंजीकरण प्रक्रिया' : 'सफलतापूर्वक लॉग इन'}
          </span>
          <h2 className="text-xl font-bold mt-2 text-slate-800">
            {currentUser.role === 'villager' && 'परिवार सर्वेक्षण प्रपत्र (Household Registration)'}
            {currentUser.role === 'surveyor' && 'ग्राम प्रोफ़ाइल (Village Profile)'}
            {currentUser.role === 'admin' && 'व्यवस्थापक डैशबोर्ड (Admin Dashboard)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1">उपयोगकर्ता पहचान: {currentUser.id}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm rounded font-medium cursor-pointer"
        >
          लॉग आउट
        </button>
      </div>
    </div>
  );
};

export default App;