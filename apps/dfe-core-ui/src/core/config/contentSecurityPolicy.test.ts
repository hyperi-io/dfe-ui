/** @vitest-environment node */

import { describe, expect, test } from 'vitest';
import {
  contentSecurityPolicy,
  createNonce,
  cspSources,
} from './contentSecurityPolicy';

// Next's own acceptance pattern for a nonce source (get-script-nonce-from-header.js).
const NEXT_NONCE_SOURCE = /^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/;

const directive = (policy: string, name: string): string[] => {
  const found = policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));
  return found ? found.split(/\s+/).slice(1) : [];
};

const noSources = { connect: [], frame: [] };

describe('contentSecurityPolicy', () => {
  test('scripts need the nonce, and nothing lets an injected inline script run', () => {
    const policy = contentSecurityPolicy({
      nonce: 'abc123==',
      dev: false,
      sources: noSources,
    });
    const scriptSrc = directive(policy, 'script-src');

    expect(scriptSrc).toContain("'nonce-abc123=='");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(directive(policy, 'default-src')).toEqual(["'self'"]);
  });

  test('a development server adds eval for React Refresh, a production one never does', () => {
    const dev = contentSecurityPolicy({
      nonce: 'n',
      dev: true,
      sources: noSources,
    });

    expect(directive(dev, 'script-src')).toContain("'unsafe-eval'");
  });

  test('the console cannot be framed, and plugins and base rewrites are off', () => {
    const policy = contentSecurityPolicy({
      nonce: 'n',
      dev: false,
      sources: noSources,
    });

    expect(directive(policy, 'frame-ancestors')).toEqual(["'none'"]);
    expect(directive(policy, 'object-src')).toEqual(["'none'"]);
    expect(directive(policy, 'base-uri')).toEqual(["'none'"]);
    expect(directive(policy, 'form-action')).toEqual(["'self'"]);
    expect(directive(policy, 'worker-src')).toEqual(["'self'"]);
  });

  test('with no HyperDX configured nothing may be framed', () => {
    const policy = contentSecurityPolicy({
      nonce: 'n',
      dev: false,
      sources: noSources,
    });

    expect(directive(policy, 'frame-src')).toEqual(["'none'"]);
  });

  test('extra origins land in connect-src and frame-src', () => {
    const policy = contentSecurityPolicy({
      nonce: 'n',
      dev: false,
      sources: {
        connect: ['https://api.example.com'],
        frame: ['https://hyperdx.example.com'],
      },
    });

    expect(directive(policy, 'connect-src')).toEqual([
      "'self'",
      'https://api.example.com',
    ]);
    expect(directive(policy, 'frame-src')).toEqual([
      'https://hyperdx.example.com',
    ]);
  });
});

describe('createNonce', () => {
  test('is a source Next will read, and fresh every time', () => {
    const first = createNonce();
    const second = createNonce();

    expect(`'nonce-${first}'`).toMatch(NEXT_NONCE_SOURCE);
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(22);
  });
});

describe('cspSources', () => {
  test('a relative or empty API URL adds nothing beyond self', () => {
    expect(cspSources({ apiUrl: '' }).connect).toEqual([]);
    expect(cspSources({ apiUrl: '/api' }).connect).toEqual([]);
    expect(cspSources({}).connect).toEqual([]);
  });

  test('an absolute API URL contributes its origin only', () => {
    expect(
      cspSources({ apiUrl: 'https://dfe.example.com/api' }).connect,
    ).toEqual(['https://dfe.example.com']);
  });

  test('HYPERDX_URL wins over the port form', () => {
    expect(
      cspSources({
        hyperdxUrl: 'https://hyperdx.example.com/',
        hyperdxPort: '8091',
        requestHost: 'dfe.example.com',
      }).frame,
    ).toEqual(['https://hyperdx.example.com']);
  });

  test('the port form frames the host the browser used, on that port', () => {
    expect(
      cspSources({ hyperdxPort: '8091', requestHost: '10.0.0.5:3000' }).frame,
    ).toEqual(['10.0.0.5:8091']);
  });

  test('an IPv6 literal host, which CSP cannot name, frames any host on the port', () => {
    expect(
      cspSources({ hyperdxPort: '8091', requestHost: '[::1]:3000' }).frame,
    ).toEqual(['*:8091']);
  });

  test('a scheme other than http(s), or a non-numeric port, adds nothing', () => {
    expect(
      cspSources({ hyperdxUrl: 'javascript:alert(1)', apiUrl: 'data:,x' }),
    ).toEqual({ connect: [], frame: [] });
    expect(
      cspSources({ hyperdxPort: '80; script-src *', requestHost: 'a' }).frame,
    ).toEqual([]);
  });

  test('a Host header that is not a host adds nothing, so it cannot inject a source', () => {
    expect(
      cspSources({ hyperdxPort: '8091', requestHost: 'a b; script-src *' })
        .frame,
    ).toEqual([]);
    expect(
      cspSources({ hyperdxPort: '8091', requestHost: 'x;script-src' }).frame,
    ).toEqual([]);
  });
});
