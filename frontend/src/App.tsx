import React, { useEffect, useState } from "react";
import {
  LoginPage,
  type SurveyMode,
} from "./components/surveyor/LoginPage";
import { SurveyorDashboard } from "./components/surveyor/SurveyorDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { login, logout, restoreAuthSession } from "./services/authApi";
import {
  clearAuthSession,
  getAuthSession,
  onUnauthorized,
  setAuthSession,
  type AuthSession,
} from "./services/apiClient";

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const [surveyMode, setSurveyMode] = useState<SurveyMode | null>(() => {
    const existingSession = getAuthSession();
    return existingSession?.user.role === "surveyor" ? existingSession.surveyMode ?? null : null;
  });

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setSession(null);
      setSurveyMode(null);
    });
    void restoreAuthSession()
      .then((restoredSession) => {
        setSession(restoredSession);
        setSurveyMode(restoredSession?.surveyMode ?? null);
      })
      .catch(() => setSession(null))
      .finally(() => setIsRestoringSession(false));
    return unsubscribe;
  }, []);

  // Only Admin login is handled here
  
  const handleSurveyorLogin = async (
    mode: SurveyMode,
    identifier: string,
    password: string
  ) => {
    const nextSession = await login('surveyor', identifier, password);
    const surveyorSession = { ...nextSession, surveyMode: mode };
    setAuthSession(surveyorSession);
    setSession(surveyorSession);
    setSurveyMode(mode);
  };

  const handleAdminLogin = async (
    role: "admin",
    identifier: string,
    password: string
  ) => {
    const nextSession = await login(role, identifier, password);
    setAuthSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    void logout().catch(() => undefined);
    clearAuthSession();
    setSession(null);
    setSurveyMode(null);
  };

  /*
   * Admin logged in
   */
  if (isRestoringSession) return null;

  if (session?.user.role === "admin") {
    return (
      <AdminDashboard
        adminId={session.user.userCode}
        onLogout={handleLogout}
      />
    );
  }

  /*
   * Village / Household Profile selected
   */
  if (surveyMode) {
    return (
      <SurveyorDashboard
        surveyorId="surveyor"
        surveyMode={surveyMode}
        onLogout={handleLogout}
      />
    );
  }

  /*
   * Home Page
   */
  return (
    <LoginPage
      onProfileSelect={handleSurveyorLogin}
      onAdminLogin={handleAdminLogin}
    />
  );
};

export default App;