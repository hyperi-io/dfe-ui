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

/**
 * Header params as string headers, dropping the ones that are not set.
 *
 * A header the caller has no value for must be absent rather than sent as the
 * literal "null" - an optimistic-concurrency write with no revision in hand is
 * an unguarded write, which the engine accepts, whereas `If-Match: null` is a
 * revision that matches nothing.
 */
function definedHeaders(
  headerParams?: Record<string, unknown>,
): Record<string, string> {
  if (!headerParams) return {};
  const entries = Object.entries(headerParams).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );
  return Object.fromEntries(entries.map(([k, v]) => [k, String(v)]));
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
    const { pathParams, queryParams, headerParams, body, signal } =
      options ?? {};
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
      // Last, so an operation's own declared header wins. Only headers the spec
      // declares on that operation are expressible, so this cannot shadow
      // Authorization by accident.
      ...definedHeaders(headerParams as Record<string, unknown> | undefined),
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
      } catch {
        // A proxy can answer a guarded write with a bare 412 and no JSON body,
        // and the status still has to reach the caller.
        detail = text;
      }

      if (res.status === 401) {
        const isAuthRefreshRequest = resolvedPath.endsWith('/auth/refresh');
        if (!isAuthRefreshRequest) {
          await onUnauthorized?.();
        }
      }

      throw new ApiError(res.status, res.statusText, detail);
    }

    // The browser follows the proxy's login redirect itself, so a response that
    // was redirected answered for a request the engine never saw.
    if (res.redirected) {
      throw new ApiError(res.status, res.statusText, {
        code: 'invalid_response',
        message: `The request was redirected to ${res.url} and never reached the engine.`,
      });
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      return res.json() as Promise<
        DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
      >;
    }

    // Every engine 2xx is JSON or an empty body, so a page here is the proxy
    // answering in its place.
    const text = await res.text();
    if (text.trim() === '') {
      return undefined as unknown as Promise<
        DfeClientSuccessResponseBody<DfeClientOperationFor<Path, Method>>
      >;
    }

    throw new ApiError(res.status, res.statusText, {
      code: 'invalid_response',
      message: `The API answered ${res.status} with ${contentType ?? 'no content type'} instead of JSON, so the request never reached the engine.`,
    });
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

/** The engine's FieldError: which field was refused and why. */
export type ApiErrorFieldDetail = {
  /** Dotted path to the invalid field, empty when the whole body was refused. */
  field?: string;
  message: string;
  code?: string;
};

/** The engine's ErrorResponse: a machine-readable code beside the prose. */
export type ApiErrorResponseBody = {
  code?: string;
  message: string;
  errors?: ApiErrorFieldDetail[];
  context?: Record<string, unknown> | null;
};

/** Parsed error JSON body from a failed request (`ApiError.detail`). */
export function getApiErrorResponseBody(
  error: unknown,
): ApiErrorResponseBody | null {
  if (!(error instanceof ApiError)) return null;
  const { detail } = error;
  if (detail == null || typeof detail !== 'object') return null;
  if (
    !('message' in detail) ||
    typeof (detail as { message: unknown }).message !== 'string'
  ) {
    return null;
  }
  return detail as ApiErrorResponseBody;
}

/**
 * The field-level lines behind the summary, each prefixed by the field it names.
 *
 * The summary alone is often a count - "3 validation error(s)" - so dropping
 * this array leaves the user with no way to know which field the engine
 * refused.
 */
export function getApiErrorFieldMessages(error: unknown): string[] {
  const errors = getApiErrorResponseBody(error)?.errors;
  if (!Array.isArray(errors)) return [];
  return errors
    .filter((detail) => typeof detail?.message === 'string' && detail.message)
    .map((detail) =>
      detail.field ? `${detail.field}: ${detail.message}` : detail.message,
    );
}

/** A write refused because the resource moved since it was read. */
export type ApiWriteConflict = {
  message: string;
  /** The revision to re-read against, so recovering costs no extra round trip. */
  head: string;
  /** The stale revision that was sent, when the engine reports it. */
  current?: string;
};

/**
 * A stale-revision refusal, or null for every other failure.
 *
 * The status alone will not do: the app surface also answers 409 for
 * `review_required`, `single_instance_app` and `scaling_unsupported`, none of
 * which a re-read fixes. The code alone will not do either, because a duplicate
 * source name is `conflict` too. A revision to retry against is what separates
 * them, so the head is required rather than optional.
 */
export function getApiWriteConflict(error: unknown): ApiWriteConflict | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status !== 409 && error.status !== 412) return null;
  const body = getApiErrorResponseBody(error);
  if (body?.code !== 'conflict') return null;
  const head = body.context?.head;
  if (typeof head !== 'string' || head === '') return null;
  const current = body.context?.current;
  return {
    message: body.message,
    head,
    ...(typeof current === 'string' && current !== '' && { current }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
