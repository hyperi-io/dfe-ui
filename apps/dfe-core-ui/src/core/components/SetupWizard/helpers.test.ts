import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNavigateToStep, useSetParams } from './helpers';

const { mockReplace, searchParamsRef, pathnameRef } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  pathnameRef: { current: '/setup' },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => searchParamsRef.current,
  usePathname: () => pathnameRef.current,
}));

describe('useSetParams', () => {
  afterEach(() => {
    mockReplace.mockClear();
    searchParamsRef.current = new URLSearchParams();
    pathnameRef.current = '/setup';
  });

  it('exposes current search params as a plain object', () => {
    searchParamsRef.current = new URLSearchParams(
      'step=welcome&oidc_provider_name=google',
    );

    const { result } = renderHook(() => useSetParams());

    expect(result.current.params).toEqual({
      step: 'welcome',
      oidc_provider_name: 'google',
    });
  });

  it('replaces the URL with merged query params', () => {
    pathnameRef.current = '/setup';

    const { result } = renderHook(() => useSetParams());

    act(() => {
      result.current.setParams({ step: 'configureLogin' });
    });

    expect(mockReplace).toHaveBeenCalledWith('/setup?step=configureLogin');
  });

  it('preserves oidc_provider_name when updating step', () => {
    searchParamsRef.current = new URLSearchParams(
      'step=welcome&oidc_provider_name=entra',
    );

    const { result } = renderHook(() => useSetParams());

    act(() => {
      result.current.setParams({ step: 'configureUser' });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/setup?step=configureUser&oidc_provider_name=entra',
    );
  });

  it('clears oidc_provider_name when set to null', () => {
    searchParamsRef.current = new URLSearchParams(
      'step=configureLogin&oidc_provider_name=google',
    );

    const { result } = renderHook(() => useSetParams());

    act(() => {
      result.current.setParams({ oidc_provider_name: null });
    });

    expect(mockReplace).toHaveBeenCalledWith('/setup?step=configureLogin');
  });

  it('lets new params override existing step and oidc_provider_name', () => {
    searchParamsRef.current = new URLSearchParams(
      'step=welcome&oidc_provider_name=old',
    );

    const { result } = renderHook(() => useSetParams());

    act(() => {
      result.current.setParams({
        step: 'complete',
        oidc_provider_name: 'new',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '/setup?step=complete&oidc_provider_name=new',
    );
  });
});

describe('useNavigateToStep', () => {
  afterEach(() => {
    mockReplace.mockClear();
    searchParamsRef.current = new URLSearchParams();
    pathnameRef.current = '/setup';
  });

  it('starts on the welcome step', () => {
    const { result } = renderHook(() => useNavigateToStep());

    expect(result.current.currentStep).toBe('welcome');
  });

  it('updates current step and syncs the step query param', () => {
    const { result } = renderHook(() => useNavigateToStep());

    act(() => {
      result.current.navigateToStep('configureLogin');
    });

    expect(result.current.currentStep).toBe('configureLogin');
    expect(mockReplace).toHaveBeenCalledWith('/setup?step=configureLogin');
  });
});
