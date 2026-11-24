import { TRuleCreateResponse } from '@/core/hooks/useCreateRuleV2/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RuleSaveSummary, ruleSaveNotice, ruleSaveWarnings } from '.';

const saved = ({
  warnings,
  display_name = 'Failed logons',
}: {
  warnings?: string[];
  display_name?: string;
} = {}): TRuleCreateResponse => ({
  rule: {
    name: 'failed_logons',
    display_name,
    warnings,
    severity: 'high',
    where_clause: 'event.action == "login"',
    created_at: '2026-01-01T00:00:00Z',
  },
});

describe('ruleSaveNotice', () => {
  it.each([
    {
      name: 'a clean save',
      response: saved({}),
      type: 'success',
      title: 'Rule Failed logons created successfully',
      duration: undefined,
      described: false,
    },
    {
      name: 'a rule with warnings',
      response: saved({ warnings: ['No source table identified'] }),
      type: 'warning',
      title: 'Rule Failed logons created with warnings',
      duration: 0,
      described: true,
    },
    {
      name: 'a rule with no display name',
      response: saved({ display_name: '' }),
      type: 'success',
      title: 'Rule failed_logons created successfully',
      duration: undefined,
      described: false,
    },
  ])(
    'reads $name as $type',
    ({ response, type, title, duration, described }) => {
      const notice = ruleSaveNotice(response, 'created');

      expect(notice.type).toBe(type);
      expect(notice.title).toBe(title);
      expect(notice.duration).toBe(duration);
      expect(!!notice.description).toBe(described);
    },
  );

  it('says updated for an edit', () => {
    expect(ruleSaveNotice(saved({}), 'updated').title).toBe(
      'Rule Failed logons updated successfully',
    );
  });
});

describe('ruleSaveWarnings', () => {
  it.each([
    { name: 'none', response: saved({}), expected: [] },
    {
      name: 'the rule warnings',
      response: saved({ warnings: ['a', 'b'] }),
      expected: ['a', 'b'],
    },
    {
      name: 'each warning once',
      response: saved({ warnings: ['a', 'a'] }),
      expected: ['a'],
    },
  ])('collects $name', ({ response, expected }) => {
    expect(ruleSaveWarnings(response)).toEqual(expected);
  });
});

describe('RuleSaveSummary', () => {
  it('lists the rule warnings', () => {
    render(
      <RuleSaveSummary
        response={saved({ warnings: ['No source table identified'] })}
      />,
    );

    expect(screen.getByText('No source table identified')).toBeInTheDocument();
  });

  it('shows nothing for a clean save', () => {
    const { container } = render(<RuleSaveSummary response={saved({})} />);

    expect(container).toBeEmptyDOMElement();
  });
});
