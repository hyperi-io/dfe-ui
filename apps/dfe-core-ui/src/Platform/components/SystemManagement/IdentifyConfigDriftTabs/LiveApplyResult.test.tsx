import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { LiveApplyResult, TLiveApply } from './LiveApplyResult';

const { wrapper } = buildTestWrapper().withTheme();

const entry = (overrides: Partial<TLiveApply>): TLiveApply => ({
  source: 'firewall',
  status: 'altered',
  table: 'dfe.firewall',
  ttl: null,
  columns_added: [],
  not_applied: [],
  reason: null,
  ...overrides,
});

const rowOf = (source: string) => {
  const cell = screen.getByRole('cell', { name: source });
  const row = cell.closest('tr');
  if (!row) throw new Error(`no row for ${source}`);
  return within(row);
};

describe('LiveApplyResult', () => {
  test.each([
    [
      'an altered table',
      entry({ ttl: '90 -> 91', columns_added: ['_org_id', 'host'] }),
      ['Altered', 'dfe.firewall', '90 -> 91', '_org_id, host'],
    ],
    [
      'an unchanged table',
      entry({ status: 'unchanged' }),
      ['Unchanged', 'dfe.firewall', 'None'],
    ],
    [
      'an engine pin the table did not take',
      entry({
        not_applied: [{ field: 'engine', reason: 'needs a table rebuild' }],
      }),
      ['Engine: needs a table rebuild'],
    ],
    [
      'a source never deployed',
      entry({
        status: 'not_deployed',
        table: null,
        reason: 'no table runs the pinned version',
      }),
      ['Not deployed', 'no table runs the pinned version'],
    ],
    [
      'a refused alter',
      entry({ status: 'failed', reason: 'ClickHouse refused the ALTER' }),
      ['Failed', 'ClickHouse refused the ALTER'],
    ],
  ])('shows %s', (_case, live, texts) => {
    render(<LiveApplyResult live={[live]} />, { wrapper });

    const row = rowOf(live.source);
    for (const text of texts) {
      expect(row.getAllByText(text).length).toBeGreaterThan(0);
    }
  });

  test('lists one row per source in the order given', () => {
    render(
      <LiveApplyResult
        live={[entry({ source: 'b' }), entry({ source: 'a' })]}
      />,
      { wrapper },
    );

    const region = screen.getByRole('region', {
      name: 'What reached each table',
    });
    const sources = within(region)
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelector('td')?.textContent);
    expect(sources).toEqual(['b', 'a']);
  });
});
