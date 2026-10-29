import { TRuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RuleSaveSummary, ruleSaveNotice, ruleSaveWarnings } from '.';

type TEstimate = NonNullable<TRuleCreateResponse['cost_estimate']>;

const saved = ({
  warnings,
  estimate,
  display_name = 'Failed logons',
}: {
  warnings?: string[];
  estimate?: TEstimate | null;
  display_name?: string | null;
}): TRuleCreateResponse =>
  ({
    rule: {
      name: 'failed_logons',
      display_name,
      warnings,
    },
    cost_estimate: estimate,
  }) as TRuleCreateResponse;

const measured: TEstimate = {
  estimated_rows: 1234,
  rows_in_window: 50000,
  projected_per_day: 29616,
  match_ratio: 0.02468,
  band: 'warn',
  window_minutes: 60,
  warnings: ['Matches 2.47% of events, expect a busy alert queue'],
};

const unmeasured: TEstimate = {
  band: 'unmeasured',
  window_minutes: 60,
  warnings: ['Preview timed out, volume not measured'],
};

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
      name: 'an unmeasured preview with the guard off',
      response: saved({ estimate: unmeasured }),
      type: 'warning',
      title: 'Rule Failed logons created with warnings',
      duration: 0,
      described: true,
    },
    {
      name: 'a measured preview with no warnings',
      response: saved({ estimate: { ...measured, warnings: [] } }),
      type: 'success',
      title: 'Rule Failed logons created successfully',
      duration: undefined,
      described: true,
    },
    {
      name: 'a rule with no display name',
      response: saved({ display_name: null }),
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
      name: 'the rule alone',
      response: saved({ warnings: ['a'] }),
      expected: ['a'],
    },
    {
      name: 'the preview alone, as with the guard off',
      response: saved({ estimate: unmeasured }),
      expected: ['Preview timed out, volume not measured'],
    },
    {
      name: 'each once, as with the guard on',
      response: saved({
        warnings: ['a', 'Preview timed out, volume not measured'],
        estimate: unmeasured,
      }),
      expected: ['a', 'Preview timed out, volume not measured'],
    },
  ])('collects $name', ({ response, expected }) => {
    expect(ruleSaveWarnings(response)).toEqual(expected);
  });
});

describe('RuleSaveSummary', () => {
  it('shows a measured preview in plain figures', () => {
    render(<RuleSaveSummary response={saved({ estimate: measured })} />);

    const preview = screen.getByRole('region', {
      name: 'Alert volume preview',
    });
    expect(preview).toHaveTextContent(
      'Matched1,234 of 50,000 events in the last 60 minutes (2.47%)',
    );
    expect(preview).toHaveTextContent('Projected29,616 a day');
    expect(
      screen.getByText('Matches 2.47% of events, expect a busy alert queue'),
    ).toBeInTheDocument();
  });

  it('says an unfinished preview measured nothing', () => {
    render(<RuleSaveSummary response={saved({ estimate: unmeasured })} />);

    const preview = screen.getByRole('region', {
      name: 'Alert volume preview',
    });
    expect(preview).toHaveTextContent('MatchedNot measured');
    expect(preview).not.toHaveTextContent('Projected');
  });

  it('shows nothing for a clean save with no preview', () => {
    const { container } = render(<RuleSaveSummary response={saved({})} />);

    expect(container).toBeEmptyDOMElement();
  });
});
