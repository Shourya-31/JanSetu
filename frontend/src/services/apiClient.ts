export type AppRole = 'admin' | 'surveyor';

export interface AuthSession {
  token: string;
  surveyMode?: 'village' | 'household';
  user: {
    id: string;
    userCode: string;
    role: AppRole;
    fullName: string;
  };
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'REQUEST_TIMEOUT'
  | 'DATABASE_UNAVAILABLE'
  | 'DATABASE_SCHEMA_ERROR'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'MALFORMED_RESPONSE';
export type ApiFailureType = 'http' | 'network' | 'timeout' | 'cancelled' | 'malformed';

const UNAUTHORIZED_EVENT = 'jansetu:unauthorized';
export const SESSION_KEY = 'jansetu.auth.session';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
type ApiRequestOptions = Omit<RequestInit, 'body' | 'signal'> & {
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: ApiErrorCode = 'INTERNAL_ERROR',
    readonly requestId?: string,
    readonly retryable = false,
    readonly failureType: ApiFailureType = status === 0 ? 'network' : 'http',
    readonly operation?: string,
    readonly stage?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let memorySession: AuthSession | null = null;

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const user = candidate.user;
  if (typeof candidate.token !== 'string' || !user || typeof user !== 'object') return false;

  const candidateUser = user as Record<string, unknown>;
  return (
    typeof candidateUser.id === 'string' &&
    candidateUser.id.length > 0 &&
    typeof candidateUser.userCode === 'string' &&
    candidateUser.userCode.length > 0 &&
    (candidateUser.role === 'admin' || candidateUser.role === 'surveyor') &&
    typeof candidateUser.fullName === 'string' &&
    (candidate.surveyMode === undefined || candidate.surveyMode === 'village' || candidate.surveyMode === 'household')
  );
}

function isTokenExpired(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const encodedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '='))) as { exp?: unknown };
    return typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function readStoredSession(): AuthSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!isAuthSession(parsed) || isTokenExpired(parsed.token)) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Storage may be unavailable or restricted; memory auth still works.
    }
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  if (memorySession && !isTokenExpired(memorySession.token)) return memorySession;
  memorySession = readStoredSession();
  return memorySession;
}

export function setAuthSession(session: AuthSession): void {
  if (!isAuthSession(session) || isTokenExpired(session.token)) {
    clearAuthSession();
    return;
  }
  memorySession = session;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Keep the in-memory session when browser storage is unavailable.
  }
}

export function clearAuthSession(): void {
  memorySession = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage may be unavailable or restricted.
  }
}

function clientRequestId(): string {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readErrorPayload(response: Response): Promise<{ message?: string; code?: ApiErrorCode; requestId?: string; retryable?: boolean; operation?: string; stage?: string }> {
  try {
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object') return {};
    const error = (payload as { error?: unknown }).error;
    if (!error || typeof error !== 'object') return {};
    const value = error as Record<string, unknown>;
    return {
      message: typeof value.message === 'string' ? value.message : undefined,
      code: typeof value.code === 'string' ? value.code as ApiErrorCode : undefined,
      requestId: typeof value.requestId === 'string' ? value.requestId : undefined,
      retryable: typeof value.retryable === 'boolean' ? value.retryable : undefined,
      operation: typeof value.operation === 'string' ? value.operation : undefined,
      stage: typeof value.stage === 'string' ? value.stage : undefined
    };
  } catch {
    return {};
  }
}

async function request(path: string, options: ApiRequestOptions = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const session = getAuthSession();
  const requestId = clientRequestId();
  headers.set('X-Request-ID', requestId);
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);

  let body: BodyInit | undefined;
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    body = options.body;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);
  const signal = options.signal;
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  try {
    return await fetch(`${API_BASE_URL}${path}`, { ...options, credentials: 'include', headers, body, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      const failureType = signal?.aborted ? 'cancelled' : 'timeout';
      throw new ApiError('The request timed out or was cancelled.', 408, 'NETWORK_ERROR', requestId, true, failureType);
    }
    throw new ApiError('Unable to reach the server. Please check your connection.', 0, 'NETWORK_ERROR', requestId, true);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

function handleUnauthorized(): void {
  clearAuthSession();
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await request(path, options);
  if (!response.ok) {
    const payload = await readErrorPayload(response);
    const requestId = response.headers.get('X-Request-ID') || payload.requestId;
    if (response.status === 401) handleUnauthorized();
    throw new ApiError(
      payload.message || (response.status >= 500 ? 'The request could not be completed.' : `Request failed (${response.status})`),
      response.status,
      payload.code || (response.status === 401 ? 'AUTHENTICATION_ERROR' : 'INTERNAL_ERROR'),
      requestId || undefined,
      payload.retryable ?? response.status >= 500,
      'http', payload.operation, payload.stage
    );
  }

  try {
    return await response.json() as T;
  } catch {
    throw new ApiError('The server returned an invalid response.', response.status, 'MALFORMED_RESPONSE', response.headers.get('X-Request-ID') || undefined, false, 'malformed');
  }
}

export async function downloadApiFile(path: string, filename: string): Promise<void> {
  const response = await request(path);
  if (!response.ok) {
    const payload = await readErrorPayload(response);
    if (response.status === 401) handleUnauthorized();
    throw new ApiError(payload.message || `Request failed (${response.status})`, response.status, payload.code || 'INTERNAL_ERROR', response.headers.get('X-Request-ID') || payload.requestId, payload.retryable ?? false, 'http', payload.operation, payload.stage);
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
