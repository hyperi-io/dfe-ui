import { describe, expect, it } from 'vitest';
import type { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import {
  transformHuntDetailToFormData,
  transformHuntFormDataToUpdateRequest,
} from './transformHuntDetailToFormData';

const huntDetail: HuntDetailResponse = {
  hunt_id: 'my_hunt',
  name: 'My Hunt',
  cron: ['0 * * * *', '0 0 * * *'],
  log_buffer: 120,
  global_target_table_name: 'target',
  global_source_table_name: null,
  customers: ['org_a'],
  rules: [
    {
      rule_name: 'rule_one',
      target_table_name: null,
      source: undefined,
      initial_checkpoint_lookback_minutes: null,
    },
  ],
  customer_filters: null,
  checkpoint_timestamp_field: null,
  scheduling_mode: null,
  min_interval_seconds: null,
  explain_queries: null,
};

describe('transformHuntDetailToFormData', () => {
  it('normalizes API hunt detail into strict form values', () => {
    expect(transformHuntDetailToFormData(huntDetail)).toEqual({
      hunt_id: 'my_hunt',
      name: 'My Hunt',
      cron: '0 * * * *',
      log_buffer: 120,
      customers: ['org_a'],
      rules: [
        {
          rule_name: 'rule_one',
          target_table_name: '',
          source: '',
          initial_checkpoint_lookback_minutes: 0,
        },
      ],
    });
  });
});

describe('transformHuntFormDataToUpdateRequest', () => {
  it('merges form edits with unchanged hunt metadata for PUT', () => {
    const formValues = transformHuntDetailToFormData(huntDetail);
    formValues.name = 'Updated Hunt';

    expect(
      transformHuntFormDataToUpdateRequest(formValues, huntDetail),
    ).toEqual({
      name: 'Updated Hunt',
      cron: '0 * * * *',
      log_buffer: 120,
      global_target_table_name: 'target',
      global_source_table_name: null,
      customers: ['org_a'],
      rules: formValues.rules,
      customer_filters: null,
      checkpoint_timestamp_field: null,
      scheduling_mode: null,
      min_interval_seconds: null,
      explain_queries: null,
    });
  });
});
