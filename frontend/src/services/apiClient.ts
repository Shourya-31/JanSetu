export type AppRole = 'admin' | 'surveyor';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    userCode: string;
    role: AppRole;
    fullName: string;
  };
}

const SESSION_KEY = 'jansetu.auth.session';
const UNAUTHORIZED_EVENT = 'jansetu:unauthorized';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAuthSession(): AuthSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) as AuthSession : null;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const session = getAuthSession();
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (response.status === 401 && session) {
      clearAuthSession();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(payload?.error || `Request failed (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function downloadApiFile(path: string, filename: string): Promise<void> {
  const headers = new Headers();
  const session = getAuthSession();
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new ApiError(payload?.error || `Request failed (${response.status})`, response.status);
  }

  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function onUnauthorized(handler: () => void): () => void {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}
