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
    user,
  };
};

describe('OrganisationCard', () => {
  test.each([
    { name: 'acme', display_name: 'Acme', org_ids: ['acme'] },
    { name: 'bare', display_name: 'Bare', org_ids: [] },
  ])('lets $name be deleted whatever its tenant ids', async (organisation) => {
    const { deleteButton } = await openMenu(organisation);

    expect(deleteButton).toBeEnabled();
  });

  test('says why the reserved default organisation cannot be deleted', async () => {
    const { deleteButton, user } = await openMenu({
      name: 'default',
      display_name: 'Default',
      org_ids: ['default'],
    });

    expect(deleteButton).toBeDisabled();
    await user.hover(deleteButton);
    expect(
      await screen.findByText(
        /every record that names no organisation lands in it/,
      ),
    ).toBeInTheDocument();
  });
});
