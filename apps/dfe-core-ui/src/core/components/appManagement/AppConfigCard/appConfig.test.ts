import { ApiError } from '@/core/config/api/client';
import { TAppConfigField } from '@/core/hooks/apps/config/useFetchAppConfig/types';
import { describe, expect, it } from 'vitest';
import {
  buildChanges,
  fieldErrorFrom,
  groupFields,
  placeholderFor,
  sectionNameFor,
} from './appConfig';

const field = (over: Partial<TAppConfigField> = {}): TAppConfigField => ({
  path: 'config.log_level',
  type: 'string',
  title: '',
  description: '',
  secret: false,
  enum: null,
  default: 'info',
  value: 'info',
  provenance: 'default',
  dial: null,
  protected: false,
  set: false,
  ...over,
});

describe('sectionNameFor', () => {
  it('groups a nested option under its own first segment', () => {
    expect(sectionNameFor('config.kafka.brokers')).toBe('kafka');
  });

  it('collects a single-segment option under general', () => {
    expect(sectionNameFor('config.log_level')).toBe('general');
  });

  it('reads a path that is not config-rooted without crashing', () => {
    expect(sectionNameFor('extraEnv.RUST_BACKTRACE')).toBe('extraEnv');
  });
});

describe('groupFields', () => {
  it('sorts groups alphabetically but leaves general last', () => {
    const grouped = groupFields([
      field({ path: 'config.log_level' }),
      field({ path: 'config.kafka.brokers' }),
      field({ path: 'config.batch.size' }),
    ]);

    expect(grouped.map((section) => section.name)).toEqual([
      'batch',
      'kafka',
      'general',
    ]);
  });

  it('path-sorts inside a group', () => {
    const grouped = groupFields([
      field({ path: 'config.kafka.topic' }),
      field({ path: 'config.kafka.brokers' }),
    ]);

    expect(grouped[0]?.fields.map((entry) => entry.path)).toEqual([
      'config.kafka.brokers',
      'config.kafka.topic',
    ]);
  });

  it('returns nothing for a contract with no options', () => {
    expect(groupFields([])).toEqual([]);
  });
});

describe('placeholderFor', () => {
  it('shows the default an untouched option would run', () => {
    expect(placeholderFor(field({ default: 'info' }))).toBe('info');
  });

  it('never shows a default for a secret, because none comes back', () => {
    expect(placeholderFor(field({ secret: true, default: null }))).toBe('unset');
  });

  it('says a chart-derived value comes from the deployment', () => {
    expect(placeholderFor(field({ provenance: 'chart' }))).toBe(
      'set by the deployment',
    );
  });

  it('says unset where the app declares no default at all', () => {
    expect(placeholderFor(field({ default: null }))).toBe('unset');
  });

  it('renders a structured default as JSON rather than [object Object]', () => {
    expect(
      placeholderFor(field({ type: 'array', default: ['a', 'b'] })),
    ).toBe('["a","b"]');
  });
});

describe('buildChanges', () => {
  const byPath = new Map([
    ['config.log_level', field({ enum: ['info', 'warn'] })],
    ['config.batch.size', field({ path: 'config.batch.size', type: 'integer' })],
    ['config.kafka.brokers', field({ path: 'config.kafka.brokers', type: 'array' })],
  ]);

  // The whole point of the edit map: an option nobody touched has no draft, so
  // it cannot reach the payload and cannot become an override by being looked at.
  it('sends nothing at all when no option was edited', () => {
    const built = buildChanges({}, byPath);

    expect(built).toEqual({ ok: true, changes: {} });
  });

  it('sends only the option that was edited', () => {
    const built = buildChanges({ 'config.batch.size': 20 }, byPath);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(Object.keys(built.changes)).toEqual(['config.batch.size']);
    expect(built.changes['config.batch.size']).toBe(20);
  });

  it('keeps a null, because that is how a custom env key is removed', () => {
    const built = buildChanges({ 'extraEnv.RUST_BACKTRACE': null }, byPath);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.changes['extraEnv.RUST_BACKTRACE']).toBeNull();
  });

  it('parses a structured option into real JSON before sending it', () => {
    const built = buildChanges(
      { 'config.kafka.brokers': '["a:9092"]' },
      byPath,
    );

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.changes['config.kafka.brokers']).toEqual(['a:9092']);
  });

  it('reports which option holds unparseable JSON instead of sending it', () => {
    const built = buildChanges({ 'config.kafka.brokers': '[oops' }, byPath);

    expect(built.ok).toBe(false);
    if (built.ok) return;
    expect(built.path).toBe('config.kafka.brokers');
    expect(built.reason).not.toBe('');
  });

  it('carries a path the contract never declared, so a custom key still lands', () => {
    const built = buildChanges({ 'extraEnv.NEW_KEY': 'yes' }, byPath);

    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.changes['extraEnv.NEW_KEY']).toBe('yes');
  });
});

describe('fieldErrorFrom', () => {
  // The engine refuses with {code, path, message}; its handler moves the path
  // into context and leaves errors[] empty, so reading errors[] alone loses it.
  it('reads the refused path out of the error context', () => {
    const error = new ApiError(409, 'Conflict', {
      code: 'chart_derived',
      message: 'the deployment sets this through kafka.mode',
      errors: [],
      context: { path: 'config.kafka.brokers' },
    });

    expect(fieldErrorFrom(error)).toEqual({
      path: 'config.kafka.brokers',
      message: 'the deployment sets this through kafka.mode',
    });
  });

  it('returns nothing for an error that names no path', () => {
    const error = new ApiError(409, 'Conflict', {
      code: 'conflict',
      message: 'stale',
      errors: [],
    });

    expect(fieldErrorFrom(error)).toBeNull();
  });

  it('returns nothing for a plain error', () => {
    expect(fieldErrorFrom(new Error('offline'))).toBeNull();
  });

  it('returns nothing for a null error', () => {
    expect(fieldErrorFrom(null)).toBeNull();
  });
});
