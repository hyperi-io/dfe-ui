import type { CreateUpdateHuntFormData } from '@/Hunts/components/CreateUpdateHuntForm';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import type { THuntUpdateRequest } from '@/Hunts/hooks/useUpdateHunt/types';

const normalizeCron = (cron: THuntDetailResponse['cron']): string => {
  if (Array.isArray(cron)) {
    return cron[0] ?? '';
  }
  return cron ?? '';
};

export const transformHuntDetailToFormData = (
  hunt: THuntDetailResponse,
): CreateUpdateHuntFormData => ({
  display_name: hunt.display_name,
  name: hunt.name,
  customers: hunt.customers,
  cron: normalizeCron(hunt.cron),
  log_buffer: hunt.log_buffer ?? 60,
  rules: hunt.rules.map((rule) => rule.rule_name),
  global_target_table_name: hunt.global_target_table_name ?? '',
  global_source_table_name: hunt.global_source_table_name ?? '',
});

export const transformHuntFormDataToUpdateRequest = (
  values: CreateUpdateHuntFormData,
  hunt: THuntDetailResponse,
): THuntUpdateRequest => ({
  display_name: values.display_name ?? null,
  cron: values.cron,
  log_buffer: values.log_buffer,
  global_target_table_name: hunt.global_target_table_name,
  global_source_table_name: hunt.global_source_table_name ?? null,
  customers: values.customers,
  rules: values.rules,
  customer_filters: hunt.customer_filters ?? null,
  checkpoint_timestamp_field: hunt.checkpoint_timestamp_field ?? null,
  scheduling_mode: hunt.scheduling_mode ?? null,
  min_interval_seconds: hunt.min_interval_seconds ?? null,
  explain_queries: hunt.explain_queries ?? null,
});
