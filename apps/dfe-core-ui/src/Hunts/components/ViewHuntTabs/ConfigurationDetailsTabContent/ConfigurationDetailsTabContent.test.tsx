import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfigurationDetailsTabContent } from '.';

const hunt = (cron: THuntDetailResponse['cron']): THuntDetailResponse => ({
  name: 'my_hunt',
  display_name: 'My Hunt',
  cron,
  log_buffer: 60,
  global_target_table_name: null,
  global_source_table_name: 'windows_audit',
  customers: ['org_a'],
  rules: [],
  customer_tenant_ids: {},
  checkpoint_timestamp_field: null,
  scheduling_mode: null,
  min_interval_seconds: null,
  explain_queries: null,
});

describe('ConfigurationDetailsTabContent cron', () => {
  it.each([
    { case: 'a single expression', cron: '0 * * * *', shown: '0 * * * *' },
    {
      case: 'every expression of a list, apart',
      cron: ['0 * * * *', '0 0 * * *'],
      shown: '0 * * * *, 0 0 * * *',
    },
  ])('shows $case', ({ cron, shown }) => {
    render(<ConfigurationDetailsTabContent {...hunt(cron)} />);

    expect(screen.getByText(shown)).toBeInTheDocument();
  });

  it('shows None when the hunt has no expression', () => {
    render(<ConfigurationDetailsTabContent {...hunt([])} />);

    expect(screen.getAllByText('None').length).toBeGreaterThan(0);
  });
});
