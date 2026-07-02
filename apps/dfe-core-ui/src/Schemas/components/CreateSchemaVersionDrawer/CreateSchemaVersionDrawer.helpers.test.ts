import { describe, expect, test } from 'vitest';
import { metaSchemaDetailToCreateVersionFormInitialValues } from './CreateSchemaVersionDrawer.helpers';

describe('metaSchemaDetailToCreateVersionFormInitialValues', () => {
  test('maps version metadata and columns into form defaults', () => {
    const result = metaSchemaDetailToCreateVersionFormInitialValues(
      {
        resource_type: 'custom',
        current: '1.0.0',
        selected: '1.0.0',
        path: 'aws/cloudtrail',
        versions: ['1.0.0'],
        version: {
          date: '2024-01-01',
          type: 'model',
          summary: 'CloudTrail schema',
          columns: {
            items: [
              {
                name: 'event_id',
                type: 'String',
                _field_type: 'base',
                attribute: ['event_id'],
                use_case: 'event_id',
                expr: 'event_id',
                comment: 'event_id',
                _matched_searchable: ['event_id'],
              },
            ],
            total: 1,
            page: 1,
            per_page: 50,
            next_page: null,
            total_pages: 1,
            prev_page: null,
          },
        },
      },
      { path: 'aws', name: 'cloudtrail' },
    );

    expect(result.path).toBe('aws');
    expect(result.name).toBe('cloudtrail');
    expect(result.type).toBe('model');
    expect(result.description).toBe('CloudTrail schema');
    expect(result.schemaColumns).toHaveLength(1);
    expect(result.schemaColumns?.[0]).toMatchObject({
      name: 'event_id',
      type: 'String',
      _field_type: 'base',
    });
    expect(result.schemaColumns?.[0]?.id).toBeTruthy();
  });
});
