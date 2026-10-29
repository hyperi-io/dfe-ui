/** @vitest-environment node */

import { describe, expect, it } from 'vitest';
import { createLogger, formatRecord, writesJson } from '.';
import { isCredentialName, MASK, scrubText, scrubValue } from './scrub';

describe('isCredentialName', () => {
  it.each([
    ['password', '', true],
    ['db_password', '', true],
    ['PGPASSWORD', '', true],
    ['x-api-key', '', true],
    ['secretAccessKey', '', true],
    ['Authorization', '', true],
    ['next-auth.session-token', '', true],
    ['email', '', true],
    ['key', 'tls', true],
    ['value', 'header', true],
    ['key', 'kafka', false],
    ['routing_key', '', false],
    ['method', '', false],
    ['path', '', false],
    ['', '', false],
  ])('%s under %s is a credential: %s', (name, parent, expected) => {
    expect(isCredentialName(name, parent)).toBe(expected);
  });
});

describe('scrubText', () => {
  it.each([
    ['token=abc123 next', `token=${MASK} next`],
    ['JFROG_TOKEN=abc', `JFROG_TOKEN=${MASK}`],
    ['{"password": "a\\"b"}', `{"password": "${MASK}"}`],
    ["{'secret': 'x y'}", `{'secret': ${MASK}}`],
    ['x-auth-token: abc', `x-auth-token: ${MASK}`],
    ['Authorization: Bearer eyJ.abc.def', `Authorization: ${MASK}`],
    ['sent Bearer abc.def-123 upstream', `sent Bearer ${MASK} upstream`],
    ['jwt eyJhbGc.eyJzdWIi.sig left', `jwt ${MASK} left`],
    ['https://u:p%40ss@db.local/x', `https://u:${MASK}@db.local/x`],
    ['mail ops@example.com now', 'mail [EMAIL_REDACTED] now'],
    ['userKey=sentinel.user%40example.com', 'userKey=[EMAIL_REDACTED]'],
    ['GET /api/v1/sources 200', 'GET /api/v1/sources 200'],
    ['https://engine.local:8003/api', 'https://engine.local:8003/api'],
    ['', ''],
  ])('%s', (input, expected) => {
    expect(scrubText(input)).toBe(expected);
  });
});

describe('scrubValue', () => {
  it('masks credential keys at any depth and keeps the rest', () => {
    expect(
      scrubValue({
        user: 'admin',
        nested: { accessToken: 'abc', tls: { key: 'pem', port: 443 } },
        list: [{ password: 'x' }, 'Bearer abc'],
      }),
    ).toEqual({
      user: 'admin',
      nested: { accessToken: MASK, tls: { key: MASK, port: 443 } },
      list: [{ password: MASK }, `Bearer ${MASK}`],
    });
  });

  it.each([
    [Number.NaN, 'NaN'],
    [Number.POSITIVE_INFINITY, 'Infinity'],
    [undefined, null],
    [BigInt(7), '7'],
    [true, true],
    [null, null],
  ])('renders %s as JSON-safe %s', (input, expected) => {
    expect(scrubValue(input)).toEqual(expected);
  });

  it('survives a cycle and a deep nest', () => {
    const cyclic: Record<string, unknown> = { name: 'a' };
    cyclic.self = cyclic;
    expect(scrubValue(cyclic)).toEqual({ name: 'a', self: '<cycle>' });

    let deep: Record<string, unknown> = { leaf: 1 };
    for (let i = 0; i < 40; i += 1) deep = { next: deep };
    expect(JSON.stringify(scrubValue(deep))).toContain('<depth limit>');
  });

  it('keeps an error as its name and scrubbed message', () => {
    expect(scrubValue(new TypeError('bad token=abc'))).toEqual({
      name: 'TypeError',
      message: `bad token=${MASK}`,
    });
  });
});

describe('formatRecord', () => {
  const now = new Date('2026-10-29T01:02:03.456Z');

  it('writes scalo JSON with the fields under one key', () => {
    const line = formatRecord(
      'WARNING',
      'dfe-ui.auth',
      'login refused for ops@example.com',
      { level: 'shadow', password: 'x' },
      true,
      now,
    );
    expect(JSON.parse(line)).toEqual({
      timestamp: '2026-10-29T01:02:03.456000Z',
      level: 'WARNING',
      target: 'dfe-ui.auth',
      message: 'login refused for [EMAIL_REDACTED]',
      fields: { level: 'shadow', password: MASK },
    });
  });

  it('writes a readable line with key=value fields in text', () => {
    expect(
      formatRecord('INFO', 't', 'hello', { route: '/x' }, false, now),
    ).toBe('2026-10-29T01:02:03.456000Z INFO     t: hello route="/x"');
  });
});

describe('writesJson', () => {
  it.each([
    [{ LOG_FORMAT: 'json' }, true],
    [{ LOG_FORMAT: 'text', NODE_ENV: 'production' }, false],
    [{ LOG_FORMAT: 'auto', NODE_ENV: 'production' }, true],
    [{ NODE_ENV: 'production' }, true],
    [{ NODE_ENV: 'development' }, false],
    [{ OTEL_EXPORTER_OTLP_ENDPOINT: 'http://otel:4318' }, true],
    [{ OTEL_EXPORTER_OTLP_ENDPOINT: ' ' }, false],
    [{ LOG_FORMAT: 'bogus' }, false],
  ])('%j writes JSON: %s', (env, expected) => {
    expect(writesJson(env)).toBe(expected);
  });
});

describe('createLogger', () => {
  it.each([
    [undefined, ['INFO', 'WARNING', 'ERROR']],
    ['debug', ['DEBUG', 'INFO', 'WARNING', 'ERROR']],
    ['WARN', ['WARNING', 'ERROR']],
    ['error', ['ERROR']],
    ['nonsense', ['INFO', 'WARNING', 'ERROR']],
  ])('LOG_LEVEL=%s writes %j', (level, expected) => {
    const lines: string[] = [];
    const log = createLogger(
      't',
      { LOG_LEVEL: level, LOG_FORMAT: 'json' },
      (line) => lines.push(line),
    );
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');
    expect(lines.map((line) => JSON.parse(line).level)).toEqual(expected);
  });
});
