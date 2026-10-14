import { afterEach, describe, expect, it, vi } from 'vitest';
import { restoreAuthSession } from './authApi';

const authMocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  getAuthSession: vi.fn(),
  setAuthSession: vi.fn()
}));

vi.mock('./apiClient', () => authMocks);

afterEach(() => {
  vi.clearAllMocks();
});

describe('restoreAuthSession', () => {
  it('does not call the protected endpoint when no session is stored', async () => {
    authMocks.getAuthSession.mockReturnValue(null);

    await expect(restoreAuthSession()).resolves.toBeNull();
    expect(authMocks.apiRequest).not.toHaveBeenCalled();
  });

  it('checks a stored session once and refreshes its user details', async () => {
    const session = {
      token: 'header.payload.signature',
      surveyMode: 'household' as const,
      user: { id: 'user-id', userCode: 'user-code', role: 'surveyor' as const, fullName: 'Surveyor' }
    };
    authMocks.getAuthSession.mockReturnValue(session);
    authMocks.apiRequest.mockResolvedValue({
      user: { ...session.user, fullName: 'Updated Surveyor' }
    });

    await expect(restoreAuthSession()).resolves.toEqual({
      token: session.token,
      surveyMode: 'household',
      user: { ...session.user, fullName: 'Updated Surveyor' }
    });

    expect(authMocks.apiRequest).toHaveBeenCalledOnce();
    expect(authMocks.apiRequest).toHaveBeenCalledWith('/api/auth/me');
    expect(authMocks.setAuthSession).toHaveBeenCalledOnce();
  });
});
