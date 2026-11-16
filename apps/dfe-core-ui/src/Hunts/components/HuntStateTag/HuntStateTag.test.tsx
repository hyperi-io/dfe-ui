import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HuntStateTag } from '.';

const { wrapper } = buildTestWrapper().withTheme();

describe('HuntStateTag', () => {
  it.each([
    {
      case: 'an enabled hunt renders nothing',
      props: { enabled: true, autoDisabledAt: null },
      tag: null,
      tooltip: null,
    },
    {
      case: 'a hunt with no state renders nothing',
      props: {},
      tag: null,
      tooltip: null,
    },
    {
      case: 'a disabled hunt reads Disabled',
      props: { enabled: false },
      tag: 'Disabled',
      tooltip:
        /^This hunt fires nothing\. Its configuration, state and watermark are kept\.$/,
    },
    {
      case: 'an auto-disabled hunt reads Auto-disabled and names the reason',
      props: {
        enabled: false,
        autoDisabledAt: 1_763_300_000,
        autoDisabledReason: 'resource_limit:241',
      },
      tag: 'Auto-disabled',
      tooltip:
        /^Auto-disabled by the hunt runner on .+ after hitting ClickHouse's memory limit repeatedly\. Use Re-enable Hunt to start it again\.$/,
    },
    {
      case: 'the auto-disable wins over a plain disable',
      props: { enabled: false, autoDisabledAt: 1_763_300_000 },
      tag: 'Auto-disabled',
      tooltip:
        /^Auto-disabled by the hunt runner on .+ after hitting a ClickHouse resource limit repeatedly\./,
    },
  ])('$case', async ({ props, tag, tooltip }) => {
    render(<HuntStateTag {...props} />, { wrapper });

    if (tag === null) {
      expect(screen.queryByText(/disabled/i)).not.toBeInTheDocument();
      return;
    }
    const shown = screen.getByText(tag);
    expect(shown).toBeInTheDocument();
    if (tooltip !== null) {
      await userEvent.hover(shown);
      expect(await screen.findByText(tooltip)).toBeInTheDocument();
    }
  });

  // The raw code never reaches the user: the API's reason becomes words.
  it.each([
    { reason: 'resource_limit:241', words: "ClickHouse's memory limit" },
    { reason: 'resource_limit:158', words: "ClickHouse's rows-to-read limit" },
    { reason: 'resource_limit:201', words: "ClickHouse's quota" },
    {
      reason: 'resource_limit:999',
      words: 'a ClickHouse resource limit (error 999)',
    },
    { reason: '', words: 'a ClickHouse resource limit' },
    { reason: 'something_else', words: 'a ClickHouse resource limit' },
  ])('names $reason as $words', async ({ reason, words }) => {
    render(
      <HuntStateTag
        autoDisabledAt={1_763_300_000}
        autoDisabledReason={reason}
      />,
      { wrapper },
    );

    await userEvent.hover(screen.getByText('Auto-disabled'));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(words);
    expect(tooltip).not.toHaveTextContent(/resource_limit/);
  });
});
