import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { buildSidebarMenuGroups, sidebarMenuItems } from './constants';
import { SidebarMenu } from './index';
import { server } from './SidebarMenu.mocks';

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

describe('SidebarMenu', () => {
  describe('collapsed is false', () => {
    it('should render menu list', async () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      const menuItems = await screen.findAllByRole('link');

      const menuItemList = menuItems
        .map((item) => item.textContent)
        .filter((item) => !!item);

      expect(menuItemList).toEqual([
        // Observe
        'Search',
        'Saved Searches',
        'Chart Explorer',
        'Dashboards',
        'Hunt Results',
        // Data flow
        'Sources',
        'Meta Schemas',
        'Library',
        // Detect
        'Rules',
        'Hunts',
        // Stack
        'Components',
        'Services',
        'Platform',
        // Access
        'Settings',
      ]);
    });

    it('should group the destinations in the order a record travels', async () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      await screen.findAllByRole('link');

      const headings = screen
        .getAllByRole('presentation')
        .map((item) => item.textContent);

      expect(headings).toEqual([
        'Observe',
        'Data flow',
        'Detect',
        'Stack',
        'Access',
      ]);
    });

    it('should place every destination under exactly one group', async () => {
      const groups = buildSidebarMenuGroups('http://hyperdx.example:8090');
      const keys = sidebarMenuItems(groups).map((item) => item.key);

      expect(new Set(keys).size).toBe(keys.length);
    });

    it('should navigate to the correct page when a menu item is clicked', async () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      const menuItems = await screen.findAllByRole('link');
      expect(menuItems[0]).toHaveAttribute('href', '/observe/search');
      expect(menuItems[1]).toHaveAttribute('href', '/observe/search/list');
    });

    it('should not show tooltip on hover', async () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      const menuItems = await screen.findAllByRole('link');

      expect(menuItems[0]).toHaveAttribute('href', '/observe/search');
    });
  });

  describe('collapsed is true', async () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<SidebarMenu collapsed={true} />, { wrapper });
      const menuItems = await screen.findAllByRole('link');

      await user.hover(menuItems[0]);

      await waitFor(() => {
        const searchElements = screen.getAllByText('Search');
        expect(searchElements.length).toBeGreaterThan(0);
      });
    });

    it('should render icon list', async () => {
      const { container } = render(<SidebarMenu collapsed={true} />, {
        wrapper,
      });
      const sidebar = container.querySelector('ul');
      expect(sidebar).toBeTruthy();

      await waitFor(() => {
        const collapsedMenuItemList = within(sidebar as HTMLElement)
          .getAllByRole('link')
          .map((item) => item.textContent?.trim())
          .filter((item) => !!item);

        expect(collapsedMenuItemList).toEqual([]);
      });
    });

    it('should navigate to the correct page when a menu item is clicked', async () => {
      render(<SidebarMenu collapsed={true} />, { wrapper });
      const menuItemList = await screen.findAllByRole('link');

      expect(menuItemList[0]).toHaveAttribute('href', '/observe/search');
    });
  });
});
