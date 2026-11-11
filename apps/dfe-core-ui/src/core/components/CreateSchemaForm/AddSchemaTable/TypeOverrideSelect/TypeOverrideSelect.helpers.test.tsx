import { SCHEMA_VOCABULARY_FIXTURE } from '@/core/hooks/useFetchSchemaVocabulary/vocabulary.fixture';
import { describe, expect, test } from 'vitest';
import {
  getInitialAdvancedOptions,
  getInitialOverrideType,
  transformOverride,
  validateOverride,
} from './TypeOverrideSelect.helpers';

const options = SCHEMA_VOCABULARY_FIXTURE.ch_overrides;

describe('validateOverride', () => {
  test('returns null when override is null or empty', () => {
    expect(validateOverride(null, {}, options)).toBeNull();
    expect(validateOverride('', {}, options)).toBeNull();
  });

  test('returns null for overrides that need no params', () => {
    expect(validateOverride('Int64', {}, options)).toBeNull();
    expect(validateOverride('IPv4', {}, options)).toBeNull();
  });

  test('requires precision and scale for Decimal', () => {
    expect(validateOverride('Decimal', {}, options)).toBe(
      'Precision and scale required',
    );
    expect(validateOverride('Decimal', { precision: 10 }, options)).toBe(
      'Scale required',
    );
    expect(validateOverride('Decimal', { scale: 2 }, options)).toBe(
      'Precision required',
    );
    expect(
      validateOverride('Decimal', { precision: 10, scale: 2 }, options),
    ).toBeNull();
  });

  test('requires scale for Decimal64', () => {
    expect(validateOverride('Decimal64', {}, options)).toBe('Scale required');
    expect(validateOverride('Decimal64', { scale: 4 }, options)).toBeNull();
  });

  test('requires precision for DateTime64', () => {
    expect(validateOverride('DateTime64', {}, options)).toBe(
      'Precision required',
    );
    expect(
      validateOverride('DateTime64', { precision: 3 }, options),
    ).toBeNull();
  });

  test('requires length for FixedString', () => {
    expect(validateOverride('FixedString', {}, options)).toBe(
      'Length required',
    );
    expect(validateOverride('FixedString', { length: 16 }, options)).toBeNull();
  });

  test('requires values for Enum16', () => {
    expect(validateOverride('Enum16', {}, options)).toBe('Values required');
    expect(
      validateOverride('Enum16', { values: "'a' = 1, 'b' = 2" }, options),
    ).toBeNull();
  });
});

describe('transformOverride', () => {
  test('returns null when override type is null or empty', () => {
    expect(transformOverride(null, {}, options)).toBeNull();
    expect(transformOverride('', {}, options)).toBeNull();
  });

  test('returns the override type when no transformFunction exists', () => {
    expect(transformOverride('Int64', {}, options)).toBe('Int64');
  });

  test('returns null for unknown override types', () => {
    expect(transformOverride('NotARealType', {}, options)).toBeNull();
  });

  test('applies Decimal transform', () => {
    expect(
      transformOverride('Decimal', { precision: 10, scale: 2 }, options),
    ).toBe('Decimal(10,2)');
  });

  test('applies Decimal64 transform', () => {
    expect(transformOverride('Decimal64', { scale: 4 }, options)).toBe(
      'Decimal64(4)',
    );
  });

  test('applies FixedString transform', () => {
    expect(transformOverride('FixedString', { length: 32 }, options)).toBe(
      'FixedString(32)',
    );
  });

  test('applies DateTime64 transform', () => {
    expect(transformOverride('DateTime64', { precision: 3 }, options)).toBe(
      "DateTime64(3,'UTC')",
    );
  });

  test('applies Enum16 transform', () => {
    expect(
      transformOverride('Enum16', { values: "'ok' = 1, 'err' = 2" }, options),
    ).toBe("Enum16('ok' = 1, 'err' = 2)");
  });
});

describe('getInitialOverrideType', () => {
  test('returns null for null or empty values', () => {
    expect(getInitialOverrideType(null, options)).toBeNull();
    expect(getInitialOverrideType('', options)).toBeNull();
  });

  test('returns the bare type when there are no params', () => {
    expect(getInitialOverrideType('Int64', options)).toBe('Int64');
  });

  test('strips parenthetical params', () => {
    expect(getInitialOverrideType('Decimal(10, 2)', options)).toBe('Decimal');
    expect(getInitialOverrideType('Decimal64(4)', options)).toBe('Decimal64');
    expect(getInitialOverrideType("DateTime64(3, 'UTC')", options)).toBe(
      'DateTime64',
    );
    expect(getInitialOverrideType('FixedString(16)', options)).toBe(
      'FixedString',
    );
  });

  test('trims whitespace around the type name', () => {
    expect(getInitialOverrideType('  Decimal64 (4)', options)).toBe(
      'Decimal64',
    );
  });
});

describe('an override with arguments and a bare one', () => {
  test('a stored value that is an option whole keeps its type', () => {
    const withWhole = [
      ...options,
      {
        value: 'Array(String)',
        label: 'Array of String',
        primitive: 'json',
        parameters: [],
        template: null,
        hint: '',
      },
    ];

    expect(getInitialOverrideType('Array(String)', withWhole)).toBe(
      'Array(String)',
    );
    expect(getInitialOverrideType('Decimal(10, 2)', withWhole)).toBe('Decimal');
  });
});

describe('getInitialAdvancedOptions', () => {
  test('returns empty object for null or empty values', () => {
    expect(getInitialAdvancedOptions(null, options)).toEqual({});
    expect(getInitialAdvancedOptions('', options)).toEqual({});
  });

  test('returns empty object for overrides without params', () => {
    expect(getInitialAdvancedOptions('Int64', options)).toEqual({});
  });

  test('parses Decimal precision and scale', () => {
    expect(getInitialAdvancedOptions('Decimal(18, 4)', options)).toEqual({
      precision: 18,
      scale: 4,
    });
  });

  test('parses Decimal64 scale', () => {
    expect(getInitialAdvancedOptions('Decimal64(6)', options)).toEqual({
      scale: 6,
    });
  });

  test('parses DateTime64 precision from the first arg', () => {
    expect(getInitialAdvancedOptions("DateTime64(3, 'UTC')", options)).toEqual({
      precision: 3,
    });
  });

  test('parses FixedString length', () => {
    expect(getInitialAdvancedOptions('FixedString(64)', options)).toEqual({
      length: 64,
    });
  });

  test('parses Enum16 values string', () => {
    expect(
      getInitialAdvancedOptions("Enum16('a' = 1, 'b' = 2)", options),
    ).toEqual({
      values: "'a' = 1, 'b' = 2",
    });
  });

  test('defaults missing numeric params to 0', () => {
    expect(getInitialAdvancedOptions('Decimal()', options)).toEqual({
      precision: 0,
      scale: 0,
    });
    expect(getInitialAdvancedOptions('FixedString()', options)).toEqual({
      length: 0,
    });
  });
});
