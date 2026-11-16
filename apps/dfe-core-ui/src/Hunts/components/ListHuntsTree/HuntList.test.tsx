import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HuntList } from './HuntList';

const LONG_NAME =
  'Windows security audit failures across every domain controller in the estate';

// The empty and error states are not under test, and EmptyList pulls in the code editor.
vi.mock('./EmptyList', () => ({ EmptyList: () => null }));
vi.mock('./ErrorList', () => ({ ErrorList: () => null }));
vi.mock('@/core/hooks/useSetComponentHeight', () => ({
  useSetComponentHeight: () => ({ componentHeight: 600 }),
}));
vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({
    data: {
      items: [
        {
          name: 'windows_audit',
          display_name: LONG_NAME,
          enabled: true,
        },
        { name: 'dns_audit', display_name: 'DNS audit', enabled: true },
      ],
    },
    error: null,
    isLoading: false,
    loadMoreRef: { current: null },
    isFetchingNextPage: false,
    selectedHuntName: null,
    setSelectedHuntName: vi.fn(),
    filters: {},
    hasFilters: false,
    setFilters: vi.fn(),
  }),
}));

const { wrapper } = buildTestWrapper().withTheme();

describe('HuntList', () => {
  it('shows the full display name in a tooltip on the truncated name', async () => {
    render(<HuntList />, { wrapper });

    await userEvent.hover(screen.getByText(LONG_NAME));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(LONG_NAME);
  });

  it('gives each row its own name in the tooltip', async () => {
    render(<HuntList />, { wrapper });

    await userEvent.hover(screen.getByText('DNS audit'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('DNS audit');
    expect(
      screen.queryByText(LONG_NAME, { selector: '[role=tooltip] *' }),
    ).toBeNull();
  });
});
