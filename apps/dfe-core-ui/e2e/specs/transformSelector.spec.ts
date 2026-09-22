import { APIRequestContext, Page, expect, test } from '@playwright/test';

import { BASE_URL, ENGINE_API_URL, e2eClient } from '../config/e2e.client';
import { adminPassword, loginAs } from '../config/login.helpers';
import { seedAppManagement } from '../config/appManagement.helpers';

/**
 * The transform a source runs is one choice out of the catalogued transforms.
 *
 * The engine refuses an instance of a transform the source does not name, and
 * removes one the source stops naming, so the source write is the only way to
 * move a source between them. What is asserted here is the resulting SOURCE and
 * not the click: the engine's answer and the screen have to agree.
 */
const SOURCE = 'filebeatvrl';

/** The seed that binds one transform per source, so all three are taken. */
const seedThree = async (playwright: typeof import('playwright-core')) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await seedAppManagement({ playwright, seedScript: 'seed_three_transforms' });
};

const openProcessingTab = async (page: Page, source: string) => {
  await page.goto(`${BASE_URL}/sources`);
  // The row's hover actions sit over its right-hand side, so the click lands on
  // the label's leading edge rather than the row centre.
  await page
    .getByTestId(`source-tree-item-${source}`)
    .click({ position: { x: 2, y: 2 } });
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('source_name') === source,
  );
  await page.getByRole('tab', { name: 'Processing', exact: true }).click();
};

/** The engine's own answer for which transform a source names. */
const engineTransformEngine = async (
  request: APIRequestContext,
  source: string,
): Promise<string | undefined> => {
  const auth = await request.post(`${ENGINE_API_URL}/api/v1/auth/login`, {
    data: { username: 'initial_user', password: adminPassword() },
  });
  expect(auth.ok()).toBeTruthy();
  const { access_token: token } = await auth.json();
  const response = await request.get(
    `${ENGINE_API_URL}/api/v1/sources/${source}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.versions[body.current]?.transform?.engine;
};

test.describe('every transform bound to a source of its own', () => {
  test.beforeEach(async ({ playwright, page }) => {
    await seedThree(playwright);
    await loginAs(page, 'initial_user');
  });

  test('the transforms are one choice, and the fetcher is not part of it', async ({
    page,
  }) => {
    await openProcessingTab(page, SOURCE);

    await expect(
      page.getByRole('heading', { name: 'Transform', exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/One transform per source/)).toBeVisible();
    await expect(
      page.getByRole('radio', { name: /dfe-transform-vrl/ }),
    ).toBeChecked();
    await expect(
      page.getByRole('radio', { name: /dfe-transform-vector/ }),
    ).not.toBeChecked();

    // dfe-fetcher deploys and undeploys for real, so it keeps its own card.
    await expect(
      page.getByRole('heading', { name: 'dfe-fetcher', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: /dfe-fetcher/ })).toHaveCount(
      0,
    );
  });

  test('a transform offers no deploy, because the source carries the choice', async ({
    page,
  }) => {
    await openProcessingTab(page, SOURCE);

    await expect(page.getByText(/One transform per source/)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Undeploy', exact: true }),
    ).toHaveCount(0);
    // Every Deploy left on the page belongs to an app that reports itself
    // undeployed, which is dfe-fetcher and never a transform.
    await expect(
      page.getByRole('button', { name: 'Deploy', exact: true }),
    ).toHaveCount(
      await page.getByText('Not deployed for this source.').count(),
    );
  });

  test('the confirm names both ends, and cancelling writes nothing', async ({
    page,
    request,
  }) => {
    await openProcessingTab(page, SOURCE);

    await page.getByRole('radio', { name: /dfe-transform-vector/ }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`Switch the transform for ${SOURCE}`);
    await expect(dialog).toContainText(
      'dfe-transform-vector takes over from dfe-transform-vrl',
    );

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(
      page.getByRole('radio', { name: /dfe-transform-vrl/ }),
    ).toBeChecked();
    expect(await engineTransformEngine(request, SOURCE)).toBe('vrl');
  });

  test('the switch writes the source, and the screen carries the answer', async ({
    page,
    request,
  }) => {
    await openProcessingTab(page, SOURCE);

    const write = page.waitForRequest(
      (req) =>
        req.method() === 'PUT' &&
        req.url().endsWith(`/api/v1/sources/${SOURCE}`),
    );
    await page.getByRole('radio', { name: /dfe-transform-vector/ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Switch transform' })
      .click();

    // The choice is written to the SOURCE. Nothing is deployed, and no app
    // endpoint is called: the engine derives the instance from the source.
    const request_ = await write;
    expect(JSON.parse(request_.postData() ?? '{}').transform).toMatchObject({
      engine: 'vector',
      variant: null,
    });

    // How many of an app a deployment can run is the deployment's own answer, so
    // the screen is asserted against the engine rather than against a guess: the
    // new engine reads as selected where it was accepted, and the refusal lands
    // on the option where it was not.
    const written = await engineTransformEngine(request, SOURCE);
    if (written === 'vector') {
      await expect(
        page.getByRole('radio', { name: /dfe-transform-vector/ }),
      ).toBeChecked();
    } else {
      const refusal = /this deployment runs .* dfe-transform-vector/;
      await expect(page.getByRole('dialog').getByText(refusal)).toBeVisible();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Cancel' })
        .click();
      // The reason sits ON the option, so it is read where the choice is made,
      // and the option is not offered again.
      await expect(page.getByRole('radio', { name: refusal })).toBeDisabled();
      await expect(
        page.getByRole('radio', { name: /dfe-transform-vrl/ }),
      ).toBeChecked();
    }
  });
});

test.describe('a source whose other transforms are free', () => {
  /** The seed binds vrl to one source and leaves vector and elastic unused. */
  const FREE_SOURCE = 'seedsource';

  test.beforeEach(async ({ playwright, page }) => {
    await e2eClient({ playwright, seedScript: 'reset_all' });
    await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
    await seedAppManagement({
      playwright,
      seedScript: 'seed_source_with_transform',
    });
    await loginAs(page, 'initial_user');
  });

  test('moves from one transform to another in one action each', async ({
    page,
    request,
  }) => {
    await openProcessingTab(page, FREE_SOURCE);

    // The seed leaves the source naming no engine, so the first choice sets one.
    await page.getByRole('radio', { name: /dfe-transform-vrl/ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Set transform' })
      .click();
    await expect(
      page.getByRole('radio', { name: /dfe-transform-vrl/ }),
    ).toBeChecked();
    expect(await engineTransformEngine(request, FREE_SOURCE)).toBe('vrl');

    // And the second moves it, in one action, with no undeploy in between.
    await page.getByRole('radio', { name: /dfe-transform-vector/ }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Switch transform' })
      .click();
    await expect(
      page.getByRole('radio', { name: /dfe-transform-vector/ }),
    ).toBeChecked();
    expect(await engineTransformEngine(request, FREE_SOURCE)).toBe('vector');
  });
});
