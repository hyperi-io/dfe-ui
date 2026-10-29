import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReconcileChRbacResult } from './ReconcileChRbacResult';

const { wrapper } = buildTestWrapper().withTheme();

const CLEAN = {
  statements: 12,
  dropped: 1,
  minted: ['dfe_loader', 'dfe_receiver'],
  errors: [],
  projection_missing: [],
};

const resultFor = (action: string) => {
  const row = screen.getByRole('cell', { name: action }).closest('tr');
  if (!row) throw new Error(`no row for ${action}`);
  return within(row).getAllByRole('cell')[1];
};

describe('ReconcileChRbacResult', () => {
  it.each([
    {
      case: 'a clean run',
      data: CLEAN,
      heading: 'Reconcile finished with no errors',
      rows: {
        'Apply quota tiers, service roles and row policies':
          '12 statements run',
        'Drop objects no longer configured': '1 dropped',
        'Write service-user secrets': 'dfe_loaderdfe_receiver',
        'Write the governance projection tables': 'Written',
      },
      errors: [],
    },
    {
      case: 'a run that changed nothing',
      data: { ...CLEAN, statements: 0, dropped: 0, minted: [] },
      heading: 'Reconcile finished with no errors',
      rows: {
        'Apply quota tiers, service roles and row policies': 'None',
        'Drop objects no longer configured': 'None',
        'Write service-user secrets': 'None',
      },
      errors: [],
    },
    {
      case: 'a run with errors and missing projection tables',
      data: {
        ...CLEAN,
        errors: ['CREATE ROLE dfe_reader: access denied', 'quota tier x'],
        projection_missing: ['dfe_meta.roles'],
      },
      heading: 'Reconcile finished with 2 errors',
      rows: {
        'Write the governance projection tables':
          'Skipped, these tables are not on the server:dfe_meta.roles',
      },
      errors: ['CREATE ROLE dfe_reader: access denied', 'quota tier x'],
    },
  ])('lays out $case as a table', ({ data, heading, rows, errors }) => {
    render(<ReconcileChRbacResult data={data} />, { wrapper });

    expect(screen.getByText(heading)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Action' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Result' })).toBeVisible();
    for (const [action, result] of Object.entries(rows)) {
      expect(resultFor(action)).toHaveTextContent(result);
    }
    const errorRows = screen.queryAllByRole('cell', { name: 'Error' });
    expect(errorRows).toHaveLength(errors.length);
    errors.forEach((error) =>
      expect(screen.getByText(error)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/"statements"/)).not.toBeInTheDocument();
  });

  it.each([
    { case: 'an older answer shape', data: { required_action: 'x' } },
    {
      case: 'a count that is not a number',
      data: { ...CLEAN, statements: 'x' },
    },
    { case: 'an empty answer', data: {} },
  ])('shows $case as sent rather than a wrong table', ({ data }) => {
    render(<ReconcileChRbacResult data={data} />, { wrapper });

    expect(screen.getByText('Reconcile finished')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
