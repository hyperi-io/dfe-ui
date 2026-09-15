import { TTableEngine } from '@/Sources/hooks/useFetchTableEngines/types';
import { describe, expect, it } from 'vitest';
import {
  composeEngine,
  engineArgumentsError,
  splitEngine,
} from './TableEngineInput';

const ENGINES: TTableEngine[] = [
  {
    name: 'MergeTree',
    description: 'd',
    arguments: 'none',
    argument_hint: '',
  },
  {
    name: 'CollapsingMergeTree',
    description: 'd',
    arguments: 'required',
    argument_hint: 'sign_column',
  },
];

describe('splitEngine', () => {
  it.each([
    [undefined, { variant: '', args: '' }],
    ['MergeTree', { variant: 'MergeTree', args: '' }],
    ['ReplacingMergeTree(ver)', { variant: 'ReplacingMergeTree', args: 'ver' }],
    ['SummingMergeTree(a, b)', { variant: 'SummingMergeTree', args: 'a, b' }],
  ])('splits %s', (engine, expected) => {
    expect(splitEngine(engine)).toEqual(expected);
  });
});

describe('composeEngine', () => {
  it('leaves a blank variant blank so the DFE default applies', () => {
    expect(composeEngine('', 'ver')).toBeUndefined();
  });

  it('wraps arguments in parentheses and drops empty ones', () => {
    expect(composeEngine('ReplacingMergeTree', 'ver')).toBe(
      'ReplacingMergeTree(ver)',
    );
    expect(composeEngine('ReplacingMergeTree', '  ')).toBe(
      'ReplacingMergeTree',
    );
  });
});

describe('engineArgumentsError', () => {
  it('flags missing required arguments and arguments on a variant that takes none', () => {
    expect(engineArgumentsError('CollapsingMergeTree', ENGINES)).toBe(
      'CollapsingMergeTree requires arguments: sign_column',
    );
    expect(engineArgumentsError('MergeTree(x)', ENGINES)).toBe(
      'MergeTree takes no arguments',
    );
  });

  it('passes a blank engine, a valid one, and a variant the registry does not list', () => {
    expect(engineArgumentsError(undefined, ENGINES)).toBeUndefined();
    expect(
      engineArgumentsError('CollapsingMergeTree(sign)', ENGINES),
    ).toBeUndefined();
    expect(engineArgumentsError('Log', ENGINES)).toBeUndefined();
  });
});
