import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TGitOpsAutoMergeResponse } from '@/Platform/hooks/gitops/useFetchGitOpsAutoMerge/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { GitOps } from '.';
import { server } from './GitOps.mocks';

// The log pages through an IntersectionObserver jsdom lacks, and these tests are about the toggle.
vi.mock('./GitOpsLogs', () => ({ GitOpsLogs: () => null }));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const SOLO_REASON = 'solo operator posture (DFE_GITOPS_MODE=solo)';
const TEAM_REASON =
  'production posture (DFE_ENV=production) with DFE_GITOPS_MODE=team; set DFE_GITOPS_MODE=solo (or a dev DFE_ENV) to permit auto-merge';

const autoMergeUrl = API_CONFIG_MOCKS.gitops.autoMerge.mockedUrl;

/** Serve one auto-merge status, and record every body the toggle sends. */
const serveAutoMerge = (status: TGitOpsAutoMergeResponse) => {
  const sent: unknown[] = [];
  server.use(
    API_CONFIG_MOCKS.gitops.autoMerge.get.success({ mockedResponse: status }),
    http.put(autoMergeUrl, async ({ request }) => {
      sent.push(await request.json());
      return HttpResponse.json(status);
    }),
  );
  return sent;
};

/** Render, and wait until the engine's answer is on the page rather than the defaults. */
const renderSettled = async (status: TGitOpsAutoMergeResponse) => {
  render(<GitOps />, { wrapper });
  await screen.findByText(status.reason, {}, { timeout: 15000 });
};

const definitionFor = (term: string) =>
  screen.getByText(term, { selector: 'dt' }).nextElementSibling;

describe('GitOps auto-merge toggle', () => {
  it('offers Enable when auto-merge is off and the deployment allows it', async () => {
    const user = userEvent.setup();
    const status = {
      stored: false,
      effective: false,
      allowed: true,
      reason: SOLO_REASON,
    };
    const sent = serveAutoMerge(status);

    await renderSettled(status);

    const toggle = await screen.findByRole(
      'button',
      { name: 'Enable Auto Merge' },
      { timeout: 15000 },
    );
    expect(toggle).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Disable Auto Merge' }),
    ).not.toBeInTheDocument();

    await user.click(toggle);

    await waitFor(() => expect(sent).toEqual([{ enabled: true }]), {
      timeout: 15000,
    });
  });

  // Disabling always works on the engine, so a flag stranded ON by a posture change can still be cleared.
  it('offers Disable when auto-merge is stored on, even where enabling is refused', async () => {
    const user = userEvent.setup();
    const status = {
      stored: true,
      effective: false,
      allowed: false,
      reason: TEAM_REASON,
    };
    const sent = serveAutoMerge(status);

    await renderSettled(status);

    const toggle = await screen.findByRole(
      'button',
      { name: 'Disable Auto Merge' },
      { timeout: 15000 },
    );
    expect(toggle).toBeEnabled();

    await user.click(toggle);

    await waitFor(() => expect(sent).toEqual([{ enabled: false }]), {
      timeout: 15000,
    });
  });

  it('disables Enable when the deployment does not allow auto-merge', async () => {
    const status = {
      stored: false,
      effective: false,
      allowed: false,
      reason: TEAM_REASON,
    };
    serveAutoMerge(status);

    await renderSettled(status);

    expect(
      await screen.findByRole(
        'button',
        { name: 'Enable Auto Merge' },
        { timeout: 15000 },
      ),
    ).toBeDisabled();
  });

  it('offers no toggle until the engine has answered', async () => {
    server.use(
      http.get(autoMergeUrl, async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );

    render(<GitOps />, { wrapper });

    expect(
      await screen.findByRole(
        'button',
        { name: 'Enable Auto Merge' },
        { timeout: 15000 },
      ),
    ).toBeDisabled();
  });

  it('reads every flag as Yes or No, false included', async () => {
    const status = {
      stored: true,
      effective: false,
      allowed: false,
      reason: TEAM_REASON,
    };
    serveAutoMerge(status);

    await renderSettled(status);

    expect(definitionFor('Stored')).toHaveTextContent('Yes');
    expect(definitionFor('Effective')).toHaveTextContent('No');
    expect(definitionFor('Allowed')).toHaveTextContent('No');
    expect(definitionFor('Reason')).toHaveTextContent(TEAM_REASON);
  });
});
