import React, { useState } from 'react';
import { ROLES } from '../types/auth';
import type { UserRole } from '../types/auth';
import { User, ClipboardList, BarChart3, ArrowRight, Lock, Phone, UserPlus, Info } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, identifier: string, isNewRegistration?: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('villager');
  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setIsNewRegistration(false);
    setIdentifier('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      alert('कृपया आवश्यक विवरण दर्ज करें');
      return;
    }
    onLoginSuccess(selectedRole, identifier, isNewRegistration);
  };

  const getRoleIcon = (roleId: UserRole) => {
    switch (roleId) {
      case 'villager':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'surveyor':
        return <ClipboardList className="w-5 h-5 text-emerald-600" />;
      case 'admin':
        return <BarChart3 className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
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

      {/* Main Login / Registration Form */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
          <div className="text-center max-w-md mx-auto mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedRole === 'villager' && isNewRegistration
                ? 'नया परिवार सर्वेक्षण पंजीकरण'
                : 'पोर्टल में प्रवेश करें'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {selectedRole === 'villager' && isNewRegistration
                ? 'अपना मोबाइल नंबर दर्ज कर परिवार का नया विवरण जोड़ें'
                : 'अपनी निर्धारित भूमिका चुनें और संबंधित विवरण दर्ज करें'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Role Selection Grid */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                भूमिका का चयन करें (Select Role)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`text-left p-4 rounded-lg border-2 transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white rounded border border-slate-200 shadow-2xs">
                            {getRoleIcon(role.id)}
                          </div>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {role.badge}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-slate-900">{role.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                      <div className="mt-4 text-xs font-medium text-blue-700">
                        {isSelected ? '✓ चयनित' : 'चुनने के लिए क्लिक करें'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Villager Toggle (Login vs New Registration) */}
            {selectedRole === 'villager' && (
              <div className="flex items-center justify-center space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setIsNewRegistration(false)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    !isNewRegistration
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  लॉग इन (पंजीकृत परिवार)
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewRegistration(true)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    isNewRegistration
                      ? 'bg-blue-700 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  नया परिवार पंजीकरण
                </button>
              </div>
            )}

            {/* 3. Role-specific Inputs */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
              {selectedRole === 'villager' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {isNewRegistration
                      ? 'मुखिया का मोबाइल नंबर (पंजीकरण हेतु)'
                      : 'पंजीकृत मोबाइल नंबर'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="10 अंकों का मोबाइल नंबर दर्ज करें"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    * OTP सत्यापन के बाद सीधे परिवार सर्वेक्षण प्रपत्र खुलेगा
                  </p>
                </div>
              )}

              {selectedRole === 'surveyor' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      सर्वेक्षक आईडी ब्लॉक कार्यालय अथवा जनपद पंचायत द्वारा जारी की जाती है।
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      सर्वेक्षक आईडी / कर्मचारी कोड
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="उदा. SUR-NYR-2026"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      सुरक्षा पिन / पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      यह खाता केवल अधिकृत जिला/ब्लॉक स्तर के अधिकारियों के लिए सुरक्षित है।
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      अधिकारी ईमेल / यूजर आईडी
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="उदा. auditor.narayanpur@gov.in"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm rounded-md shadow-xs transition-colors cursor-pointer"
              >
                {selectedRole === 'villager' && isNewRegistration
                  ? 'पंजीकरण करें एवं प्रपत्र भरें'
                  : 'सत्यापित करें एवं आगे बढ़ें'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t bg-white">
        राष्ट्रीय सूचना विज्ञान केंद्र (NIC) प्रारूप अनुसार विकसित • समस्त अधिकार सुरक्षित
      </footer>
    </div>
  );
};