import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DeploySourceDrawer } from '.';

// PlanSourceDetails transitively loads AceEditor, which needs a global `ace`.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

const { deployCallbacks } = vi.hoisted(() => ({
  deployCallbacks: {
    onSuccess: undefined as (() => void) | undefined,
  },
}));

vi.mock('@/Sources/hooks/useDeploySource', () => ({
  useDeploySource: ({ onSuccess }: { onSuccess?: () => void }) => {
    deployCallbacks.onSuccess = onSuccess;
    return {
      mutate: vi.fn(),
      data: undefined,
      isPending: false,
      error: null,
    };
  },
}));

vi.mock('@/Sources/hooks/usePlanSource', () => ({
  usePlanSource: () => ({
    mutate: vi.fn(),
    data: undefined,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/core/components/RbacProtected', () => {
  const Passthrough = ({ children }: { children: ReactNode }) => children;
  const RbacProtected = Object.assign(Passthrough, {
    Unrestricted: Passthrough,
    Restricted: () => null,
    rbacActions: { source_deploy: 'source_deploy' },
  });
  return { RbacProtected };
});

const { wrapper } = buildTestWrapper().withTheme();

describe('DeploySourceDrawer', () => {
  it('closes the deploy drawer after a successful deploy', async () => {
    const user = userEvent.setup();
    const onDeploySuccess = vi.fn();

    render(
      <DeploySourceDrawer
        source_name="test"
        version="1.0.0"
        onSuccess={{ onDeploySuccess }}
      />,
      { wrapper },
    );

    await user.click(screen.getByRole('button', { name: /Deploy/ }));

    expect(screen.getByText('Deploy Source')).toBeInTheDocument();

    act(() => {
      deployCallbacks.onSuccess?.();
    });

    expect(onDeploySuccess).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText('Deploy Source')).not.toBeInTheDocument();
    });
  });
});
