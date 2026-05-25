import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetIdToken, mockIsConfigured } = vi.hoisted(() => ({
  mockGetIdToken: vi.fn<() => Promise<string>>(),
  mockIsConfigured: vi.fn<() => boolean>(),
}));

vi.mock('@/auth/firebase', () => ({
  isFirebaseConfigured: mockIsConfigured,
  getFirebaseAuth: () => ({
    currentUser: {
      getIdToken: mockGetIdToken,
    },
  }),
}));

const { apiFetch, ApiError } = await import('./client');

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  mockGetIdToken.mockReset();
  mockIsConfigured.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const okJson = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('apiFetch', () => {
  it('attaches the Firebase ID token as a Bearer header when signed in', async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetIdToken.mockResolvedValueOnce('id-token-123');
    fetchMock.mockResolvedValueOnce(okJson({ user: { _id: 'u' } }));

    await apiFetch('/users/me');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init?.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer id-token-123');
  });

  it('omits the Authorization header when Firebase is not configured', async () => {
    mockIsConfigured.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(okJson({ status: 'ok' }));

    await apiFetch('/healthz');

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init?.headers as Headers;
    expect(headers.get('authorization')).toBeNull();
  });

  it('JSON-encodes the body and sets Content-Type when body is supplied', async () => {
    mockIsConfigured.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(okJson({ user: { _id: 'u' } }));

    await apiFetch('/users/sync', { method: 'POST', body: { displayName: 'A' } });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.body).toBe(JSON.stringify({ displayName: 'A' }));
    const headers = init?.headers as Headers;
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('throws ApiError with the server error code on non-2xx', async () => {
    mockIsConfigured.mockReturnValue(false);
    fetchMock.mockResolvedValueOnce(
      okJson({ error: { code: 'validation_failed', message: 'bad' } }, 422),
    );

    await expect(apiFetch('/users/sync', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 422,
      code: 'validation_failed',
    });
  });

  it('ApiError is a real Error subclass', async () => {
    const err = new ApiError(500, 'internal_error', 'boom');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
  });
});
