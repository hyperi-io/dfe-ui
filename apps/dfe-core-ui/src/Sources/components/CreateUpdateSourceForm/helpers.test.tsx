import { describe, expect, test } from 'vitest';
import { getValidationErrors } from './helpers';

const ERROR_FIELDS = [
  {
    name: ['source'],
    errors: ['Source is required'],
    warnings: [],
  },
  {
    name: ['header', 'type'],
    errors: ['Header type is required'],
    warnings: [],
  },
  {
    name: ['header', 'version'],
    errors: ['Header version is required'],
    warnings: [],
  },
  {
    name: ['schema', 'meta_schema'],
    errors: ['Meta schema is required'],
    warnings: [],
  },
  {
    name: ['schema', 'meta_schema_version'],
    errors: ['Meta schema version is required'],
    warnings: [],
  },
  {
    name: ['schema', 'engine'],
    errors: ['Engine is required'],
    warnings: [],
  },
];

const expectedResponse = {
  sourceDetails: ['Source is required'],
  mappingStandards: [],
  sourceType: [],
  schemaConfig: [
    'Header type is required',
    'Header version is required',
    'Meta schema is required',
    'Meta schema version is required',
    'Engine is required',
  ],
  transform: [],
};

const ALL_FIELDS = [
  {
    touched: false,
    validating: false,
    errors: ['Source is required'],
    warnings: [],
    name: ['source'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: [],
    warnings: [],
    name: ['enabled'],
    validated: true,
    value: true,
  },
  {
    touched: false,
    validating: false,
    errors: [],
    warnings: [],
    name: ['display_name'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: [],
    warnings: [],
    name: ['description'],
    validated: true,
  },
  {
    touched: true,
    validating: false,
    errors: [],
    warnings: [],
    name: ['mapping_standards'],
    validated: true,
    value: ['cim/new_source', 'ecs/_default'],
  },
  {
    touched: false,
    validating: false,
    errors: ['Header type is required'],
    warnings: [],
    name: ['header', 'type'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: ['Header version is required'],
    warnings: [],
    name: ['header', 'version'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: ['Meta schema is required'],
    warnings: [],
    name: ['schema', 'meta_schema'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: ['Meta schema version is required'],
    warnings: [],
    name: ['schema', 'meta_schema_version'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: [],
    warnings: [],
    name: ['schema', 'derived_schema'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: [],
    warnings: [],
    name: ['schema', 'additional_fields'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: ['Engine is required'],
    warnings: [],
    name: ['schema', 'engine'],
    validated: true,
  },
  {
    touched: false,
    validating: false,
    errors: [],
    warnings: [],
    name: ['schema', 'ttl_days'],
    validated: true,
  },
];

describe('getValidationErrors', () => {
  test('when formFields are from onFinishFailed it should return the correct validation errors', () => {
    const result = getValidationErrors({ formFields: ERROR_FIELDS });
    expect(result).toEqual(expectedResponse);
  });

  test('when formFields are from onFieldsChange it should return the correct validation errors', () => {
    const result = getValidationErrors({ formFields: ALL_FIELDS });
    expect(result).toEqual(expectedResponse);
  });
});
