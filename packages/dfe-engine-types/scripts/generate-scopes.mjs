// Writes scopes/index.ts from the RbacScope enum in specs/openapi.json.
// The enum's x-enumNames give the constant names, its values the scope strings.
import { readFileSync, writeFileSync } from 'node:fs';

const spec = JSON.parse(readFileSync('specs/openapi.json', 'utf8'));
const { enum: values, 'x-enumNames': names } = spec.components.schemas.RbacScope;

if (names?.length !== values.length) {
  throw new Error('RbacScope: x-enumNames and enum differ in length');
}

const entries = values.map((value, i) => `  ${names[i]}: '${value}',`);
writeFileSync(
  'scopes/index.ts',
  [
    '// Generated from the RbacScope enum in specs/openapi.json. Do not edit.',
    '',
    'export const scopes = {',
    ...entries,
    '} as const;',
    '',
    'export type RbacScope = (typeof scopes)[keyof typeof scopes];',
    '',
  ].join('\n'),
);
