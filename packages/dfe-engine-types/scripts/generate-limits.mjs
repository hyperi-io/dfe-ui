// Writes limits/index.ts from the limits the engine publishes in specs/openapi.json:
// the match nesting depth, the operators a form offers and the credential reference
// prefixes. The engine owns each of them, so the console reads them rather than
// restating them.
import { readFileSync, writeFileSync } from 'node:fs';

const spec = JSON.parse(readFileSync('specs/openapi.json', 'utf8'));
const { schemas } = spec.components;

function required(value, what) {
  if (value === undefined) {
    throw new Error(`specs/openapi.json does not publish ${what}`);
  }
  return value;
}

const match = schemas.SourceMatch;
const nesting = required(match['x-dfe-max-nesting'], 'SourceMatch x-dfe-max-nesting');
if (!Number.isInteger(nesting) || nesting < 1) {
  throw new Error(`SourceMatch x-dfe-max-nesting is ${nesting}, not a positive integer`);
}

const operator = match.properties.operator;
const operators = required(
  operator.anyOf.find((branch) => branch.enum)?.enum,
  'the SourceMatch operator enum',
);
const reserved = required(
  operator['x-dfe-reserved-values'],
  'SourceMatch operator x-dfe-reserved-values',
);
const offered = operators.filter((value) => !reserved.includes(value));

// An origin and a transform each carry the pipeline's credential reference.
const prefixes = ['SourceExternal', 'SourceTransform'].map((name) =>
  required(
    schemas[name].properties.credential_ref['x-dfe-reference-prefixes'],
    `${name} credential_ref x-dfe-reference-prefixes`,
  ),
);
if (JSON.stringify(prefixes[0]) !== JSON.stringify(prefixes[1])) {
  throw new Error('SourceExternal and SourceTransform publish different credential prefixes');
}

const list = (values) => values.map((value) => `  '${value}',`);

writeFileSync(
  'limits/index.ts',
  [
    '// Generated from the limits the engine publishes in specs/openapi.json. Do not edit.',
    '',
    '/** How deep all and any groups may nest in one match. */',
    `export const MATCH_NESTING_LIMIT = ${nesting};`,
    '',
    '/** The operators a source form offers: the engine\'s, less the ones it reserves. */',
    'export const MATCH_OPERATORS = [',
    ...list(offered),
    '] as const;',
    '',
    '/** What a pipeline credential reference starts with, which is where it is kept. */',
    'export const CREDENTIAL_REFERENCE_PREFIXES = [',
    ...list(prefixes[0]),
    '] as const;',
    '',
  ].join('\n'),
);
