import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { RunOnDemandRuleDrawer } from '.';

// Ace's beautify extension reads a global that only the app shell sets.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));
vi.mock('@/core/components/SourceSelect', () => ({
  SourceSelect: ({
    value,
    onChange,
    id,
  }: {
    value?: string;
    onChange?: (next: string) => void;
    id?: string;
  }) => (
    <input
      aria-label={
        id === 'on-demand-result-source' ? 'Result source' : 'Source picker'
      }
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const rule = { name: 'high', display_name: 'High' } as TRuleDetail;

// The test ids give every dialog the same aria-labelledby, so a dialog is found by its
// title text. jsdom never ends antd's leave motion, so a closed one stays mid-leave.
const dialogsTitled = (title: string) =>
  screen
    .queryAllByRole('dialog')
    .filter((dialog) => dialog.textContent?.includes(title));

const closing = (title: string) =>
  dialogsTitled(title).every(
    (dialog) => dialog.closest('[class*="-leave"]') !== null,
  );

const runToTheDrawer = async (user: ReturnType<typeof userEvent.setup>) => {
  server.use(API_CONFIG_MOCKS.rulesV2.run.post.success());
  render(<RunOnDemandRuleDrawer rule={rule} />, { wrapper });
  await user.click(
    await screen.findByRole('button', { name: 'Run on demand High' }),
  );
  await user.type(screen.getByLabelText('Source picker'), 'winlog');
  await user.click(screen.getByRole('button', { name: /^run on demand$/i }));
  expect(
    await screen.findByText('On-demand Result for High'),
  ).toBeInTheDocument();
};

describe('RunOnDemandRuleDrawer', () => {
  it('names a missing source in words', async () => {
    const user = userEvent.setup();
    render(<RunOnDemandRuleDrawer rule={rule} />, { wrapper });
    await user.click(
      await screen.findByRole('button', { name: 'Run on demand High' }),
    );
    await user.click(screen.getByRole('button', { name: /^run on demand$/i }));

    expect(await screen.findByText('Source is required')).toBeInTheDocument();
    expect(screen.queryByText(/Invalid input/)).not.toBeInTheDocument();
  });

  it('closes the result drawer from its close button, the modal already gone', async () => {
    const user = userEvent.setup();
    await runToTheDrawer(user);
    await waitFor(() => expect(closing('Run on demand High')).toBe(true));

    // Found open first, so the check below cannot pass on a drawer it never found.
    const [drawer] = dialogsTitled('On-demand Result for High');
    if (!drawer) throw new Error('the result drawer did not open');
    expect(closing('On-demand Result for High')).toBe(false);

    await user.click(within(drawer).getByRole('button', { name: /close/i }));

    await waitFor(() =>
      expect(closing('On-demand Result for High')).toBe(true),
    );
  });
});
