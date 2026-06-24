import type { CreateUpdateHuntFormData } from '@/Hunts/components/CreateUpdateHuntForm';
import type { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import type { HuntUpdateRequest } from '@/Hunts/hooks/useUpdateHunt/types';
import type { components } from '@repo/dfe-engine-types';

type HuntRuleEntry = components['schemas']['HuntRuleEntry'];

const normalizeCron = (cron: HuntDetailResponse['cron']): string => {
  if (Array.isArray(cron)) {
    return cron[0] ?? '';
  }
  return cron ?? '';
};

export const mapSelectedRuleIdsToHuntRuleEntries = (
  ruleIds: string[],
  existingRules: HuntDetailResponse['rules'] = [],
): HuntRuleEntry[] =>
  ruleIds.map((ruleId) => {
    const existing = existingRules.find((rule) => rule.rule_name === ruleId);
    if (existing) {
      return {
        rule_name: existing.rule_name,
        target_table_name: existing.target_table_name ?? '',
        source: existing.source ?? '',
        initial_checkpoint_lookback_minutes:
          existing.initial_checkpoint_lookback_minutes ?? 0,
      };
    }
    return {
      rule_name: ruleId,
      target_table_name: '',
      source: '',
      initial_checkpoint_lookback_minutes: 0,
    };
  });

export const transformHuntDetailToFormData = (
  hunt: HuntDetailResponse,
): CreateUpdateHuntFormData => ({
  hunt_id: hunt.hunt_id,
  name: hunt.name,
  customers: hunt.customers,
  cron: normalizeCron(hunt.cron),
  log_buffer: hunt.log_buffer ?? 60,
  rules: hunt.rules.map((rule) => rule.rule_name),
});

export const transformHuntFormDataToUpdateRequest = (
  values: CreateUpdateHuntFormData,
  hunt: HuntDetailResponse,
): HuntUpdateRequest => ({
  name: values.name,
  cron: values.cron,
  log_buffer: values.log_buffer,
  global_target_table_name: hunt.global_target_table_name,
  global_source_table_name: hunt.global_source_table_name ?? null,
  customers: values.customers,
  rules: mapSelectedRuleIdsToHuntRuleEntries(values.rules, hunt.rules),
  customer_filters: hunt.customer_filters ?? null,
  checkpoint_timestamp_field: hunt.checkpoint_timestamp_field ?? null,
  scheduling_mode: hunt.scheduling_mode ?? null,
  min_interval_seconds: hunt.min_interval_seconds ?? null,
  explain_queries: hunt.explain_queries ?? null,
});
