import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Adding, viewing, updating and deleting an organisation from organisation management.
 *
 * The organisation has no organisation IDs, so it is not a parent and can be deleted.
 * Delete asks for the organisation name before it removes the card.
 */

const NAME = 'e2eorg';
const DISPLAY_NAME = 'E2E Org';
const RENAMED = 'E2E Org Renamed';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  // The dev indicator sits on the drawer's submit button and takes the click.
  await page.addInitScript(() => {
    const hide = () => {
      document.querySelectorAll('nextjs-portal').forEach((node) => {
        (node as HTMLElement).style.setProperty('pointer-events', 'none');
      });
    };
    hide();
    new MutationObserver(hide).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openOrganisations = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin`);
};

const orgHeading = (page: Page, name: string) =>
  page.getByRole('heading', { name, exact: true });

const openActions = async (page: Page, displayName: string) => {
  await page
    .getByRole('button', { name: `${displayName} actions`, exact: true })
    .click();
};

test.describe(
  '',
  { tag: [TAGS.core, TAGS.settings, TAGS.organisation] },
  () => {
    test.describe('Organisation management', { tag: [TAGS.core] }, () => {
      test('user can add, view, update and delete an organisation', async ({
        page,
      }) => {
        await openOrganisations(page);
        await page
          .getByRole('button', {
            name: 'Configure New Organisation',
            exact: true,
          })
          .click();

        const create = page.getByRole('dialog', {
          name: 'Create Organisation',
        });
        await create.getByPlaceholder('Enter name').fill(NAME);
        await create.getByPlaceholder('Enter display name').fill(DISPLAY_NAME);
        await create.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(
          page.getByText('Organisation created successfully'),
        ).toBeVisible();
        await expect(orgHeading(page, DISPLAY_NAME)).toBeVisible();

        await openActions(page, DISPLAY_NAME);
        await page
          .getByRole('button', {
            name: `View ${DISPLAY_NAME} details`,
            exact: true,
          })
          .click();
        const details = page.getByRole('dialog', {
          name: 'Organisation Details',
        });
        await expect(
          details.getByRole('heading', { name: DISPLAY_NAME, exact: true }),
        ).toBeVisible();
        await expect(details.getByText(NAME, { exact: true })).toBeVisible();
        await expect(details.getByText('None', { exact: true })).toBeVisible();
        await details
          .getByRole('button', { name: 'Close', exact: true })
          .click();
        await expect(details).toBeHidden();

        await openActions(page, DISPLAY_NAME);
        await page
          .getByRole('button', { name: `Edit ${DISPLAY_NAME}`, exact: true })
          .click();
        const edit = page.getByRole('dialog', { name: 'Edit Organisation' });
        await expect(edit.getByPlaceholder('Enter name')).toHaveValue(NAME);
        await expect(edit.getByPlaceholder('Enter name')).toBeDisabled();
        await edit.getByPlaceholder('Enter display name').fill(RENAMED);
        await edit.getByRole('button', { name: 'Save', exact: true }).click();

        await expect(
          page.getByText('Organisation updated successfully'),
        ).toBeVisible();
        await expect(orgHeading(page, RENAMED)).toBeVisible();
        await expect(orgHeading(page, DISPLAY_NAME)).toHaveCount(0);

        await openActions(page, RENAMED);
        await page
          .getByRole('button', { name: `Delete ${RENAMED}`, exact: true })
          .click();
        const remove = page.getByRole('dialog', {
          name: 'Delete Organisation',
        });
        await remove
          .getByPlaceholder('Enter organisation ID to be deleted')
          .fill(NAME);
        await remove
          .getByRole('button', { name: 'Delete', exact: true })
          .click();

        await expect(
          page.getByText(`${RENAMED} deleted successfully`),
        ).toBeVisible();
        await expect(orgHeading(page, RENAMED)).toHaveCount(0);
      });
    });
  },
);
