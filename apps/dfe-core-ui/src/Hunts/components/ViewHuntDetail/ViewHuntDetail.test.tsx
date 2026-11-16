import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ViewHuntDetail } from '.';

// The tabs, the action menu and the trigger reach their own APIs. What is under test is the stop notice.
vi.mock('@/Hunts/components/ViewHuntTabs', () => ({
  ViewHuntDetailTabs: () => null,
}));
vi.mock('./HuntDetailActionMenu', () => ({ HuntDetailActionMenu: () => null }));
vi.mock('./TriggerHunt', () => ({ TriggerHunt: () => null }));
vi.mock('@/core/hooks/useSetComponentHeight', () => ({
  useSetComponentHeight: () => ({ componentHeight: 600 }),
}));

const state = vi.hoisted(() => ({
  detail: undefined as unknown,
  listed: [] as Array<{ name: string; auto_disabled_at?: number | null }>,
}));
vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({
    selectedHuntName: 'windows_audit',
    data: { items: state.listed },
  }),
}));
vi.mock('@/Hunts/hooks/useFetchHuntDetail', () => ({
  useFetchHuntDetail: () => ({
    data: state.detail,
    isLoading: false,
    error: null,
  }),
}));

afterEach(() => {
  state.listed = [];
});

const { wrapper } = buildTestWrapper().withTheme();

const hunt: THuntDetailResponse = {
  name: 'windows_audit',
  display_name: 'Windows audit',
  cron: '*/5 * * * *',
  log_buffer: 60,
  global_source_table_name: 'windows_audit',
  customers: ['acme'],
  rules: [{ rule_name: 'brute_force' }],
  enabled: true,
  auto_disabled_reason: '',
};

const NOTICE = /^The runner stopped this hunt on /;
const WAY_BACK =
  'It fires nothing until you choose Re-enable Hunt from the actions menu.';

describe('ViewHuntDetail runner stop', () => {
  it.each([
    {
      case: 'the detail carries the stop',
      detail: {
        ...hunt,
        auto_disabled_at: 1_763_300_000,
        auto_disabled_reason: 'resource_limit:241',
      },
      shown: /failures \(resource_limit:241\)\.$/,
    },
    {
      case: 'the detail carries the stop with no reason',
      detail: { ...hunt, auto_disabled_at: 1_763_300_000 },
      shown: /failures\.$/,
    },
  ])('announces the stop when $case', ({ detail, shown }) => {
    state.detail = detail;

    render(<ViewHuntDetail />, { wrapper });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(NOTICE)).toHaveTextContent(
      /after repeated ClickHouse resource-limit failures/,
    );
    expect(screen.getByText(NOTICE)).toHaveTextContent(shown);
    expect(screen.getByText(WAY_BACK)).toBeInTheDocument();
    expect(screen.getByText('Auto-disabled')).toBeInTheDocument();
  });

  it.each([
    { case: 'an enabled hunt', detail: hunt },
    {
      case: 'a hunt switched off by config',
      detail: { ...hunt, enabled: false },
    },
  ])('shows no stop notice for $case', ({ detail }) => {
    state.detail = { ...detail, auto_disabled_at: null };

    render(<ViewHuntDetail />, { wrapper });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });
});
