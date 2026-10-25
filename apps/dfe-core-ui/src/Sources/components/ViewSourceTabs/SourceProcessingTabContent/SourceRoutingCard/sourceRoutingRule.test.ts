import {
  LOADER_ROUTING_BLOCKS,
  RECEIVER_ROUTING_BLOCKS,
} from '@/core/config/api/endpoints/generator/mocks/apps';
import { describe, expect, it } from 'vitest';
import { hasSourceRules, sourceRoutingRule } from './sourceRoutingRule';

const row = (id: string, source: string, value: string) => ({
  id,
  match: { field: 'event.dataset', op: 'equals', value },
  set: { _source: { value: source } },
});

// The engine keys each derived block by name, so every fixture here nests the
// rows under rules.rules, as the receiver's compile writes them.
const blocks = (...rows: ReturnType<typeof row>[]) => ({
  routing: { default_source: 'main' },
  rules: { targets: ['_source', '_org_id'], rules: rows },
  destinations: { default: 'kafka', sources: {} },
});

describe('sourceRoutingRule', () => {
  it('picks out only this source rows from the whole receiver rule set', () => {
    const compiled = blocks(
      row('source.syslog', 'syslog', 'syslog'),
      row('source.windows', 'windows', 'windows'),
    );

    const state = sourceRoutingRule(compiled, compiled, 'windows');

    expect(state.compiled).toEqual([
      row('source.windows', 'windows', 'windows'),
    ]);
    expect(state.deployed).toEqual(state.compiled);
    expect(state.drift).toBe(false);
  });

  it('takes every numbered row a match compiles to, and no other source', () => {
    const compiled = blocks(
      row('source.edge.1', 'edge', 'a'),
      row('source.edge.2', 'edge', 'b'),
      row('source.edge-two', 'edge-two', 'c'),
      row('source.edgy', 'edgy', 'd'),
    );

    const state = sourceRoutingRule(compiled, compiled, 'edge');

    expect(state.compiled.map((r) => r.id)).toEqual([
      'source.edge.1',
      'source.edge.2',
    ]);
  });

  it('leaves out compatibility rows, which set the org and the source for a profile', () => {
    const compiled = {
      rules: {
        rules: [
          row('source.syslog', 'syslog', 'syslog'),
          {
            id: 'compat.elastic-agent.dataset',
            match: { field: 'data_stream.dataset', op: 'exists' },
            set: { _org_id: { value: 'x' } },
          },
        ],
      },
    };

    expect(
      sourceRoutingRule(compiled, compiled, 'syslog').compiled,
    ).toHaveLength(1);
  });

  it('reads a grouped match and a CEL when as the rows the engine compiled', () => {
    const compiled = {
      rules: {
        rules: [
          {
            id: 'source.grouped',
            match: {
              all: [
                { field: 'a', op: 'equals', value: '1' },
                { field: 'b', op: 'equals', value: '2', negate: true },
              ],
            },
            set: { _source: { value: 'grouped' } },
          },
          {
            id: 'source.cel',
            when: "a == 'x'",
            set: { _source: { value: 'cel' } },
          },
        ],
      },
    };

    expect(
      sourceRoutingRule(compiled, compiled, 'grouped').compiled[0].match?.all,
    ).toHaveLength(2);
    expect(sourceRoutingRule(compiled, compiled, 'cel').compiled[0].when).toBe(
      "a == 'x'",
    );
  });

  it('reports drift when the deployed rows differ from the compiled ones', () => {
    const compiled = blocks(row('source.syslog', 'syslog', 'syslog'));
    const deployed = blocks(row('source.syslog', 'syslog', 'syslog-old'));

    expect(sourceRoutingRule(compiled, deployed, 'syslog').drift).toBe(true);
  });

  it('reports drift when the receiver carries no row for the source', () => {
    const state = sourceRoutingRule(
      blocks(row('source.syslog', 'syslog', 'syslog')),
      blocks(),
      'syslog',
    );

    expect(state.deployed).toEqual([]);
    expect(state.drift).toBe(true);
  });

  it('does not report drift when neither side names the source', () => {
    const state = sourceRoutingRule(
      blocks(row('source.other', 'other', 'other')),
      blocks(row('source.other', 'other', 'other')),
      'syslog',
    );

    expect(state.compiled).toEqual([]);
    expect(state.deployed).toEqual([]);
    expect(state.drift).toBe(false);
  });

  it('does not tell key order from a difference', () => {
    const compiled = blocks(row('source.syslog', 'syslog', 'syslog'));
    const deployed = {
      rules: {
        rules: [
          {
            set: { _source: { value: 'syslog' } },
            match: { value: 'syslog', op: 'equals', field: 'event.dataset' },
            id: 'source.syslog',
          },
        ],
      },
    };

    expect(sourceRoutingRule(compiled, deployed, 'syslog').drift).toBe(false);
  });

  it('finds the rows in the live receiver response, nested under their block', () => {
    const state = sourceRoutingRule(
      RECEIVER_ROUTING_BLOCKS,
      RECEIVER_ROUTING_BLOCKS,
      'syslog',
    );

    expect(state.compiled[0]).toMatchObject({
      id: 'source.syslog',
      match: { field: 'event.dataset', op: 'equals' },
    });
    expect(state.drift).toBe(false);
  });

  it('finds no rows for any source in the loader whole-app map', () => {
    const state = sourceRoutingRule(
      LOADER_ROUTING_BLOCKS,
      LOADER_ROUTING_BLOCKS,
      'syslog',
    );

    expect(state.compiled).toEqual([]);
    expect(state.deployed).toEqual([]);
  });

  it('survives a block map that is not the shape it expects', () => {
    const state = sourceRoutingRule(null, 'nonsense', 'syslog');

    expect(state.compiled).toEqual([]);
    expect(state.deployed).toEqual([]);
  });

  it('ignores rows nested one level too shallow', () => {
    // Guards the wrong depth from being read again: the engine never sends this.
    const state = sourceRoutingRule(
      { rules: [row('source.syslog', 'syslog', 'syslog')] },
      { rules: [row('source.syslog', 'syslog', 'syslog')] },
      'syslog',
    );

    expect(state.compiled).toEqual([]);
  });
});

describe('hasSourceRules', () => {
  it('is true for the receiver, whose rows sit in its rules block', () => {
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

  it('is true for an empty rule set, which is a receiver with no sources', () => {
    expect(hasSourceRules({ rules: { rules: [] } })).toBe(true);
  });
});
