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
  customer_tenant_ids: { org_a: ['org-a-1'] },
  checkpoint_timestamp_field: null,
  scheduling_mode: null,
  min_interval_seconds: null,
  explain_queries: null,
  enabled: true,
};

describe('transformHuntDetailToFormData', () => {
  it('normalizes API hunt detail into strict form values', () => {
    const expectedFormData: CreateUpdateHuntFormData = {
      name: 'my_hunt',
      display_name: 'My Hunt',
      cron: ['0 * * * *', '0 0 * * *'],
      log_buffer: 120,
      customers: ['org_a'],
      rules: ['rule_one'],
      global_target_table_name: 'target',
      global_source_table_name: '',
      enabled: true,
    };
    expect(transformHuntDetailToFormData(huntDetail)).toEqual(expectedFormData);
  });

  it.each([
    { case: 'enabled', stored: true, shown: true },
    { case: 'disabled', stored: false, shown: false },
    { case: 'storing no state, as enabled', stored: undefined, shown: true },
  ])('opens a hunt $case with the switch $shown', ({ stored, shown }) => {
    const hunt = { ...huntDetail, enabled: stored } as THuntDetailResponse;

    expect(transformHuntDetailToFormData(hunt).enabled).toBe(shown);
  });

  it('opens a stored hunt naming no organisation with none selected', () => {
    const { customers: _customers, ...namingNone } = huntDetail;

    expect(transformHuntDetailToFormData(namingNone).customers).toEqual([]);
  });
});

describe('transformHuntFormDataToUpdateRequest', () => {
  it('merges form edits with unchanged hunt metadata for PUT', () => {
    const formValues = transformHuntDetailToFormData(huntDetail);
    formValues.name = 'Updated Hunt';
    formValues.global_source_table_name = 'windows_audit';

    const expectedRequest: THuntUpdateRequest = {
      display_name: 'My Hunt',
      cron: ['0 * * * *', '0 0 * * *'],
      log_buffer: 120,
      global_target_table_name: 'target',
      global_source_table_name: 'windows_audit',
      customers: ['org_a'],
      rules: ['rule_one'],
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

  it.each([
    {
      case: 'sends the list when the hunt keeps several expressions',
      stored: ['0 * * * *', '0 0 * * *'],
      form: ['0 * * * *', '0 0 * * *'],
      sent: ['0 * * * *', '0 0 * * *'],
    },
    {
      case: 'sends what the form holds when an expression is edited',
      stored: ['0 * * * *', '0 0 * * *', '*/5 * * * *'],
      form: ['*/10 * * * *', '0 0 * * *', '*/5 * * * *'],
      sent: ['*/10 * * * *', '0 0 * * *', '*/5 * * * *'],
    },
    {
      case: 'drops an expression the user removed',
      stored: ['0 * * * *', '0 0 * * *'],
      form: ['0 * * * *'],
      sent: '0 * * * *',
    },
    {
      case: 'sends a plain string when the hunt stored one',
      stored: '0 * * * *',
      form: ['*/10 * * * *'],
      sent: '*/10 * * * *',
    },
  ])('cron: $case', ({ stored, form, sent }) => {
    const hunt = { ...huntDetail, cron: stored };
    const formValues = { ...transformHuntDetailToFormData(hunt), cron: form };

    expect(transformHuntFormDataToUpdateRequest(formValues, hunt).cron).toEqual(
      sent,
    );
  });

  it.each([
    ['a stored string', '0 * * * *', ['0 * * * *']],
    ['a stored list', ['0 * * * *', '0 0 * * *'], ['0 * * * *', '0 0 * * *']],
    ['no stored expression', undefined, []],
  ])('the form reads %s as a list', (_label, stored, expected) => {
    const hunt = { ...huntDetail, cron: stored } as THuntDetailResponse;

    expect(transformHuntDetailToFormData(hunt).cron).toEqual(expected);
  });

  it.each([
    { case: 'leaves an enabled hunt alone', stored: true, form: true },
    { case: 'leaves a disabled hunt alone', stored: false, form: false },
    {
      case: 'leaves a hunt storing no state alone',
      stored: undefined,
      form: true,
    },
    {
      case: 'names false when an enabled hunt is switched off',
      stored: true,
      form: false,
      sent: false,
    },
    {
      case: 'names true when a disabled hunt is switched on',
      stored: false,
      form: true,
      sent: true,
    },
  ])('enabled: $case', ({ stored, form, sent }) => {
    const hunt = { ...huntDetail, enabled: stored } as THuntDetailResponse;
    const formValues = {
      ...transformHuntDetailToFormData(hunt),
      enabled: form,
    };

    const request = transformHuntFormDataToUpdateRequest(formValues, hunt);

    if (sent === undefined) {
      expect(request).not.toHaveProperty('enabled');
    } else {
      expect(request.enabled).toBe(sent);
    }
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
    cron: ['*/15 * * * *'],
    log_buffer: 60,
    customers: ['org_a'],
    rules: ['rule_one'],
    global_source_table_name: 'windows_audit',
    global_target_table_name: 'alerts',
    enabled: true,
  };

  it('sends the form as it is when both tables are filled', () => {
    expect(transformHuntFormDataToCreateRequest(formValues)).toEqual({
      ...formValues,
      cron: '*/15 * * * *',
    });
  });

  it.each([true, false])(
    'sends enabled: %j as the form holds it',
    (enabled) => {
      expect(
        transformHuntFormDataToCreateRequest({ ...formValues, enabled })
          .enabled,
      ).toBe(enabled);
    },
  );

  it('sends every expression when the form holds several', () => {
    const cron = ['*/15 * * * *', '0 0 * * *'];

    expect(
      transformHuntFormDataToCreateRequest({ ...formValues, cron }).cron,
    ).toEqual(cron);
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
