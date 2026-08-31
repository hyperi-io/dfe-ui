import type { paths } from '@repo/dfe-engine-types';

export type DfeClientHttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/** Extract the operation type for a path and method (when the endpoint exists). */
export type DfeClientOperationFor<
  Path extends keyof paths,
  Method extends DfeClientHttpMethod,
> = paths[Path] extends Record<Method, infer Op> ? Op : never;

/** Success response body: 200 or 201 application/json. */
export type DfeClientSuccessResponseBody<Op> = Op extends {
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
    : Op extends {
          responses: {
            202: { content: { 'application/json': infer R } };
          };
        }
      ? R
      : never;

/** Request body when present (JSON or multipart; prefer FormData for multipart endpoints). */
export type DfeClientRequestBody<Op> = Op extends {
  requestBody: { content: { 'application/json': infer B } };
}
  ? B
  : Op extends {
        requestBody: { content: { 'multipart/form-data': infer B } };
      }
    ? B | FormData
    : undefined;

/** Path parameters when present. */
type DfeClientPathParams<Op> = Op extends { parameters: { path: infer P } }
  ? P
  : undefined;

/** Query parameters when present. */
type DfeClientQueryParams<Op> = Op extends { parameters: { query?: infer Q } }
  ? Q extends Record<string, unknown>
    ? Q
    : undefined
  : undefined;

/**
 * Header parameters when the operation declares them.
 *
 * Only headers the spec puts on that one operation are expressible, so this is
 * not a general escape hatch for setting arbitrary headers - today it is
 * `If-Match` on the writes the engine guards. A header typed `string | null`
 * is omitted entirely when null, which is what an unguarded first write needs.
 */
type DfeClientHeaderParams<Op> = Op extends { parameters: { header?: infer H } }
  ? H extends Record<string, unknown>
    ? H
    : undefined
  : undefined;

/** Options for a request that has path params. */
export type DfeClientRequestOptions<
  Path extends keyof paths,
  Method extends DfeClientHttpMethod,
> =
  DfeClientOperationFor<Path, Method> extends infer Op
    ? Op extends never
      ? { pathParams?: undefined; queryParams?: undefined; body?: undefined }
      : {
          pathParams?: DfeClientPathParams<Op>;
          queryParams?: DfeClientQueryParams<Op>;
          headerParams?: DfeClientHeaderParams<Op>;
          body?: DfeClientRequestBody<Op>;
          signal?: AbortSignal;
        }
    : never;
