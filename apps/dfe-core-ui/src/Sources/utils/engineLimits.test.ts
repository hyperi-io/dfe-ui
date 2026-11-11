import {
  CREDENTIAL_REFERENCE_PREFIXES,
  MATCH_NESTING_LIMIT,
  MATCH_OPERATORS,
} from '@repo/dfe-engine-types/limits';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

import { matchDepth, TMatchFormNode } from './sourceMatch';

// vitest runs from apps/dfe-core-ui.
const spec = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      '../../packages/dfe-engine-types/specs/openapi.json',
    ),
    'utf8',
  ),
);
const { SourceMatch, SourceExternal, SourceTransform } =
  spec.components.schemas;

/** What the engine publishes in its OpenAPI is what the form holds a source to. */
describe('the limits the form reads from the engine', () => {
  test('the match nesting limit is the one the engine publishes', () => {
    expect(MATCH_NESTING_LIMIT).toBe(SourceMatch['x-dfe-max-nesting']);
  });

  test('the operators offered are the engine enum less the ones it reserves', () => {
    const operator = SourceMatch.properties.operator;
    const published: string[] = operator.anyOf.find(
      (branch: { enum?: string[] }) => branch.enum,
    ).enum;
    const reserved: string[] = operator['x-dfe-reserved-values'];

    expect([...MATCH_OPERATORS]).toStrictEqual(
      published.filter((value) => !reserved.includes(value)),
    );
    expect(MATCH_OPERATORS).not.toContain('always');
  });

  test.each([SourceExternal, SourceTransform])(
    "the credential reference prefixes are the engine's on %#",
    (schema) => {
      expect([...CREDENTIAL_REFERENCE_PREFIXES]).toStrictEqual(
        schema.properties.credential_ref['x-dfe-reference-prefixes'],
      );
    },
  );

  test('a group nested one deeper than the limit is over it', () => {
    let node: TMatchFormNode = { field: 'a', operator: 'exists' };
    for (let level = 0; level <= MATCH_NESTING_LIMIT; level += 1) {
      node = { join: 'all', parts: [node] };
    }
    expect(matchDepth(node)).toBe(MATCH_NESTING_LIMIT + 1);
  });
});
