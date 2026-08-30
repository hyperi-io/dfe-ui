import { describe, expect, it } from 'vitest';
import { hasSourceRules, sourceRoutingRule } from './sourceRoutingRule';

const rule = (source: string, value: string) => ({
  field: 'event.dataset',
  mode: 'key_value_set',
  match_value: value,
  source,
});

describe('sourceRoutingRule', () => {
  it('picks out only this source rule from the whole receiver block', () => {
    const compiled = {
      source_rules: [rule('syslog', 'syslog'), rule('windows', 'windows')],
    };

    const state = sourceRoutingRule(compiled, compiled, 'windows');

    expect(state.compiled).toEqual(rule('windows', 'windows'));
    expect(state.deployed).toEqual(rule('windows', 'windows'));
    expect(state.drift).toBe(false);
  });

  it('reports drift when the deployed rule differs from the compiled one', () => {
    const compiled = { source_rules: [rule('syslog', 'syslog')] };
    const deployed = { source_rules: [rule('syslog', 'syslog-old')] };

    expect(sourceRoutingRule(compiled, deployed, 'syslog').drift).toBe(true);
  });

  it('reports drift when the receiver carries no rule for the source', () => {
    const compiled = { source_rules: [rule('syslog', 'syslog')] };

    const state = sourceRoutingRule(compiled, { source_rules: [] }, 'syslog');

    expect(state.deployed).toBeNull();
    expect(state.drift).toBe(true);
  });

  it('does not report drift when neither side names the source', () => {
    const state = sourceRoutingRule(
      { source_rules: [rule('other', 'other')] },
      { source_rules: [rule('other', 'other')] },
      'syslog',
    );

    expect(state.compiled).toBeNull();
    expect(state.deployed).toBeNull();
    expect(state.drift).toBe(false);
  });

  it('treats a missing match_value and a null one as the same rule', () => {
    const compiled = {
      source_rules: [{ field: 'host', mode: 'key_present', source: 'syslog' }],
    };
    const deployed = {
      source_rules: [
        {
          field: 'host',
          mode: 'key_present',
          match_value: null,
          source: 'syslog',
        },
      ],
    };

    expect(sourceRoutingRule(compiled, deployed, 'syslog').drift).toBe(false);
  });

  it('survives a block that is not the shape it expects', () => {
    const state = sourceRoutingRule(null, 'nonsense', 'syslog');

    expect(state.compiled).toBeNull();
    expect(state.deployed).toBeNull();
  });
});

describe('hasSourceRules', () => {
  it('is true only for a compiler that emits per-source rules', () => {
    expect(hasSourceRules({ source_rules: [] })).toBe(true);
    expect(hasSourceRules({ source_to_table: { a: 'b' } })).toBe(false);
    expect(hasSourceRules(null)).toBe(false);
  });
});
