import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { GitOpsLogsCard } from './GitOpsLogsCard';

const ENTRY = {
  sha: 'a1b2c3d4e5f607890abcdef1234567890abcd0',
  timestamp: 1790516564,
  ctype: 'fix',
  scope: 'governance',
  summary: 'admin: set the gitops auto-merge flag',
  actor: 'admin',
  role: 'admin',
  action: 'update',
  request_id: 'req-0f3a9c',
  files: ['accounts/admin', 'governance/settings/gitops.yaml'],
  resources: ['accounts/admin', 'governance_settings/gitops'],
  conforming: true,
  state: 'applied',
};

const valueOf = (label: string) =>
  screen.getByText(label, { selector: 'dt' }).nextElementSibling as HTMLElement;

describe('GitOpsLogsCard', () => {
  const originalTz = process.env.TZ;
  beforeEach(() => {
    process.env.TZ = 'Australia/Sydney';
  });
  afterEach(() => {
    if (originalTz === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTz;
    }
  });

  test('labels every field and shows the time as a local date and time', () => {
    render(<GitOpsLogsCard dataItem={ENTRY} />);

    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(
      [
        'Summary',
        'Time',
        'Actor',
        'Role',
        'Action',
        'Type',
        'Scope',
        'State',
        'Commit',
        'Request ID',
        'Conforming',
        'Files',
        'Resources',
      ],
    );
    expect(valueOf('Time')).toHaveTextContent('27 Sep 2026, 23:42:44');
    expect(valueOf('Commit')).toHaveTextContent(ENTRY.sha);
    expect(valueOf('Request ID')).toHaveTextContent('req-0f3a9c');
  });

  test('lists show one item per line, so two paths never read as one', () => {
    render(<GitOpsLogsCard dataItem={ENTRY} />);

    expect(
      within(valueOf('Files'))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['accounts/admin', 'governance/settings/gitops.yaml']);
    expect(
      within(valueOf('Resources'))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['accounts/admin', 'governance_settings/gitops']);
  });

  test.each([
    { conforming: true, shown: 'Yes' },
    { conforming: false, shown: 'No' },
  ])('conforming $conforming reads $shown', ({ conforming, shown }) => {
    render(<GitOpsLogsCard dataItem={{ ...ENTRY, conforming }} />);

    expect(valueOf('Conforming')).toHaveTextContent(shown);
  });

  test('an empty list or an empty field reads None rather than a blank', () => {
    render(
      <GitOpsLogsCard
        dataItem={{ ...ENTRY, files: [], resources: [], request_id: '' }}
      />,
    );

    expect(valueOf('Files')).toHaveTextContent('None');
    expect(valueOf('Resources')).toHaveTextContent('None');
    expect(valueOf('Request ID')).toHaveTextContent('None');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
