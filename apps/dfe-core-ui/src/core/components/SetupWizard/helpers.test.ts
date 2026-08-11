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
});
