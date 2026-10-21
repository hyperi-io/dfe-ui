import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from '.';

const usePathnameMock = vi.hoisted(() => vi.fn<() => string>(() => '/schemas'));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/core/components/SidebarMenu', () => ({
  Sidebar: () => <nav>Platform</nav>,
}));

vi.mock('@/core/components/RbacProtected/hooks/useHasAppAccess', () => ({
  useHasAppAccess: () => ({ hasAccess: true }),
}));

const Page = ({ explode }: { explode: boolean }) => {
  if (explode) {
    throw new Error('Schema load failed');
  }
  return <p>Sources loaded</p>;
};

describe('AppLayout error boundary', () => {
  /* eslint-disable no-console */
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = () => undefined;
    usePathnameMock.mockReturnValue('/schemas');
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });
  /* eslint-enable no-console */

  it('keeps platform navigation available when the page throws', () => {
    render(
      <AppLayout>
        <Page explode />
      </AppLayout>,
    );

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Schema load failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('clears the page error when the route changes', () => {
    const { rerender } = render(
      <AppLayout>
        <Page explode />
      </AppLayout>,
    );

    usePathnameMock.mockReturnValue('/sources');
    rerender(
      <AppLayout>
        <Page explode={false} />
      </AppLayout>,
    );

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Sources loaded')).toBeInTheDocument();
    expect(screen.queryByText('Schema load failed')).not.toBeInTheDocument();
  });
});
