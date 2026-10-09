import { apiRequest } from './apiClient';
import type { AppRole, AuthSession } from './apiClient';

export async function login(role: AppRole, identifier: string, password: string): Promise<AuthSession> {
  // Bypassed login for Admin testing as per user request
  if (role === 'admin') {
    return {
      token: 'mock-admin-token',
      user: {
        id: 'admin-mock-123',
        userCode: identifier || 'admin01',
        fullName: 'Admin Test User',
        role: 'admin'
      }
    };
  }

  const response = await apiRequest<{ success: boolean; token: string; user: AuthSession['user'] }>(
    '/api/auth/login',
    { method: 'POST', body: { role, identifier, password } }
  );
  return { token: response.token, user: response.user };
}
