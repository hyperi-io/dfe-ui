import { CreateUpdateHuntFormData } from '@/Hunts/components/CreateUpdateHuntForm';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { THuntUpdateRequest } from '@/Hunts/hooks/useUpdateHunt/types';
import { describe, expect, it } from 'vitest';
import {
  transformHuntDetailToFormData,
  transformHuntFormDataToCreateRequest,
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
      global_target_table_name: 'target',
      global_source_table_name: '',
    };
    expect(transformHuntDetailToFormData(huntDetail)).toEqual(expectedFormData);
  });
});

describe('transformHuntFormDataToUpdateRequest', () => {
  it('merges form edits with unchanged hunt metadata for PUT', () => {
    const formValues = transformHuntDetailToFormData(huntDetail);
    formValues.name = 'Updated Hunt';
    formValues.global_source_table_name = 'windows_audit';

    const expectedRequest: THuntUpdateRequest = {
      display_name: 'My Hunt',
      cron: '0 * * * *',
      log_buffer: 120,
      global_target_table_name: 'target',
      global_source_table_name: 'windows_audit',
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

  it('sends the tables as edited in the form', () => {
    const formValues = transformHuntDetailToFormData(huntDetail);
    formValues.global_source_table_name = 'dns_audit';
    formValues.global_target_table_name = 'dns_alerts';

    const request = transformHuntFormDataToUpdateRequest(
      formValues,
      huntDetail,
    );

    expect(request.global_source_table_name).toBe('dns_audit');
    expect(request.global_target_table_name).toBe('dns_alerts');
  });

  it.each(['', '   ', null, undefined])(
    'sends no target table key when the form value is %j',
    (blank) => {
      const formValues = transformHuntDetailToFormData(huntDetail);
      formValues.global_target_table_name = blank;

      const request = transformHuntFormDataToUpdateRequest(
        formValues,
        huntDetail,
      );

      expect(request).not.toHaveProperty('global_target_table_name');
    },
  );
});

describe('transformHuntFormDataToCreateRequest', () => {
  const formValues: CreateUpdateHuntFormData = {
    name: 'my_hunt',
    display_name: 'My Hunt',
    cron: '*/15 * * * *',
    log_buffer: 60,
    customers: ['org_a'],
    rules: ['rule_one'],
    global_source_table_name: 'windows_audit',
    global_target_table_name: 'alerts',
  };

  it('sends the form as it is when both tables are filled', () => {
    expect(transformHuntFormDataToCreateRequest(formValues)).toEqual(
      formValues,
    );
  });

  it.each(['', '   ', null, undefined])(
    'sends no target table key when the form value is %j',
    (blank) => {
      const request = transformHuntFormDataToCreateRequest({
        ...formValues,
        global_target_table_name: blank,
      });

      expect(request).not.toHaveProperty('global_target_table_name');
      expect(request).toMatchObject({
        name: 'my_hunt',
        global_source_table_name: 'windows_audit',
      });
    },
  );
});
