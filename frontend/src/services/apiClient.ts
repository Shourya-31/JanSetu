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

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'MALFORMED_RESPONSE';

const UNAUTHORIZED_EVENT = 'jansetu:unauthorized';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: ApiErrorCode = 'INTERNAL_ERROR',
    readonly requestId?: string,
    readonly retryable = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let memorySession: AuthSession | null = null;

export function getAuthSession(): AuthSession | null {
  return memorySession;
}

export function setAuthSession(session: AuthSession): void {
  memorySession = session;
}

export function clearAuthSession(): void {
  memorySession = null;
}

function clientRequestId(): string {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readErrorPayload(response: Response): Promise<{ message?: string; code?: ApiErrorCode; requestId?: string; retryable?: boolean }> {
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
      retryable: typeof value.retryable === 'boolean' ? value.retryable : undefined
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
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  try {
    return await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0, 'NETWORK_ERROR', requestId, true);
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await request(path, options);
  if (!response.ok) {
    const payload = await readErrorPayload(response);
    const requestId = response.headers.get('X-Request-ID') || payload.requestId;
    const session = getAuthSession();
    if (response.status === 401 && session) {
      clearAuthSession();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(
      payload.message || (response.status >= 500 ? 'The request could not be completed.' : `Request failed (${response.status})`),
      response.status,
      payload.code || (response.status === 401 ? 'AUTHENTICATION_ERROR' : 'INTERNAL_ERROR'),
      requestId || undefined,
      payload.retryable ?? response.status >= 500
    );
  }

  try {
    return await response.json() as T;
  } catch {
    throw new ApiError('The server returned an invalid response.', response.status, 'MALFORMED_RESPONSE', response.headers.get('X-Request-ID') || undefined, false);
  }
}

export async function downloadApiFile(path: string, filename: string): Promise<void> {
  const response = await request(path);
  if (!response.ok) {
    const payload = await readErrorPayload(response);
    throw new ApiError(payload.message || `Request failed (${response.status})`, response.status, payload.code || 'INTERNAL_ERROR', response.headers.get('X-Request-ID') || payload.requestId, payload.retryable ?? false);
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
