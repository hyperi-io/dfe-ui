import { ThemeProvider } from '@/core/contexts/ThemeContext';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarMenu } from './index';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/schemas'),
}));

// Mock Ant Design Tooltip to avoid ResizeObserver and heavy rc-component deps
vi.mock('antd', () => ({
  Tooltip: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: React.ReactNode;
  }) => (
    <>
      {title && <span data-testid="tooltip">{title}</span>}
      {children}
    </>
  ),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('SidebarMenu', () => {
  describe('collapsed is false', () => {
    it('should render menu list', () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      const menuItemList = screen
        .getAllByRole('link')
        .map((item) => item.textContent)
        .filter((item) => !!item);

      expect(menuItemList).toEqual([
        'Search',
        'Chart Explorer',
        'Dashboards',
        'Schemas',
        'Rules',
        'Hunts',
        'Ingest',
        'Settings',
      ]);
    });

    it('should navigate to the correct page when a menu item is clicked', () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      const menuItemList = screen.getAllByRole('link');
      expect(menuItemList[0]).toHaveAttribute(
        'href',
        'https://localhost:8080/search',
      );
    });

    it('should not show tooltip on hover', () => {
      render(<SidebarMenu collapsed={false} />, { wrapper });
      const menuItemList = screen.getAllByRole('link');

      expect(menuItemList[0]).toHaveAttribute(
        'href',
        'https://localhost:8080/search',
      );
    });
  });

  describe('collapsed is true', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<SidebarMenu collapsed={true} />, { wrapper });
      const menuItemList = screen.getAllByRole('link');
      await user.hover(menuItemList[0]);

      await waitFor(() => {
        const searchElements = screen.getAllByText('Search');
        expect(searchElements.length).toBeGreaterThan(0);
      });
    });

    it('should render icon list', () => {
      const { container } = render(<SidebarMenu collapsed={true} />, {
        wrapper,
      });
      const sidebar = container.querySelector('ul');
      expect(sidebar).toBeTruthy();
      const collapsedMenuItemList = within(sidebar as HTMLElement)
        .getAllByRole('link')
        .map((item) => item.textContent?.trim())
        .filter((item) => !!item);

      expect(collapsedMenuItemList).toEqual([]);
    });

    it('should navigate to the correct page when a menu item is clicked', () => {
      render(<SidebarMenu collapsed={true} />, { wrapper });
      const menuItemList = screen.getAllByRole('link');

      expect(menuItemList[0]).toHaveAttribute(
        'href',
        'https://localhost:8080/search',
      );
    });
  });
});
