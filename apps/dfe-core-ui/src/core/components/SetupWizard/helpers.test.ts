import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNavigateToStep, useSetupWizardParams } from './helpers';

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

describe('useSetupWizardParams', () => {
  afterEach(() => {
    mockReplace.mockClear();
    searchParamsRef.current = new URLSearchParams();
    stepParamRef.current = 'welcome';
  });

  it('reads step from path and oidc_provider_name from search params', () => {
    stepParamRef.current = 'welcome';
    searchParamsRef.current = new URLSearchParams('oidc_provider_name=google');

    const { result } = renderHook(() => useSetupWizardParams());

    expect(result.current.params).toEqual({
      step: 'welcome',
      oidc_provider_name: 'google',
      username: null,
    });
  });

  it('navigates to the step path segment', () => {
    const { result } = renderHook(() => useSetupWizardParams());

    act(() => {
      result.current.setParams({ step: 'configureLogin' });
    });

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureLogin');
  });

  it('preserves oidc_provider_name in the query when updating step', () => {
    searchParamsRef.current = new URLSearchParams(
      'oidc_provider_name=entra',
    );

    const { result } = renderHook(() => useSetupWizardParams());

    act(() => {
      result.current.setParams({ step: 'configureUser' });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/setup/configureUser?oidc_provider_name=entra',
    );
  });

  it('clears oidc_provider_name when set to null', () => {
    searchParamsRef.current = new URLSearchParams(
      'oidc_provider_name=google',
    );
    stepParamRef.current = 'configureLogin';

    const { result } = renderHook(() => useSetupWizardParams());

    act(() => {
      result.current.setParams({ oidc_provider_name: null });
    });

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureLogin');
  });

  it('updates step path and query params together', () => {
    searchParamsRef.current = new URLSearchParams(
      'oidc_provider_name=old',
    );

    const { result } = renderHook(() => useSetupWizardParams());

    act(() => {
      result.current.setParams({
        step: 'complete',
        oidc_provider_name: 'new',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/setup/complete?oidc_provider_name=new',
    );
  });
});

describe('useNavigateToStep', () => {
  afterEach(() => {
    mockReplace.mockClear();
    searchParamsRef.current = new URLSearchParams();
    stepParamRef.current = 'welcome';
  });

  it('derives current step from path params', () => {
    stepParamRef.current = 'welcome';

    const { result } = renderHook(() => useNavigateToStep());

    expect(result.current.currentStep).toBe('welcome');
  });

  it('navigates to the step path segment', () => {
    const { result } = renderHook(() => useNavigateToStep());

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
