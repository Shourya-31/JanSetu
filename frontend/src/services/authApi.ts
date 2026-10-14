import { apiRequest, getAuthSession, type AppRole, type AuthSession, setAuthSession } from './apiClient';

export async function login(role: AppRole, identifier: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<{ success: boolean; token: string; user: AuthSession['user'] }>('/api/auth/login', {
    method: 'POST',
    body: { role, identifier, password }
  });

  const session: AuthSession = {
    token: response.token,
    user: response.user
  };
  
  return session;
}

export async function restoreAuthSession(): Promise<AuthSession | null> {
  const existingSession = getAuthSession();
  if (!existingSession) return null;

  const response = await apiRequest<{ success: boolean; user: AuthSession['user'] }>('/api/auth/me');
  const session: AuthSession = {
    token: existingSession.token,
    surveyMode: existingSession.surveyMode,
    user: response.user
  };
  setAuthSession(session);
  return session;
}

export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}
