import { CreateUpdateHuntFormData } from '@/Hunts/components/CreateUpdateHuntForm';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { THuntUpdateRequest } from '@/Hunts/hooks/useUpdateHunt/types';
import { describe, expect, it } from 'vitest';
import {
  transformHuntDetailToFormData,
  transformHuntFormDataToUpdateRequest,
} from './transformHuntDetailToFormData';

const huntDetail: THuntDetailResponse = {
  display_name: 'My Hunt',
  name: 'my_hunt',
  cron: ['0 * * * *', '0 0 * * *'],
  log_buffer: 120,
  global_target_table_name: 'target',
  global_source_table_name: null,
  customers: ['org_a'],
  rules: [
    {
      rule_name: 'rule_one',
      target_table_name: '',
      source: '',
      initial_checkpoint_lookback_minutes: 0,
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
    const expectedFormData: CreateUpdateHuntFormData = {
      name: 'my_hunt',
      display_name: 'My Hunt',
      cron: '0 * * * *',
      log_buffer: 120,
      customers: ['org_a'],
      rules: ['rule_one'],
    };
    expect(transformHuntDetailToFormData(huntDetail)).toEqual(expectedFormData);
  });
});

describe('transformHuntFormDataToUpdateRequest', () => {
  it('merges form edits with unchanged hunt metadata for PUT', () => {
    const formValues = transformHuntDetailToFormData(huntDetail);
    formValues.name = 'Updated Hunt';

    const expectedRequest: THuntUpdateRequest = {
      display_name: 'My Hunt',
      cron: '0 * * * *',
      log_buffer: 120,
      global_target_table_name: 'target',
      global_source_table_name: null,
      customers: ['org_a'],
      rules: ['rule_one'],
      customer_filters: null,
      checkpoint_timestamp_field: null,
      scheduling_mode: null,
      min_interval_seconds: null,
      explain_queries: null,
    };

    expect(
      transformHuntFormDataToUpdateRequest(formValues, huntDetail),
    ).toEqual(expectedRequest);
  });
});
