// jsdom 28+ provides its own fetch that MSW cannot intercept.
// Restore Node's native fetch (undici) so MSW's setupServer interceptors work.
import { fetch, Headers, Request, Response } from 'undici';

globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
globalThis.Request = Request as unknown as typeof globalThis.Request;
globalThis.Response = Response as unknown as typeof globalThis.Response;
