import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  apiRequest,
  clearAuthSession,
  getAuthSession,
  SESSION_KEY,
  setAuthSession,
  type AuthSession
} from './apiClient';

const session: AuthSession = {
  token: 'header.payload.signature',
  user: { id: 'user-id', userCode: 'user-code', role: 'admin', fullName: 'Test User' }
};

function installStorage(): void {
  const values = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key)
  });
  vi.stubGlobal('window', new EventTarget());
}

afterEach(() => {
  clearAuthSession();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('auth session persistence', () => {
  it('persists and restores the complete session after memory is cleared', () => {
    installStorage();
    setAuthSession(session);
    clearAuthSession();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    expect(getAuthSession()).toEqual(session);
  });

  it('clears corrupted and expired stored sessions', () => {
    installStorage();
    sessionStorage.setItem(SESSION_KEY, '{not-json');
    expect(getAuthSession()).toBeNull();

    const expiredToken = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 1 }))}.signature`;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, token: expiredToken }));
    expect(getAuthSession()).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('sends the restored token as a bearer authorization header', async () => {
    installStorage();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/api/protected');

    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe(`Bearer ${session.token}`);
  });

  it('clears storage and notifies listeners for a server 401', async () => {
    installStorage();
    setAuthSession(session);
    const unauthorized = vi.fn();
    window.addEventListener('jansetu:unauthorized', unauthorized);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: {} }), { status: 401 })));

    await expect(apiRequest('/api/protected')).rejects.toMatchObject({ status: 401 });

    expect(getAuthSession()).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    expect(unauthorized).toHaveBeenCalledOnce();
  });
});
