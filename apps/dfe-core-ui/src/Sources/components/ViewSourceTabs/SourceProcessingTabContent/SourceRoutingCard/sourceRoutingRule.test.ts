import {
  LOADER_ROUTING_BLOCKS,
  RECEIVER_ROUTING_BLOCKS,
} from '@/core/config/api/endpoints/generator/mocks/apps';
import { describe, expect, it } from 'vitest';
import { hasSourceRules, sourceRoutingRule } from './sourceRoutingRule';

const rule = (source: string, value: string) => ({
  field: 'event.dataset',
  mode: 'key_value_set',
  match_value: value,
  source,
});

// The engine keys each derived block by name, so every fixture here nests the
// rules one level down, as the receiver's compile writes them.
const blocks = (...rules: ReturnType<typeof rule>[]) => ({
  routing: { source_rules: rules },
  destinations: { default: 'kafka', rules: [] },
});

describe('sourceRoutingRule', () => {
  it('picks out only this source rule from the whole receiver block', () => {
    const compiled = blocks(
      rule('syslog', 'syslog'),
      rule('windows', 'windows'),
    );

    const state = sourceRoutingRule(compiled, compiled, 'windows');

    expect(state.compiled).toEqual(rule('windows', 'windows'));
    expect(state.deployed).toEqual(rule('windows', 'windows'));
    expect(state.drift).toBe(false);
  });

  it('reports drift when the deployed rule differs from the compiled one', () => {
    const compiled = blocks(rule('syslog', 'syslog'));
    const deployed = blocks(rule('syslog', 'syslog-old'));

    expect(sourceRoutingRule(compiled, deployed, 'syslog').drift).toBe(true);
  });

  it('reports drift when the receiver carries no rule for the source', () => {
    const state = sourceRoutingRule(
      blocks(rule('syslog', 'syslog')),
      blocks(),
      'syslog',
    );

    expect(state.deployed).toBeNull();
    expect(state.drift).toBe(true);
  });

  it('does not report drift when neither side names the source', () => {
    const state = sourceRoutingRule(
      blocks(rule('other', 'other')),
      blocks(rule('other', 'other')),
      'syslog',
    );

    expect(state.compiled).toBeNull();
    expect(state.deployed).toBeNull();
    expect(state.drift).toBe(false);
  });

  it('treats a missing match_value and a null one as the same rule', () => {
    const compiled = {
      routing: {
        source_rules: [
          { field: 'host', mode: 'key_present', source: 'syslog' },
        ],
      },
    };
    const deployed = {
      routing: {
        source_rules: [
          {
            field: 'host',
            mode: 'key_present',
            match_value: null,
            source: 'syslog',
          },
        ],
      },
    };

    expect(sourceRoutingRule(compiled, deployed, 'syslog').drift).toBe(false);
  });

  it('finds the rule in the live receiver response, nested under its block', () => {
    const state = sourceRoutingRule(
      RECEIVER_ROUTING_BLOCKS,
      RECEIVER_ROUTING_BLOCKS,
      'syslog',
    );

    expect(state.compiled).toMatchObject({
      field: 'event.dataset',
      source: 'syslog',
    });
    expect(state.drift).toBe(false);
  });

  it('finds no rule for any source in the loader whole-app map', () => {
    const state = sourceRoutingRule(
      LOADER_ROUTING_BLOCKS,
      LOADER_ROUTING_BLOCKS,
      'syslog',
    );

    expect(state.compiled).toBeNull();
    expect(state.deployed).toBeNull();
  });

  it('survives a block map that is not the shape it expects', () => {
    const state = sourceRoutingRule(null, 'nonsense', 'syslog');

    expect(state.compiled).toBeNull();
    expect(state.deployed).toBeNull();
  });

  it('ignores a rules list nested one level too shallow', () => {
    // Guards the wrong depth from being read again: the engine never sends this.
    const state = sourceRoutingRule(
      { source_rules: [rule('syslog', 'syslog')] },
      { source_rules: [rule('syslog', 'syslog')] },
      'syslog',
    );

    expect(state.compiled).toBeNull();
  });
});

describe('hasSourceRules', () => {
  it('is true for the receiver, whose rules sit in its routing block', () => {
    expect(hasSourceRules(RECEIVER_ROUTING_BLOCKS)).toBe(true);
  });

  it('is false for the loader, whose routing block is a whole-app map', () => {
    expect(hasSourceRules(LOADER_ROUTING_BLOCKS)).toBe(false);
  });

  it('is false for a missing or unrecognisable block map', () => {
    expect(hasSourceRules(null)).toBe(false);
    expect(hasSourceRules(undefined)).toBe(false);
    expect(hasSourceRules('nonsense')).toBe(false);
    expect(hasSourceRules({})).toBe(false);
  });

  it('is true for an empty rules list, which is a receiver with no sources', () => {
    expect(hasSourceRules({ routing: { source_rules: [] } })).toBe(true);
  });
});
