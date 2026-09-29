import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSetupWizardNavigateToStep } from './helpers';

const { mockReplace, searchParamsRef, stepParamRef } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  stepParamRef: { current: 'welcome' as string },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => searchParamsRef.current,
  useParams: () => ({ step: stepParamRef.current }),
}));

describe('useSetupWizardNavigateToStep', () => {
  afterEach(() => {
    mockReplace.mockClear();
    searchParamsRef.current = new URLSearchParams();
    stepParamRef.current = 'welcome';
  });

  it('derives current step from path params', () => {
    stepParamRef.current = 'welcome';

    const { result } = renderHook(() => useSetupWizardNavigateToStep());

    expect(result.current.currentStep).toBe('welcome');
  });

  it('navigates to the step path segment', () => {
    const { result } = renderHook(() => useSetupWizardNavigateToStep());

    act(() => {
      result.current.navigateToStep('configureLogin');
    });

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureLogin');
  });
});

describe('isSetupWizardStep', () => {
  it('accepts known step slugs', async () => {
    const { isSetupWizardStep } = await import('./server.helpers');
    expect(isSetupWizardStep('configureLogin')).toBe(true);
    expect(isSetupWizardStep('not-a-step')).toBe(false);
  });

  it('no longer accepts the break-glass reset', async () => {
    const { isSetupWizardStep } = await import('./server.helpers');
    expect(isSetupWizardStep('resetBreakGlassAccount')).toBe(false);
  });
});

describe('SETUP_WIZARD_STEPS', () => {
  it('is the four-screen flow plus the completion screen', async () => {
    const { SETUP_WIZARD_STEPS } = await import('./server.helpers');
    expect(SETUP_WIZARD_STEPS).toEqual([
      'welcome',
      'configureOrganisation',
      'configureLogin',
      'configureUser',
      'complete',
    ]);
  });
});

describe('getSetupWizardStepFromStateStep', () => {
  it('maps the engine step ids the setup status reports', async () => {
    const { getSetupWizardStepFromStateStep } =
      await import('./server.helpers');
    expect(getSetupWizardStepFromStateStep('organisations')).toBe(
      'configureOrganisation',
    );
    expect(getSetupWizardStepFromStateStep('first_user')).toBe(
      'configureLogin',
    );
  });

  it('falls back to the welcome screen for anything else', async () => {
    const { getSetupWizardStepFromStateStep } =
      await import('./server.helpers');
    expect(getSetupWizardStepFromStateStep(undefined)).toBe('welcome');
    expect(getSetupWizardStepFromStateStep('admin_password')).toBe('welcome');
  });
});

describe('getFirstPendingWizardStep', () => {
  it('is the screen for the first step the engine still needs', async () => {
    const { getFirstPendingWizardStep } = await import('./server.helpers');
    expect(getFirstPendingWizardStep(['organisations', 'first_user'])).toBe(
      'configureOrganisation',
    );
    expect(getFirstPendingWizardStep(['first_user'])).toBe('configureLogin');
  });

  it('never sends Next from welcome back to welcome', async () => {
    const { getFirstPendingWizardStep } = await import('./server.helpers');
    expect(getFirstPendingWizardStep([])).toBe('configureOrganisation');
    expect(getFirstPendingWizardStep(undefined)).toBe('configureOrganisation');
    expect(getFirstPendingWizardStep(null)).toBe('configureOrganisation');
    expect(getFirstPendingWizardStep(['a_step_this_build_lacks'])).toBe(
      'configureOrganisation',
    );
  });
});
