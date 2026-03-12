import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { ApiError, createApiClient, getErrorMessage } from './client';

const BASE_URL = 'https://api.example.com';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('createApiClient', () => {
  test('get returns JSON response', async () => {
    const mockResponse = { user_id: 'u1', username: 'admin' };
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, () =>
        HttpResponse.json(mockResponse),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    const data = await client.get('/api/v1/auth/me');

    expect(data).toEqual(mockResponse);
  });

  test('post sends body and returns JSON', async () => {
    const mockResponse = {
      access_token: 'token',
      token_type: 'bearer',
      expires_in: 3600,
      user_id: 'u1',
      roles: ['admin'],
    };
    let capturedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json(mockResponse);
      }),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    const loginBody = { username: 'admin', password: 'secret' };
    const data = await client.post('/api/v1/auth/login', { body: loginBody });

    expect(capturedBody).toEqual(loginBody);
    expect(data).toEqual(mockResponse);
  });

  test('path params are substituted in URL', async () => {
    const mockSource = { name: 'my-source', display_name: 'My Source' };
    server.use(
      http.get(`${BASE_URL}/api/v1/sources/my-source`, () =>
        HttpResponse.json(mockSource),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    const data = await client.get('/api/v1/sources/{name}', {
      pathParams: { name: 'my-source' },
    });

    expect(data).toEqual(mockSource);
  });

  test('query params are appended to URL', async () => {
    const mockList = { items: [], total: 0 };
    let capturedUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/v1/sources`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockList);
      }),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    await client.request('/api/v1/sources', 'get', {
      queryParams: { search: 'foo', enabled: true, sort_order: 'asc' },
    });

    expect(capturedUrl).toContain('search=foo');
    expect(capturedUrl).toContain('enabled=true');
    expect(capturedUrl).toContain('sort_order=asc');
  });

  test('getAuthHeaders are merged into request', async () => {
    const getAuthHeaders = vi.fn().mockResolvedValue({
      Authorization: 'Bearer token123',
    });
    let capturedHeaders: Headers | undefined;
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({});
      }),
    );

    const client = createApiClient({
      baseUrl: BASE_URL,
      getAuthHeaders,
    });
    await client.get('/api/v1/auth/me');

    expect(getAuthHeaders).toHaveBeenCalled();
    expect(capturedHeaders?.get('Authorization')).toBe('Bearer token123');
    expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
  });

  test('custom fetch is used when provided', async () => {
    const customFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ version: '1.0' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createApiClient({
      baseUrl: BASE_URL,
      fetch: customFetch,
    });
    const data = await client.get('/api/v1/system/version');

    expect(customFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/system/version'),
      expect.any(Object),
    );
    expect(data).toEqual({ version: '1.0' });
  });

  test('throws ApiError on non-ok response', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, () =>
        HttpResponse.json(
          { message: 'Unauthorized', detail: 'Token expired' },
          { status: 401 },
        ),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });

    await expect(client.get('/api/v1/auth/me')).rejects.toThrow(ApiError);
    await expect(client.get('/api/v1/auth/me')).rejects.toMatchObject({
      status: 401,
      statusText: 'Unauthorized',
      detail: { message: 'Unauthorized', detail: 'Token expired' },
    });
  });

  test('ApiError message prefers message from JSON detail', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, () =>
        HttpResponse.json({ message: 'Custom error message' }, { status: 500 }),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });

    try {
      await client.get('/api/v1/auth/me');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).message).toBe('Custom error message');
    }
  });
});

describe('getErrorMessage', () => {
  test('returns string when detail is string', () => {
    expect(getErrorMessage('Something went wrong')).toBe(
      'Something went wrong',
    );
  });

  test('returns message when detail has message property', () => {
    expect(getErrorMessage({ message: 'Validation failed' })).toBe(
      'Validation failed',
    );
  });

  test('returns String(detail) for other types', () => {
    expect(getErrorMessage(null)).toBe('null');
    expect(getErrorMessage(undefined)).toBe('undefined');
    expect(getErrorMessage(404)).toBe('404');
  });

  test('returns String(detail) when message is not a string', () => {
    expect(getErrorMessage({ message: 123 })).toBe('[object Object]');
  });
});
