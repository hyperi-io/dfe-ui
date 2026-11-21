import type { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RuleDetailFields } from './RuleDetailFields';

const rule: TRuleDetail = {
  name: 'demo-asa-logon-failed',
  display_name: 'Failed logon on a Cisco ASA',
  severity: 'medium',
  source: 'cisco-asa',
  source_db: 'dfe',
  source_table: 'cisco-asa',
  where_clause: "event_action = 'logon-failed'",
  cel_filter: null,
  original_sql:
    "SELECT * FROM dfe.`cisco-asa` WHERE event_action = 'logon-failed'",
  hunt_name: null,
  created_at: '2026-01-01T00:00:00Z',
};

const valueOf = (term: string) =>
  screen.getByText(term).nextElementSibling as HTMLElement;

describe('RuleDetailFields', () => {
  it.each(['Hunt Name:', 'CEL Filter:'])(
    'shows a dash for %s when the rule leaves it out, never the word None',
    (term) => {
      render(<RuleDetailFields rule={rule} />);

      expect(
        within(valueOf(term)).getByRole('img', { name: 'No value' }),
      ).toHaveTextContent('\u2014');
      expect(screen.queryByText('None')).not.toBeInTheDocument();
    },
  );

  it('shows the value of a field the rule sets', () => {
    render(<RuleDetailFields rule={{ ...rule, hunt_name: 'windows_audit' }} />);

    expect(valueOf('Hunt Name:')).toHaveTextContent('windows_audit');
    expect(valueOf('Where Clause:')).toHaveTextContent(
      "event_action = 'logon-failed'",
    );
  });

  it('shows a dash for an empty string as well as for null', () => {
    render(<RuleDetailFields rule={{ ...rule, where_clause: '' }} />);

    expect(
      within(valueOf('Where Clause:')).getByRole('img', { name: 'No value' }),
    ).toBeInTheDocument();
  });
});
