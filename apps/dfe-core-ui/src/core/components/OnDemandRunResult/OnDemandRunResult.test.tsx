import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OnDemandRunResult, OnDemandRunResponse } from '.';

const { wrapper } = buildTestWrapper().withTheme();

const ran = (overrides: Partial<OnDemandRunResponse>): OnDemandRunResponse => ({
  source: 'winlog',
  source_db: 'dfe',
  source_table: 'main',
  cost_window_minutes: 60,
  cost_estimate: { band: 'unmeasured', window_minutes: 60 },
  sql_errors: [],
  columns: [],
  results: [],
  execution_time_ms: 3,
  truncated: false,
  ...overrides,
});

const headers = () =>
  screen.getAllByRole('columnheader').map((header) => header.textContent);

describe('OnDemandRunResult', () => {
  it.each([
    {
      columns: ['_timestamp', '_uuid', '_raw', '_json'],
      lead: '_raw',
    },
    { columns: ['_timestamp', '_uuid', '_json'], lead: '_json' },
    { columns: ['_timestamp', 'host'], lead: '_timestamp' },
  ])('puts $lead first of $columns', ({ columns, lead }) => {
    const row = Object.fromEntries(columns.map((column) => [column, column]));
    render(<OnDemandRunResult data={ran({ columns, results: [row] })} />, {
      wrapper,
    });

    expect(headers()[0]).toBe(lead);
    expect(headers()).toHaveLength(columns.length);
  });

  it('says nothing matched when the run worked and found nothing', () => {
    render(<OnDemandRunResult data={ran({})} />, { wrapper });

    expect(
      screen.getByText('No rows matched in this window.'),
    ).toBeInTheDocument();
  });

  it('shows only the SQL error when the run failed', () => {
    render(
      <OnDemandRunResult
        data={ran({ sql_errors: [{ message: 'Code: 47. Unknown column' }] })}
      />,
      { wrapper },
    );

    expect(screen.getByText('Code: 47. Unknown column')).toBeInTheDocument();
    expect(
      screen.queryByText('No rows matched in this window.'),
    ).not.toBeInTheDocument();
  });
});
