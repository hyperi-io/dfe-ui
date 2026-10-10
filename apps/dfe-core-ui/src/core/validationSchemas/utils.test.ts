import { describe, expect, test } from 'vitest';
import {
  APP_FILENAME_VALIDATOR,
  DESTINATION_NAME_VALIDATOR,
  FIELD_MAP_STANDARD_VALIDATOR,
  GITOPS_NAME_VALIDATOR,
  LIBRARY_TOKEN_VALIDATOR,
  ORG_NAME_VALIDATOR,
  RULE_HUNT_NAME_VALIDATOR,
  STORE_NAME_VALIDATOR,
} from './utils';

type Validator = { regex: RegExp; message: (fieldName?: string) => string };

const check = (
  validator: Validator,
  accepts: string[],
  refuses: string[],
): void => {
  test.each(accepts)('accepts %j', (value) => {
    expect(validator.regex.test(value)).toBe(true);
  });
  test.each(refuses)('refuses %j', (value) => {
    expect(validator.regex.test(value)).toBe(false);
  });
};

describe('STORE_NAME_VALIDATOR (auth/store_names.py VALID_NAME)', () => {
  check(
    STORE_NAME_VALIDATOR,
    ['a', '0', 'google-workspace', 'okta.prod', 'a_b', 'a'.repeat(128)],
    ['', '-a', '.a', '_a', 'a b', 'a/b', 'a'.repeat(129), 'a\n'],
  );
});

describe('ORG_NAME_VALIDATOR (orgs/models.py ORG_NAME_PATTERN)', () => {
  check(
    ORG_NAME_VALIDATOR,
    ['a', 'Acme', 'acme-corp', 'acme.eu', 'acme_1', 'a'.repeat(129)],
    ['', '-acme', '.acme', '_acme', 'acme corp', 'acme/eu', 'acme\n'],
  );
});

describe('RULE_HUNT_NAME_VALIDATOR (api/v1/rules.py, api/v1/hunts.py)', () => {
  check(
    RULE_HUNT_NAME_VALIDATOR,
    ['a', 'Rule1', 'brute-force', 'brute_force', '-leading', '_leading', '1'],
    ['', 'a.b', 'a b', 'a/b', 'a\n'],
  );
});

describe('GITOPS_NAME_VALIDATOR (gitcrud/commit_policy.py validate_name)', () => {
  check(
    GITOPS_NAME_VALIDATOR,
    ['a', 'syslog-parse', 'v1.2', '.hidden', '-a', 'a_b', 'a'.repeat(300)],
    ['', 'a b', 'a/b', '..', 'a..b', 'a\n'],
  );
});

describe('LIBRARY_TOKEN_VALIDATOR (appmgmt/library.py validate_token)', () => {
  check(
    LIBRARY_TOKEN_VALIDATOR,
    ['a', 'network', 'network/edge', 'v1.2', 'a_b-c', 'stable'],
    ['', '-a', '.a', '/a', 'a b', 'a\n'],
  );
});

describe('APP_FILENAME_VALIDATOR (appmgmt/files.py validate_filename)', () => {
  check(
    APP_FILENAME_VALIDATOR,
    ['a.vrl', 'my-file.vrl', 'my_file.v1.vrl', '1.json'],
    ['', '-a.vrl', '.a.vrl', 'a b.vrl', 'dir/a.vrl', 'a..vrl', '../a.vrl'],
  );
});

describe('DESTINATION_NAME_VALIDATOR (hunts/alert.py is_destination_name)', () => {
  check(
    DESTINATION_NAME_VALIDATOR,
    ['slack-dfe-alerts', 'a b', '.hidden', '...', 'a.b', '-a'],
    ['', '.', '..', 'a/b', 'a\\b', 'a\0b'],
  );
});

describe('FIELD_MAP_STANDARD_VALIDATOR (fieldmap/models.py)', () => {
  check(
    FIELD_MAP_STANDARD_VALIDATOR,
    ['sigma', 'ecs', 'OCSF', 'my_standard', 's1'],
    ['', '1s', '_s', 'my-standard', 'my standard', 's.1'],
  );
});

describe('messages', () => {
  test.each([
    ['store', STORE_NAME_VALIDATOR],
    ['org', ORG_NAME_VALIDATOR],
    ['rule and hunt', RULE_HUNT_NAME_VALIDATOR],
    ['gitops', GITOPS_NAME_VALIDATOR],
    ['library token', LIBRARY_TOKEN_VALIDATOR],
    ['app filename', APP_FILENAME_VALIDATOR],
    ['destination', DESTINATION_NAME_VALIDATOR],
    ['field map standard', FIELD_MAP_STANDARD_VALIDATOR],
  ])('%s message names the field', (_label, validator: Validator) => {
    expect(validator.message('Widget')).toMatch(/^Widget /);
  });
});
