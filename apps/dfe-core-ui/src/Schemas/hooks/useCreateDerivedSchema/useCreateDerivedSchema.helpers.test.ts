import {
  derivedSchemaPath,
  transformFormDataToRequestBody,
  versionDate,
} from '@/Schemas/hooks/useCreateDerivedSchema/useCreateDerivedSchema.helpers';
import { describe, expect, it } from 'vitest';

const formData = {
  name: 'filebeat_auth',
  path: 'beats',
  version: '1.0.0',
  description: 'system.auth subset',
  base: 'meta/beats/filebeat',
  base_version: '1.0.0',
  select: [
    { name: 'timestamp' },
    { name: 'user_name', index: 'exact_match' as const },
  ],
};

describe('derivedSchemaPath', () => {
  it('files the schema under the derived segment', () => {
    expect(derivedSchemaPath({ name: 'filebeat_auth', path: 'beats' })).toBe(
      'derived/beats/filebeat_auth',
    );
  });

  it('handles a schema with no group', () => {
    expect(derivedSchemaPath({ name: 'filebeat_auth' })).toBe(
      'derived/filebeat_auth',
    );
  });
});

describe('versionDate', () => {
  it('writes the date alone, not a timestamp', () => {
    expect(versionDate(new Date('2026-09-21T04:35:12.000Z'))).toBe(
      '2026-09-21',
    );
  });
});

describe('transformFormDataToRequestBody', () => {
  it('builds the derived schema body from the form', () => {
    expect(
      transformFormDataToRequestBody(
        formData,
        new Date('2026-09-21T04:35:12.000Z'),
      ),
    ).toEqual({
      path: 'derived/beats/filebeat_auth',
      base: 'meta/beats/filebeat',
      base_version: '1.0.0',
      current: '1.0.0',
      versions: {
        '1.0.0': {
          date: '2026-09-21',
          summary: 'system.auth subset',
          select: [
            { name: 'timestamp' },
            { name: 'user_name', index: 'exact_match' },
          ],
        },
      },
    });
  });

  it('carries no columns, because a derived schema only selects', () => {
    const body = transformFormDataToRequestBody(formData);
    expect(body.versions['1.0.0']).not.toHaveProperty('columns');
  });
});
