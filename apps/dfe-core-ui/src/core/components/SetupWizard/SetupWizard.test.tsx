import { TOrganisation } from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SetupWizard } from '.';

const { mockReplace, stepParamRef } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  stepParamRef: { current: 'welcome' },
}));

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({ replace: mockReplace, refresh: vi.fn() }),
  useParams: () => ({ step: stepParamRef.current }),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderWelcome = (
  firstPendingStep: 'configureOrganisation' | 'configureLogin',
) =>
  render(
    <SetupWizard
      oidcProvider={null}
      organisation={null}
      userCreated={false}
      firstPendingStep={firstPendingStep}
      setupComplete={false}
    />,
    { wrapper },
  );

describe('SetupWizard', () => {
  afterEach(() => {
    mockReplace.mockClear();
    stepParamRef.current = 'welcome';
  });

  test('Next on welcome opens the first step the engine still needs', async () => {
    const user = userEvent.setup();
    renderWelcome('configureLogin');

    await user.click(await screen.findByRole('button', { name: /Next/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureLogin');
  });

  test('Next on welcome opens the organisation step on a fresh deployment', async () => {
    const user = userEvent.setup();
    renderWelcome('configureOrganisation');

    await user.click(await screen.findByRole('button', { name: /Next/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureOrganisation');
  });

  test('Back from the organisation step returns to welcome', async () => {
    const user = userEvent.setup();
    stepParamRef.current = 'configureOrganisation';
    renderWelcome('configureOrganisation');

    await user.click(await screen.findByRole('button', { name: /Back/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/welcome');
  });

  test('the source step renders on its own screen', () => {
    stepParamRef.current = 'configureSource';
    renderWelcome('configureOrganisation');

    expect(
      screen.getByRole('heading', { name: 'Configure Source' }),
    ).toBeInTheDocument();
  });

  test('Next from organisation opens the source step', async () => {
    const user = userEvent.setup();
    stepParamRef.current = 'configureOrganisation';
    render(
      <SetupWizard
        oidcProvider={null}
        organisation={{ name: 'acme' } as TOrganisation}
        userCreated={false}
        firstPendingStep="configureOrganisation"
        setupComplete={false}
      />,
      { wrapper },
    );

    await user.click(await screen.findByRole('button', { name: /Next/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureSource');
  });
});
