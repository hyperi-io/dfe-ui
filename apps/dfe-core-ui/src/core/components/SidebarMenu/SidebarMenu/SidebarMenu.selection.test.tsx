import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SidebarMenu } from './index';
import { server } from './SidebarMenu.mocks';

// Selection derives from the pathname alone, so drive it directly.
const usePathnameMock = vi.hoisted(() => vi.fn<() => string>(() => '/'));
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => usePathnameMock(),
}));

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withHyperdxPort('8090');

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const selectedLabels = async () => {
  const items = await screen.findAllByRole('listitem');
  return items
    .filter((item) => item.className.includes('border-tertiary'))
    .map((item) => item.textContent?.trim());
};

describe('SidebarMenu selection', () => {
  it('highlights a top-level page', async () => {
    usePathnameMock.mockReturnValue('/rules');
    render(<SidebarMenu collapsed={false} />, { wrapper });
    expect(await selectedLabels()).toEqual(['Rules']);
  });

  it('highlights a nested observe page', async () => {
    usePathnameMock.mockReturnValue('/observe/dashboards');
    render(<SidebarMenu collapsed={false} />, { wrapper });
    expect(await selectedLabels()).toEqual(['Dashboards']);
  });

  it('prefers the longest matching key', async () => {
    usePathnameMock.mockReturnValue('/observe/search/list');
    render(<SidebarMenu collapsed={false} />, { wrapper });
    expect(await selectedLabels()).toEqual(['Saved Searches']);
  });

  it('highlights the parent for a child route', async () => {
    usePathnameMock.mockReturnValue('/rules/some-rule-id');
    render(<SidebarMenu collapsed={false} />, { wrapper });
    expect(await selectedLabels()).toEqual(['Rules']);
  });

  it('highlights nothing on an unlisted path', async () => {
    usePathnameMock.mockReturnValue('/profile');
    render(<SidebarMenu collapsed={false} />, { wrapper });
    expect(await selectedLabels()).toEqual([]);
  });
});
