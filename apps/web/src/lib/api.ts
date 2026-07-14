const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestBody = Record<string, unknown> | string | FormData | undefined;

export async function apiFetch<T>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: RequestBody } = {},
) {
  const headers = new Headers(init.headers);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body = init.body;

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const requestInit = {
    ...init,
    headers,
  } as RequestInit;

  if (body !== undefined) {
    requestInit.body = body as BodyInit;
  }

  const response = await fetch(`${apiBaseUrl}${path}`, requestInit);

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; error?: string; [key: string]: unknown }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Request failed');
  }

  return payload as T;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user');
  }
}

export function saveSession(token: string, user: unknown) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('access_token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
  }
}
