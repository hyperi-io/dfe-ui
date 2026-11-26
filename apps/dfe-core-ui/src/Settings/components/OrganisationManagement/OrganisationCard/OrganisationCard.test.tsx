import type { TOrganisationListSummary } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { OrganisationCard } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const openMenu = async (organisation: Partial<TOrganisationListSummary>) => {
  const user = userEvent.setup();
  render(
    <OrganisationCard
      organisation={organisation as TOrganisationListSummary}
    />,
    { wrapper },
  );
  await user.click(
    screen.getByRole('button', {
      name: `${organisation.display_name} actions`,
    }),
  );
  return {
    deleteButton: await screen.findByRole('button', {
      name: `Delete ${organisation.display_name}`,
    }),
  };
};

describe('OrganisationCard', () => {
  test.each([
    {
      org_ids: ['acme', 'acme-eu'],
      shown: ['acme', 'acme-eu'],
      hidden: [],
    },
    { org_ids: [], shown: ['No organisation IDs'], hidden: [] },
    {
      org_ids: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'],
      shown: ['a1', 'a2', 'a3', '+ 3 more'],
      hidden: ['a4', 'a5', 'a6'],
    },
  ])('shows its organisation IDs $org_ids', ({ org_ids, shown, hidden }) => {
    render(
      <OrganisationCard
        organisation={
          {
            name: 'acme',
            display_name: 'Acme',
            org_ids,
          } as TOrganisationListSummary
        }
      />,
      { wrapper },
    );

    shown.forEach((text) => expect(screen.getByText(text)).toBeVisible());
    hidden.forEach((text) =>
      expect(screen.queryByText(text)).not.toBeInTheDocument(),
    );
  });

  test.each([
    { name: 'acme', display_name: 'Acme', org_ids: ['acme'] },
    { name: 'bare', display_name: 'Bare', org_ids: [] },
    { name: 'default', display_name: 'Default', org_ids: ['default'] },
  ])(
    'lets $name be deleted whatever its name or tenant ids',
    async (organisation) => {
      const { deleteButton } = await openMenu(organisation);

      expect(deleteButton).toBeEnabled();
    },
  );
});
