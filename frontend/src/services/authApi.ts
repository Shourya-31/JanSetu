import type { AppRole, AuthSession } from './apiClient';

export async function login(role: AppRole, identifier: string, password: string): Promise<AuthSession> {
  // Completely disconnected from backend - Mocking all logins
  return {
    token: `mock-${role}-token`,
    user: {
      id: `${role}-mock-123`,
      userCode: identifier || `${role}01`,
      fullName: `${role === 'admin' ? 'Admin' : 'Surveyor'} Test User`,
      role: role
    }
  };
}
