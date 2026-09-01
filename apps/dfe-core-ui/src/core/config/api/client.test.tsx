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
import {
  ApiError,
  createApiClient,
  getApiErrorResponseBody,
  getApiWriteConflict,
  getErrorMessage,
} from './client';

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

  test('patch sends PATCH method, body, and returns JSON', async () => {
    const mockResponse = {
      path: 'aws/cloudtrail',
      current: '1.0.0',
      versions: {},
    };
    let capturedMethod = '';
    let capturedBody: unknown;
    server.use(
      http.patch(
        `${BASE_URL}/api/v1/schemas/definitions/aws/cloudtrail`,
        async ({ request }) => {
          capturedMethod = request.method;
          capturedBody = await request.json();
          return HttpResponse.json(mockResponse);
        },
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    const data = await client.patch(
      '/api/v1/schemas/definitions/{schema_path}',
      {
        pathParams: { schema_path: 'aws/cloudtrail' },
        queryParams: { version: '2.1.0' },
        body: { summary: 'updated' },
      },
    );

    expect(capturedMethod).toBe('PATCH');
    expect(capturedBody).toEqual({ summary: 'updated' });
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

  test('array query params are repeated for the same key', async () => {
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
      queryParams: {
        searchable_columns: ['name', 'type', 'comment'],
      } as Record<string, unknown>,
    });

    const url = new URL(capturedUrl);
    expect(url.searchParams.getAll('searchable_columns')).toEqual([
      'name',
      'type',
      'comment',
    ]);
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
    expect(capturedHeaders?.get('Content-Type')).toBeNull();
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

  test('delete returns undefined for 204 No Content (empty body)', async () => {
    server.use(
      http.delete(
        `${BASE_URL}/api/v1/sources/my-source`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    const data = await client.delete('/api/v1/sources/{name}', {
      pathParams: { name: 'my-source' },
    });

    expect(data).toBeUndefined();
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

  test('calls onUnauthorized when response is 401', async () => {
    const onUnauthorized = vi.fn();
    server.use(
      http.get(`${BASE_URL}/api/v1/auth/me`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL, onUnauthorized });

    await expect(client.get('/api/v1/auth/me')).rejects.toThrow(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  test('does not call onUnauthorized when refresh returns 401', async () => {
    const onUnauthorized = vi.fn();
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/refresh`, () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL, onUnauthorized });

    await expect(client.post('/api/v1/auth/refresh')).rejects.toThrow(ApiError);
    expect(onUnauthorized).not.toHaveBeenCalled();
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

describe('getApiErrorResponseBody', () => {
  test('returns ErrorResponse from ApiError.detail', () => {
    const error = new ApiError(422, 'Unprocessable Entity', {
      code: 'validation_error',
      message: '1 validation error(s)',
      errors: [
        {
          field: '',
          message:
            "Value error, current version '1.0.0' must define at least one column",
          code: 'value_error',
        },
      ],
    });

    expect(getApiErrorResponseBody(error)).toEqual({
      code: 'validation_error',
      message: '1 validation error(s)',
      errors: [
        {
          field: '',
          message:
            "Value error, current version '1.0.0' must define at least one column",
          code: 'value_error',
        },
      ],
    });
  });

  test('returns null for non-ApiError', () => {
    expect(getApiErrorResponseBody(new Error('nope'))).toBeNull();
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

const SCALING_PATH = '/api/v1/apps/{service}/{instance}/scaling' as const;
const SCALING_URL = `${BASE_URL}/api/v1/apps/dfe-receiver/default/scaling`;

/** An ApiError as the client would raise it, without a round trip. */
const apiError = (status: number, detail: unknown) =>
  new ApiError(status, 'Conflict', detail);

describe('If-Match on a guarded write', () => {
  test('sends the revision the caller holds', async () => {
    let capturedHeaders: Headers | undefined;
    server.use(
      http.put(SCALING_URL, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ changed: true });
      }),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    await client.put(SCALING_PATH, {
      pathParams: { service: 'dfe-receiver', instance: 'default' },
      headerParams: { 'If-Match': 'abc1234' },
      body: { min_replicas: 2 },
    });

    expect(capturedHeaders?.get('If-Match')).toBe('abc1234');
  });

  // A deploy repo with no commits yet has no revision to be stale against, so
  // the write has to go unguarded rather than carry a header matching nothing.
  test('omits the header when there is no revision yet', async () => {
    let capturedHeaders: Headers | undefined;
    server.use(
      http.put(SCALING_URL, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ changed: true });
      }),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    await client.put(SCALING_PATH, {
      pathParams: { service: 'dfe-receiver', instance: 'default' },
      headerParams: { 'If-Match': null },
      body: { min_replicas: 2 },
    });

    expect(capturedHeaders?.has('If-Match')).toBe(false);
  });

  test('a non-JSON refusal still arrives as an ApiError with its status', async () => {
    server.use(
      http.put(
        SCALING_URL,
        () =>
          new HttpResponse('<html>Precondition Failed</html>', { status: 412 }),
      ),
    );

    const client = createApiClient({ baseUrl: BASE_URL });
    const write = client.put(SCALING_PATH, {
      pathParams: { service: 'dfe-receiver', instance: 'default' },
      body: { min_replicas: 2 },
    });

    await expect(write).rejects.toThrow(ApiError);
    await expect(write).rejects.toMatchObject({ status: 412 });
  });
});

describe('getApiWriteConflict', () => {
  test('reads the revision to retry against', () => {
    const conflict = getApiWriteConflict(
      apiError(409, {
        code: 'conflict',
        message: 'base revision is stale',
        context: { current: 'aaaaaaa1111', head: 'bbbbbbb2222' },
      }),
    );

    expect(conflict).toEqual({
      message: 'base revision is stale',
      head: 'bbbbbbb2222',
      current: 'aaaaaaa1111',
    });
  });

  // The app surface answers 409 for refusals a re-read will never fix, so the
  // status on its own must not light up the reload affordance.
  test('ignores the other 409s the app surface raises', () => {
    for (const code of [
      'review_required',
      'single_instance_app',
      'scaling_unsupported',
    ]) {
      expect(
        getApiWriteConflict(apiError(409, { code, message: 'refused' })),
      ).toBeNull();
    }
  });

  // A duplicate source name is `conflict` too, but no revision recovers it.
  test('ignores a conflict that carries no head', () => {
    expect(
      getApiWriteConflict(
        apiError(409, { code: 'conflict', message: 'name already exists' }),
      ),
    ).toBeNull();
  });

  test('ignores anything that is not an ApiError', () => {
    expect(getApiWriteConflict(new Error('offline'))).toBeNull();
    expect(getApiWriteConflict(null)).toBeNull();
  });
});
