import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Role and group management from the admin settings.
 *
 * A cloned role is named with `_copy`. Core roles can be cloned and not edited.
 * Groups have no clone action, including the built-in groups.
 *
 * reset_all keeps roles and groups created in the console, so each run uses a new name.
 */

const stamp = Date.now().toString().slice(-6);
const ROLE = `e2erole${stamp}`;
const ROLE_DESCRIPTION = 'E2E role';
const ROLE_DESCRIPTION_UPDATED = 'E2E role renamed';
const ROLE_COPY = `${ROLE}_copy`;
const CORE_ROLE = 'admin';
const CORE_ROLE_COPY = `${CORE_ROLE}_copy`;
const CORE_ROLE_CLONE = `admincopy${stamp}`;

const GROUP = `e2egroup${stamp}`;
const GROUP_DESCRIPTION = 'E2E group';
const GROUP_DESCRIPTION_UPDATED = 'E2E group renamed';
const CORE_GROUP = 'dfe-admins';

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

const roleCard = (page: Page, name: string) =>
  page.locator('li').filter({
    has: page.getByRole('heading', { name, exact: true }),
  });

const groupCard = (page: Page, name: string) =>
  page.locator('li').filter({
    has: page.getByText(name, { exact: true }),
  });

const choose = async (
  page: Page,
  dialog: Locator,
  placeholder: string,
  option: string,
) => {
  const select = dialog.locator('.ant-select').filter({ hasText: placeholder });
  await select.click();
  await page.keyboard.type(option);
  // The visible row is not the hidden listbox option the select keeps for accessibility.
  await page
    .locator('.ant-select-dropdown .ant-select-item-option-content')
    .getByText(option, { exact: true })
    .click();
  await dialog.getByPlaceholder('Enter description').click();
};

const deleteRole = async (page: Page, name: string) => {
  const card = roleCard(page, name);
  // A closing dialog's wrap still covers the card and steals the click.
  await expect(page.locator('.ant-modal-wrap')).toHaveCount(0);
  await card.scrollIntoViewIfNeeded();
  await card.getByRole('button', { name: 'Role actions', exact: true }).click();
  const removeAction = page.getByRole('button', {
    name: `Delete ${name}`,
    exact: true,
  });
  // The item is in the DOM while the menu fades in. Clicking it then scrolls
  // the page, and that scroll closes the menu.
  await expect(removeAction).toBeVisible();
  await removeAction.click();
  const remove = page.getByRole('dialog', { name: 'Delete Role' });
  await remove.getByPlaceholder('Enter role name to be deleted').fill(name);
  await remove.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText(`${name} deleted successfully`)).toBeVisible();
  await expect(card).toHaveCount(0);
};

const openRoles = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/role-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/role-management`);
};

const openGroups = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/group-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/group-management`);
};

test.describe(
  'Role management',
  { tag: [TAGS.core, TAGS.settings, TAGS.roles] },
  () => {
    test('user can add, view, update, clone and delete a role', async ({
      page,
    }) => {
      await openRoles(page);
      await page
        .getByRole('button', {
          name: 'Configure New Custom Role',
          exact: true,
        })
        .click();

      const create = page.getByRole('dialog', { name: 'Create Custom Role' });
      await create.getByPlaceholder('Enter name').fill(ROLE);
      await create.getByPlaceholder('Enter description').fill(ROLE_DESCRIPTION);
      await choose(page, create, 'Select scopes', 'org:read');
      await create
        .getByRole('button', { name: 'Create Role', exact: true })
        .click();

      await expect(page.getByText('Role created successfully')).toBeVisible();
      // Custom roles show three at a time. Searching keeps this role and its copy on the page.
      await page.getByPlaceholder('Search custom roles').fill(ROLE);
      await expect(roleCard(page, ROLE)).toBeVisible();

      await roleCard(page, ROLE)
        .getByRole('button', { name: 'Role actions', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'View Role Details', exact: true })
        .click();
      const details = page.getByRole('dialog', { name: 'Role Details' });
      await expect(details.getByText(ROLE, { exact: true })).toBeVisible();
      await expect(
        details.getByText(ROLE_DESCRIPTION, { exact: true }),
      ).toBeVisible();
      await expect(
        details.getByText('org:read', { exact: true }),
      ).toBeVisible();
      await details.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(details).toBeHidden();

      await roleCard(page, ROLE)
        .getByRole('button', { name: 'Role actions', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Edit Role', exact: true })
        .click();
      const edit = page.getByRole('dialog', { name: 'Edit Role' });
      await expect(edit.getByPlaceholder('Enter name')).toHaveValue(ROLE);
      await expect(edit.getByPlaceholder('Enter name')).toBeDisabled();
      await edit
        .getByPlaceholder('Enter description')
        .fill(ROLE_DESCRIPTION_UPDATED);
      await edit
        .getByRole('button', { name: 'Update Role', exact: true })
        .click();

      await expect(page.getByText('Role updated successfully')).toBeVisible();
      await expect(
        roleCard(page, ROLE).getByText(ROLE_DESCRIPTION_UPDATED, {
          exact: true,
        }),
      ).toBeVisible();

      await roleCard(page, ROLE)
        .getByRole('button', { name: 'Role actions', exact: true })
        .click();
      await page
        .getByRole('button', { name: `Clone ${ROLE}`, exact: true })
        .click();
      const clone = page.getByRole('dialog', { name: 'Clone Role' });
      await expect(clone.getByPlaceholder('Enter name')).toHaveValue(ROLE_COPY);
      await clone
        .getByRole('button', { name: 'Clone Role', exact: true })
        .click();

      await expect(
        page.getByText(`Role ${ROLE} cloned successfully`),
      ).toBeVisible();
      await expect(roleCard(page, ROLE_COPY)).toBeVisible();

      await deleteRole(page, ROLE);
      await expect(roleCard(page, ROLE_COPY)).toBeVisible();
      await deleteRole(page, ROLE_COPY);
    });

    test('user can clone a core role', async ({ page }) => {
      await openRoles(page);
      const core = roleCard(page, CORE_ROLE);
      await core.scrollIntoViewIfNeeded();
      await core
        .getByRole('button', { name: 'Role actions', exact: true })
        .click();
      const cloneCore = page.getByRole('button', {
        name: `Clone ${CORE_ROLE}`,
        exact: true,
      });
      await expect(cloneCore).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Edit Role', exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: `Delete ${CORE_ROLE}`, exact: true }),
      ).toHaveCount(0);
      await cloneCore.click();

      const clone = page.getByRole('dialog', { name: 'Clone Role' });
      await expect(clone.getByPlaceholder('Enter name')).toHaveValue(
        CORE_ROLE_COPY,
      );
      // A previous run may already hold admin_copy, and reset_all leaves it.
      await clone.getByPlaceholder('Enter name').fill(CORE_ROLE_CLONE);
      await clone
        .getByRole('button', { name: 'Clone Role', exact: true })
        .click();

      await expect(
        page.getByText(`Role ${CORE_ROLE} cloned successfully`),
      ).toBeVisible();
      await page.getByPlaceholder('Search custom roles').fill(CORE_ROLE_CLONE);
      await expect(roleCard(page, CORE_ROLE_CLONE)).toBeVisible();
      await expect(roleCard(page, CORE_ROLE)).toBeVisible();
      await deleteRole(page, CORE_ROLE_CLONE);
    });
  },
);

test.describe(
  'Group management',
  { tag: [TAGS.core, TAGS.settings, TAGS.groups] },
  () => {
    test('user can add, view, update and delete a group', async ({ page }) => {
      await openGroups(page);
      await page
        .getByRole('button', { name: 'Configure New Group', exact: true })
        .click();

      const create = page.getByRole('dialog', { name: 'Create Group' });
      await create.getByPlaceholder('Enter name').fill(GROUP);
      await create
        .getByPlaceholder('Enter description')
        .fill(GROUP_DESCRIPTION);
      await choose(page, create, 'Select roles', 'admin');
      await create
        .getByRole('button', { name: 'Create Group', exact: true })
        .click();

      await expect(page.getByText('Group created successfully')).toBeVisible();
      await expect(groupCard(page, GROUP)).toBeVisible();

      await groupCard(page, GROUP)
        .getByRole('button', { name: 'Group actions', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'View Group Details', exact: true })
        .click();
      const details = page.getByRole('dialog', { name: 'Group Details' });
      await expect(details.getByText(GROUP, { exact: true })).toBeVisible();
      await expect(
        details.getByText(GROUP_DESCRIPTION, { exact: true }),
      ).toBeVisible();
      await expect(details.getByText('system', { exact: true })).toBeVisible();
      await details.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(details).toBeHidden();

      await groupCard(page, GROUP)
        .getByRole('button', { name: 'Group actions', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Edit Group', exact: true })
        .click();
      const edit = page.getByRole('dialog', { name: 'Edit Group' });
      await expect(edit.getByPlaceholder('Enter name')).toHaveValue(GROUP);
      await expect(edit.getByPlaceholder('Enter name')).toBeDisabled();
      await edit
        .getByPlaceholder('Enter description')
        .fill(GROUP_DESCRIPTION_UPDATED);
      await edit
        .getByRole('button', { name: 'Update Group', exact: true })
        .click();

      await expect(page.getByText('Group updated successfully')).toBeVisible();
      await expect(
        groupCard(page, GROUP).getByText(GROUP_DESCRIPTION_UPDATED, {
          exact: true,
        }),
      ).toBeVisible();

      await groupCard(page, GROUP)
        .getByRole('button', { name: 'Group actions', exact: true })
        .click();
      const removeGroup = page.getByRole('button', {
        name: `Delete ${GROUP}`,
        exact: true,
      });
      await expect(removeGroup).toBeVisible();
      await expect(page.getByRole('button', { name: /Clone/ })).toHaveCount(0);
      await removeGroup.click();
      const remove = page.getByRole('dialog', { name: 'Delete Group' });
      await remove
        .getByPlaceholder('Enter group name to be deleted')
        .fill(GROUP);
      await remove.getByRole('button', { name: 'Delete', exact: true }).click();

      await expect(
        page.getByText(`${GROUP} deleted successfully`),
      ).toBeVisible();
      await expect(groupCard(page, GROUP)).toHaveCount(0);
    });

    test('a core group can be viewed and has no clone action', async ({
      page,
    }) => {
      await openGroups(page);
      const core = groupCard(page, CORE_GROUP);
      await core.scrollIntoViewIfNeeded();
      await core
        .getByRole('button', { name: 'Group actions', exact: true })
        .click();
      const viewCore = page.getByRole('button', {
        name: 'View Group Details',
        exact: true,
      });
      await expect(viewCore).toBeVisible();
      await expect(page.getByRole('button', { name: /Clone/ })).toHaveCount(0);
      await viewCore.click();

      const details = page.getByRole('dialog', { name: 'Group Details' });
      await expect(
        details.getByText(CORE_GROUP, { exact: true }),
      ).toBeVisible();
      await expect(details.getByText('system', { exact: true })).toBeVisible();
    });
  },
);
