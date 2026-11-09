import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';
import {
  knownConsoleDefect,
  prepareJourneyStack,
} from '@e2e/config/journey.helpers';

import { ADMIN, api, shot } from './platform.helpers';
import { artefact, createViaDrawer, publishViaTab } from './library.helpers';

prepareJourneyStack();

test.afterEach(async () => {
  await api('DELETE', `/api/v1/library/${NAME}`);
});

const NAME = `jplat-lib-${Date.now().toString(36)}`;
/** The tag as the list renders it: "stable -> 2", or an arrow icon whose text is "stable points to version 2". */
const TAG_AT_2 = /stable\s*(->|points to version)?\s*2/;

test(
  'Library: create, version, tag, label, state, roll back, delete',
  { tag: [TAGS.core] },
  async ({ page }) => {
    test.setTimeout(240_000);
    const consoleErrors: string[] = [];
    page.on(
      'console',
      (m) => m.type() === 'error' && consoleErrors.push(m.text()),
    );
    await loginAs(page, ADMIN);
    await page.goto(`${BASE_URL}/library`);

    const drawer = await createViaDrawer(page, NAME);
    await shot(page, 'library-1-created');
    await expect.poll(async () => (await artefact(NAME))?.current).toBe(1);
    expect(await artefact(NAME)).toMatchObject({
      kind: 'lookup',
      group: 'jplat',
      description: 'journey artefact',
      state: 'enabled',
      versions: [1],
    });

    /* It reaches the list the user reads */
    await drawer.getByRole('button', { name: 'Close' }).click();
    await page.getByPlaceholder(/Search name/).fill(NAME);
    await page.getByPlaceholder(/Search name/).press('Enter');
    const row = page.getByRole('row', { name: new RegExp(NAME) });
    await expect(row).toContainText('lookup');
    await expect(row).toContainText('jplat');
    await shot(page, 'library-2-listed');
    await page.getByRole('button', { name: NAME, exact: true }).click();
    const detail = page.getByRole('dialog', { name: NAME });

    await publishViaTab(page, 'k,v\na,2\n', 'second');
    expect(await artefact(NAME)).toMatchObject({
      versions: [1, 2],
      current: 2,
    });
    expect(
      (
        await api<{ content: string }>(
          'GET',
          `/api/v1/library/${NAME}/versions/2`,
        )
      ).body.content,
    ).toBe('k,v\na,2\n');
    await shot(page, 'library-3-published');

    await detail
      .getByRole('row', { name: /^1 / })
      .getByRole('button', { name: 'Make current' })
      .click();
    await expect.poll(async () => (await artefact(NAME)).current).toBe(1);
    await expect(
      detail
        .getByRole('row', { name: /^1 / })
        .getByText('current', { exact: true }),
    ).toBeVisible();

    await detail.getByRole('tab', { name: 'Tags' }).click();
    await detail.getByRole('textbox', { name: 'Tag' }).fill('stable');
    await detail.getByRole('combobox', { name: 'Points at version' }).click();
    await page.getByTitle('2', { exact: true }).click();
    await detail.getByRole('button', { name: 'Point tag' }).click();
    await expect(
      detail
        .getByRole('tabpanel', { name: 'Tags' })
        .getByText('version 2', { exact: true })
        .first(),
    ).toBeVisible();
    expect((await artefact(NAME)).tags).toEqual({ stable: 2 });
    await shot(page, 'library-4-tagged');

    await detail.getByRole('tab', { name: 'Labels' }).click();
    // The form re-seeds from the artefact on every refetch, so a refetch still
    // in flight from the tag write can empty the box after the fill. Fill and
    // save again until the engine holds the labels.
    await expect(async () => {
      await detail
        .getByRole('textbox', { name: 'Labels' })
        .fill('team=jplat\ntier=gold');
      await detail.getByRole('button', { name: 'Save metadata' }).click();
      await expect
        .poll(async () => (await artefact(NAME)).labels, { timeout: 4_000 })
        .toEqual({ team: 'jplat', tier: 'gold' });
    }).toPass({ timeout: 20_000 });
    await shot(page, 'library-5-labelled');

    await detail.getByRole('combobox').first().click();
    await page.getByTitle('deprecated').click();
    await expect
      .poll(async () => (await artefact(NAME)).state)
      .toBe('deprecated');

    /* The list behind the drawer should follow the writes without a reload */
    const LIST_STALE =
      'the library list is not refetched after a tag, label or state write: the mutations invalidate the literal key ["library","{artifact}"], which no list query uses';
    await knownConsoleDefect(LIST_STALE, async () => {
      const listRow = page.getByRole('row', { name: new RegExp(NAME) });
      await expect(listRow).toContainText(TAG_AT_2, { timeout: 3_000 });
      await expect(listRow).toContainText('team=jplat', { timeout: 3_000 });
      await expect(listRow).toContainText('deprecated', { timeout: 3_000 });
    });

    /* A fresh read of the list holds every one of them */
    await page.reload();
    await page.getByPlaceholder(/Search name/).fill(NAME);
    await page.getByPlaceholder(/Search name/).press('Enter');
    const listRow = page.getByRole('row', { name: new RegExp(NAME) });
    await expect(listRow, 'list shows the tag').toContainText(TAG_AT_2);
    await expect(listRow, 'list shows the labels').toContainText('team=jplat');
    await expect(listRow, 'list shows the state').toContainText('deprecated');
    await expect(
      listRow.getByRole('cell').nth(3),
      'list shows current 1',
    ).toHaveText('1');
    await page.getByRole('button', { name: NAME, exact: true }).click();

    await detail.getByRole('tab', { name: 'Usage' }).click();
    await shot(page, 'library-6-usage');

    const errors = () => consoleErrors.filter((e) => !/favicon/.test(e));
    expect(errors()).toEqual([]);

    await detail.getByRole('button', { name: 'Delete' }).click();
    // A console build that asks first shows a confirm, one that deletes at once does not.
    await page
      .getByRole('dialog', { name: 'Delete this artefact?' })
      .getByRole('button', { name: 'Delete artefact' })
      .click({ timeout: 2_000 })
      .catch(() => undefined);
    await expect
      .poll(async () => (await api('GET', `/api/v1/library/${NAME}`)).status)
      .toBe(404);
    await knownConsoleDefect(
      'the library list keeps a deleted artefact until a reload, for the reason the other writes leave it stale',
      () =>
        expect(page.getByRole('row', { name: new RegExp(NAME) })).toHaveCount(
          0,
          { timeout: 3_000 },
        ),
    );
    await page.reload();
    await page.getByPlaceholder(/Search name/).fill(NAME);
    await page.getByPlaceholder(/Search name/).press('Enter');
    await expect(page.getByRole('row', { name: new RegExp(NAME) })).toHaveCount(
      0,
    );
    await shot(page, 'library-7-deleted');
    await knownConsoleDefect(
      "deleting an artefact refetches the open drawer's detail, versions and usage, and each answers 404",
      async () => expect(errors()).toEqual([]),
    );
  },
);
