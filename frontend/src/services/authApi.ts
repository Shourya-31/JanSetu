import { apiRequest, type AppRole, type AuthSession } from './apiClient';

export async function login(role: AppRole, identifier: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<{ success: boolean; token: string; user: AuthSession['user'] }>(
    '/api/auth/login',
    { method: 'POST', body: { role, identifier, password } }
  );
  return { token: response.token, user: response.user };
}
