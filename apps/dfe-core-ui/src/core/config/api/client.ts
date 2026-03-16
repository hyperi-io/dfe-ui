import type { paths } from '@dfe/dfe-engine-types';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/** Extract the operation type for a path and method (when the endpoint exists). */
type OperationFor<Path extends keyof paths, Method extends HttpMethod> =
  paths[Path] extends Record<Method, infer Op> ? Op : never;

/** Success response body: 200 or 201 application/json. */
type SuccessResponseBody<Op> = Op extends {
  responses: {
    200: { content: { 'application/json': infer R } };
  };
}
  ? R
  : Op extends {
        responses: {
          201: { content: { 'application/json': infer R } };
        };
      }
    ? R
    : never;

/** Request body when present. */
type RequestBody<Op> = Op extends {
  requestBody: { content: { 'application/json': infer B } };
}
  ? B
  : undefined;

/** Path parameters when present. */
type PathParams<Op> = Op extends { parameters: { path: infer P } }
  ? P
  : undefined;

/** Query parameters when present. */
type QueryParams<Op> = Op extends { parameters: { query?: infer Q } }
  ? Q extends Record<string, unknown>
    ? Q
    : undefined
  : undefined;

/** Options for a request that has path params. */
type RequestOptions<Path extends keyof paths, Method extends HttpMethod> =
  OperationFor<Path, Method> extends infer Op
    ? Op extends never
      ? { pathParams?: undefined; queryParams?: undefined; body?: undefined }
      : {
          pathParams?: PathParams<Op>;
          queryParams?: QueryParams<Op>;
          body?: RequestBody<Op>;
        }
    : never;

/** Replaces {param} segments in path with values from params. */
function applyPathParams(
  path: string,
  pathParams?: Record<string, string>,
): string {
  if (!pathParams) return path;
  return path.replace(/\{(\w+)\}/g, (_, key) => pathParams[key] ?? `{${key}}`);
}

/** Builds URL with optional query string. */
function buildUrl(
  base: string,
  path: string,
  query?: Record<string, unknown>,
): string {
  const url = new URL(path, base);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

export type ApiClientConfig = {
  baseUrl: string;
  getAuthHeaders?: () => HeadersInit | Promise<HeadersInit>;
  fetch?: typeof fetch;
};

/**
 * Type-safe API client for the DFE Engine API.
 * Request bodies, query/path params, and response data are inferred from @dfe/dfe-engine-types.
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getAuthHeaders, fetch: customFetch } = config;

  async function request<Path extends keyof paths, Method extends HttpMethod>(
    path: Path,
    method: Method,
    options?: RequestOptions<Path, Method>,
  ): Promise<SuccessResponseBody<OperationFor<Path, Method>>> {
    const { pathParams, queryParams, body } = options ?? {};
    const resolvedPath = applyPathParams(
      path as string,
      pathParams as Record<string, string> | undefined,
    );
    const url = buildUrl(
      baseUrl,
      resolvedPath,
      queryParams as Record<string, unknown> | undefined,
    );

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders?.()),
    };

    const init: RequestInit = {
      method,
      headers,
      ...(body !== undefined &&
        method !== 'get' && { body: JSON.stringify(body) }),
    };

    const fetchFn = customFetch ?? globalThis.fetch;
    const res = await fetchFn(url, init);

    // 204 No Content - no body to parse
    if (res.status === 204) {
      return undefined as unknown as Promise<
        SuccessResponseBody<OperationFor<Path, Method>>
      >;
    }

    if (!res.ok) {
      const text = await res.text();
      let detail: unknown = text;
      try {
        detail = JSON.parse(text);
      } catch (error) {
        throw new Error(`Response body is not valid JSON: ${text}`, {
          cause: error,
        });
      }

      throw new ApiError(res.status, res.statusText, detail);
    }

    // 204 No Content has an empty body - do not attempt to parse JSON
    if (res.status === 204) {
      return undefined as unknown as Promise<
        SuccessResponseBody<OperationFor<Path, Method>>
      >;
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      return res.json() as Promise<
        SuccessResponseBody<OperationFor<Path, Method>>
      >;
    }

    return undefined as unknown as Promise<
      SuccessResponseBody<OperationFor<Path, Method>>
    >;
  }

  return {
    request,

    get<Path extends keyof paths>(
      path: Path,
      options?: RequestOptions<Path, 'get'>,
    ): Promise<SuccessResponseBody<OperationFor<Path, 'get'>>> {
      return request(path, 'get', options);
    },

    post<Path extends keyof paths>(
      path: Path,
      options?: RequestOptions<Path, 'post'>,
    ): Promise<SuccessResponseBody<OperationFor<Path, 'post'>>> {
      return request(path, 'post', options);
    },

    put<Path extends keyof paths>(
      path: Path,
      options?: RequestOptions<Path, 'put'>,
    ): Promise<SuccessResponseBody<OperationFor<Path, 'put'>>> {
      return request(path, 'put', options);
    },

    delete<Path extends keyof paths>(
      path: Path,
      options?: RequestOptions<Path, 'delete'>,
    ): Promise<SuccessResponseBody<OperationFor<Path, 'delete'>>> {
      return request(path, 'delete', options);
    },

    patch<Path extends keyof paths>(
      path: Path,
      options?: RequestOptions<Path, 'patch'>,
    ): Promise<SuccessResponseBody<OperationFor<Path, 'patch'>>> {
      return request(path, 'patch', options);
    },
  };
}

/** Extracts a user-facing message from an error detail */
export function getErrorMessage(detail: unknown): string {
  if (detail != null) {
    if (typeof detail === 'string') return detail;
    if (typeof detail === 'object') {
      if (
        'message' in detail &&
        typeof (detail as { message: unknown }).message === 'string'
      ) {
        return (detail as { message: string }).message;
      }
      if ('detail' in detail && typeof detail.detail === 'string') {
        return (detail as { detail: string }).detail;
      }
    }
  }
  return String(detail);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly detail: unknown,
  ) {
    const message = getErrorMessage(detail) || statusText;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
  }
}

export type ApiClient = ReturnType<typeof createApiClient>;
