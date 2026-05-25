import { getFirebaseAuth, isFirebaseConfigured } from '@/auth/firebase';

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5003/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export const apiFetch = async <T>(path: string, opts: ApiFetchOptions = {}): Promise<T> => {
  const { body, headers: extraHeaders, ...rest } = opts;
  const headers = new Headers(extraHeaders);

  if (isFirebaseConfigured()) {
    const current = getFirebaseAuth().currentUser;
    if (current) {
      const token = await current.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
    throw new ApiError(
      res.status,
      errBody.error?.code ?? 'unknown_error',
      errBody.error?.message ?? res.statusText,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};
