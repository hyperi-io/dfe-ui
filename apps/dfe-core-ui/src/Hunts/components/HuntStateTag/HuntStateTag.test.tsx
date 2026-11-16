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
        /after repeated ClickHouse resource-limit failures \(resource_limit:241\)\. Re-enable the hunt to clear it\./,
    },
    {
      case: 'the auto-disable wins over a plain disable',
      props: { enabled: false, autoDisabledAt: 1_763_300_000 },
      tag: 'Auto-disabled',
      tooltip:
        /^Stopped .* after repeated ClickHouse resource-limit failures\./,
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
});
