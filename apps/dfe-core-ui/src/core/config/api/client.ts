import type { paths } from '@repo/dfe-engine-types';
import type {
  DfeClientHttpMethod,
  DfeClientOperationFor,
  DfeClientRequestOptions,
  DfeClientSuccessResponseBody,
} from './client.types';

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
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) {
          if (item !== undefined && item !== null) {
            url.searchParams.append(k, String(item));
          }
        }
        continue;
      }
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export type ApiClientConfig = {
  baseUrl: string;
  getAuthHeaders?: () => HeadersInit | Promise<HeadersInit>;
  onUnauthorized?: () => void | Promise<void>;
  fetch?: typeof fetch;
};

/**
 * Type-safe API client for the DFE Engine API.
 * Request bodies, query/path params, and response data are inferred from @repo/dfe-engine-types.
 */
export function createApiClient(config: ApiClientConfig) {
  const {
    baseUrl,
    getAuthHeaders,
    onUnauthorized,
    fetch: customFetch,
  } = config;

  async function request<
    Path extends keyof paths,
    Method extends DfeClientHttpMethod,
  >(
    path: Path,
    method: Method,
    options?: DfeClientRequestOptions<Path, Method>,
  ): Promise<
    DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
  > {
    const { pathParams, queryParams, body, signal } = options ?? {};
    if (signal?.aborted) {
      throw new DOMException('Request was aborted', 'AbortError');
    }
    const resolvedPath = applyPathParams(
      path as string,
      pathParams as Record<string, string> | undefined,
    );
    const url = buildUrl(
      baseUrl,
      resolvedPath,
      queryParams as Record<string, unknown> | undefined,
    );

    const formDataBody =
      typeof FormData !== 'undefined' &&
      body != null &&
      typeof body === 'object' &&
      (body as object) instanceof FormData
        ? (body as FormData)
        : undefined;

    const hasJsonBody = body !== undefined && method !== 'get';

    const headers: HeadersInit = {
      ...(hasJsonBody &&
        formDataBody === undefined && { 'Content-Type': 'application/json' }),
      ...(await getAuthHeaders?.()),
    };

    const init: RequestInit = {
      method: method.toUpperCase(),
      headers,
      ...(hasJsonBody && {
        body: formDataBody ?? JSON.stringify(body),
      }),
      ...(signal !== undefined && { signal }),
    };

    const fetchFn = customFetch ?? globalThis.fetch;
    const res = await fetchFn(url, init);

    // 204 No Content - no body to parse
    if (res.status === 204) {
      return undefined as unknown as Promise<
        DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
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

      if (res.status === 401) {
        const isAuthRefreshRequest = resolvedPath.endsWith('/auth/refresh');
        if (!isAuthRefreshRequest) {
          await onUnauthorized?.();
        }
      }

      throw new ApiError(res.status, res.statusText, detail);
    }

    // 204 No Content has an empty body - do not attempt to parse JSON
    if (res.status === 204) {
      return undefined as unknown as Promise<
        DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
      >;
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      return res.json() as Promise<
        DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
      >;
    }

    return undefined as unknown as Promise<
      DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
    >;
  }

  return {
    request,

    get<Path extends keyof paths>(
      path: Path,
      options?: DfeClientRequestOptions<Path, 'get'>,
    ): Promise<
      DfeClientSuccessResponseBody<DfeClientOperationFor<Path, 'get'>>
    > {
      return request(path, 'get', options);
    },

    post<Path extends keyof paths>(
      path: Path,
      options?: DfeClientRequestOptions<Path, 'post'>,
    ): Promise<
      DfeClientSuccessResponseBody<DfeClientOperationFor<Path, 'post'>>
    > {
      return request(path, 'post', options);
    },

    put<Path extends keyof paths>(
      path: Path,
      options?: DfeClientRequestOptions<Path, 'put'>,
    ): Promise<
      DfeClientSuccessResponseBody<DfeClientOperationFor<Path, 'put'>>
    > {
      return request(path, 'put', options);
    },

    delete<Path extends keyof paths>(
      path: Path,
      options?: DfeClientRequestOptions<Path, 'delete'>,
    ): Promise<
      DfeClientSuccessResponseBody<DfeClientOperationFor<Path, 'delete'>>
    > {
      return request(path, 'delete', options);
    },

    patch<Path extends keyof paths>(
      path: Path,
      options?: DfeClientRequestOptions<Path, 'patch'>,
    ): Promise<
      DfeClientSuccessResponseBody<DfeClientOperationFor<Path, 'patch'>>
    > {
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

/** Parsed error JSON body from a failed request (`ApiError.detail`). */
export function getApiErrorResponseBody(
  error: unknown,
): { message: string; errors?: { message: string }[] } | null {
  if (!(error instanceof ApiError)) return null;
  const { detail } = error;
  if (detail == null || typeof detail !== 'object') return null;
  if (
    !('message' in detail) ||
    typeof (detail as { message: unknown }).message !== 'string'
  ) {
    return null;
  }
  return detail as { message: string; errors?: { message: string }[] };
}

export type ApiClient = ReturnType<typeof createApiClient>;
