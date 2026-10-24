/** @vitest-environment node */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  ORG_NAME_VALIDATOR,
  RULE_HUNT_NAME_VALIDATOR,
  STORE_NAME_VALIDATOR,
} from './utils';

// The engine's sync workflow re-vendors this spec on every API change, so a name rule the console does not carry fails that sync.

const SPEC_PATH = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'packages',
  'dfe-engine-types',
  'specs',
  'openapi.json',
);

type Validator = { regex: RegExp };
type Property = { pattern?: string; maxLength?: number };
type Spec = {
  components: {
    schemas: Record<string, { properties?: Record<string, Property> }>;
  };
};

/** Every request field the engine publishes a name rule for, and the console rule that checks it. */
const CONSOLE_RULES: Record<string, Validator> = {
  'CreateAPIKeyRequest.name': STORE_NAME_VALIDATOR,
  'CreateAccountRequest.username': STORE_NAME_VALIDATOR,
  'CreateGroupRequest.name': STORE_NAME_VALIDATOR,
  'CreateOrgRequest.name': ORG_NAME_VALIDATOR,
  'CreateProviderRequest.name': STORE_NAME_VALIDATOR,
  'CreateRoleRequest.name': STORE_NAME_VALIDATOR,
  'HuntCreateRequest.name': RULE_HUNT_NAME_VALIDATOR,
  'RuleCreateRequest.name': RULE_HUNT_NAME_VALIDATOR,
};

/**
 * Patterned fields the console only ever fills from what the engine listed,
 * never from typing, so there is no input of the console's to check.
 */
const ENGINE_CHOSEN: Record<string, string> = {
  'CompatBinding.profile': 'a profile id from the compat-profiles list',
  'CompatProfile.current': 'a profile document the console never authors',
  'CompatProfileVersion.date': 'a profile document the console never authors',
};

const spec = JSON.parse(readFileSync(SPEC_PATH, 'utf8')) as Spec;

const allPublished = Object.entries(spec.components.schemas).flatMap(
  ([schema, { properties = {} }]) =>
    Object.entries(properties)
      .filter(([, property]) => property.pattern !== undefined)
      .map(([field, property]) => ({
        field: `${schema}.${field}`,
        pattern: property.pattern,
        maxLength: property.maxLength,
      })),
);

const published = allPublished.filter(({ field }) => !(field in ENGINE_CHOSEN));

describe('the console name rules match the engine spec', () => {
  test('every published name rule has a console rule, and no console rule is unpublished', () => {
    expect(published.map(({ field }) => field).sort()).toEqual(
      Object.keys(CONSOLE_RULES).sort(),
    );
  });

  test('every field taken from an engine list is still published', () => {
    const fields = allPublished.map(({ field }) => field);
    expect(
      Object.keys(ENGINE_CHOSEN).filter((f) => !fields.includes(f)),
    ).toEqual([]);
  });

  test.each(published)(
    '$field checks the published pattern',
    ({ field, pattern }) => {
      expect(CONSOLE_RULES[field]?.regex.source).toBe(pattern);
    },
  );

  test.each(published.filter(({ maxLength }) => maxLength !== undefined))(
    '$field takes $maxLength characters and refuses one more',
    ({ field, maxLength = 0 }) => {
      const rule = CONSOLE_RULES[field]?.regex;
      expect(rule?.test('a'.repeat(maxLength))).toBe(true);
      expect(rule?.test('a'.repeat(maxLength + 1))).toBe(false);
      expect(maxLength).toBe(128);
    },
  );
});
