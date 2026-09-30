/**
 * The console's Content-Security-Policy, built per request in proxy.ts. Styles
 * keep 'unsafe-inline' because antd, Ace themes and React style attributes all
 * write inline styles, and a nonce cannot cover an attribute.
 */

/** Request header Next reads the script nonce from before it renders a page. */
export const CSP_REQUEST_HEADER = 'content-security-policy';

/** A fresh nonce per response, in the base64 alphabet Next accepts. */
export function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

/** Scheme, host and port of an absolute http(s) URL; undefined for anything else. */
function originOf(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.origin
      : undefined;
  } catch {
    return undefined;
  }
}

/** CSP cannot name an IPv6 literal, so a bracketed host falls back to any host on the port. */
function hostOnPort(requestHost: string, port: string): string | undefined {
  let hostname: string;
  try {
    hostname = new URL(`http://${requestHost}`).hostname;
  } catch {
    return undefined;
  }
  if (hostname.startsWith('[')) return `*:${port}`;
  // URL parsing lets ';' through, which would end the directive.
  return /^[a-z0-9.-]+$/i.test(hostname) ? `${hostname}:${port}` : undefined;
}

export type TCspSources = {
  /** Origins fetch and XHR may reach beyond this one. */
  connect: string[];
  /** Origins the console may frame. */
  frame: string[];
};

/**
 * Extra origins, resolved as the client resolves the engine API and the HyperDX
 * embed; the port form carries no scheme so it follows the page's, as
 * HyperdxContext does.
 */
export function cspSources({
  apiUrl,
  hyperdxUrl,
  hyperdxPort,
  requestHost,
}: {
  apiUrl?: string;
  hyperdxUrl?: string;
  hyperdxPort?: string;
  requestHost?: string;
}): TCspSources {
  const apiOrigin = originOf(apiUrl);
  const hyperdxOrigin = originOf(hyperdxUrl);
  const port = hyperdxPort?.trim();

  let frameSource: string | undefined;
  if (hyperdxOrigin) {
    frameSource = hyperdxOrigin;
  } else if (port && /^\d+$/.test(port) && requestHost) {
    frameSource = hostOnPort(requestHost, port);
  }

  return {
    connect: apiOrigin ? [apiOrigin] : [],
    frame: frameSource ? [frameSource] : [],
  };
}

/** The header value. `dev` adds 'unsafe-eval', which React Refresh needs and a production build does not. */
export function contentSecurityPolicy({
  nonce,
  dev,
  sources,
}: {
  nonce: string;
  dev: boolean;
  sources: TCspSources;
}): string {
  const directives: [string, string[]][] = [
    ['default-src', ["'self'"]],
    [
      'script-src',
      [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        ...(dev ? ["'unsafe-eval'"] : []),
      ],
    ],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:']],
    ['font-src', ["'self'", 'data:']],
    ['connect-src', ["'self'", ...sources.connect]],
    ['worker-src', ["'self'"]],
    ['frame-src', sources.frame.length > 0 ? sources.frame : ["'none'"]],
    ['frame-ancestors', ["'none'"]],
    ['object-src', ["'none'"]],
    ['base-uri', ["'none'"]],
    ['form-action', ["'self'"]],
  ];
  return directives
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}
