import { Page, expect, test } from '@playwright/test';

import { seedAppManagement } from '../config/appManagement.helpers';
import { BASE_URL, e2eClient } from '../config/e2e.client';
import { loginAs } from '../config/login.helpers';

/**
 * The Flow tab is the page that explains the product, so it is measured rather
 * than eyeballed: dfe-ui#339 shipped clipped values, cards at three heights and
 * edge labels floating between them, and each of those is a number here.
 */

/** A seeded source that binds a transform, so the flow draws all three stages. */
const SEED_SOURCE = 'filebeatvrl';

/** The width the console is designed at, and the one the defect was filed at. */
const DESKTOP = { width: 1280, height: 900 };

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await seedAppManagement({ playwright, seedScript: 'seed_three_transforms' });
  await loginAs(page, 'initial_user');
});

const openFlowTab = async (page: Page) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${BASE_URL}/sources`);
  // The row's hover actions sit over its right-hand side, so the click lands on
  // the label's leading edge rather than the row centre.
  await page
    .getByTestId(`source-tree-item-${SEED_SOURCE}`)
    .click({ position: { x: 2, y: 2 } });
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('source_name') === SEED_SOURCE,
  );
  // Flow is the default tab, so the card is the landing, not a click away.
  await expect(page.getByTestId('source-flow')).toBeVisible();
};

test('the three stages stand at one height', async ({ page }) => {
  await openFlowTab(page);

  const heights = await page
    .getByTestId('source-flow')
    .evaluate((row) =>
      [...row.querySelectorAll('[data-testid^="flow-stage-"]')].map((card) =>
        Math.round(card.getBoundingClientRect().height),
      ),
    );

  expect(heights).toHaveLength(3);
  expect(new Set(heights).size).toBe(1);
});

test('every value stays inside the card it belongs to', async ({ page }) => {
  await openFlowTab(page);

  const escaping = await page.getByTestId('source-flow').evaluate((row) => {
    const cards = [...row.querySelectorAll('[data-testid^="flow-stage-"]')];
    const texts = [...row.querySelectorAll('*')].filter(
      (el) => el.children.length === 0 && (el.textContent ?? '').trim(),
    );

    return texts
      .filter((el) => {
        const card = cards.find((c) => c.contains(el));
        // Text under no card at all is the floating edge label; text wider than
        // its own box is the clipped value.
        if (!card) return true;
        return (
          el.scrollWidth - el.clientWidth > 1 ||
          el.getBoundingClientRect().right >
            card.getBoundingClientRect().right + 1
        );
      })
      .map((el) => (el.textContent ?? '').trim());
  });

  expect(escaping).toEqual([]);
});

test('the flow draws its edges and fits its pane', async ({ page }) => {
  await openFlowTab(page);

  // A glyph standing in for a shape is the defect this tab was filed for.
  const furniture = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter((el) => el.children.length === 0)
      .map((el) => (el.textContent ?? '').trim())
      .filter((text) => /^(->|=>|-->|<-|<=|\||\*)$/.test(text)),
  );
  expect(furniture).toEqual([]);

  // Two stages joined by an edge means two edges, each named by what carries
  // the records across it.
  await expect(
    page.getByTestId('source-flow').getByRole('img', { name: /^Carried on / }),
  ).toHaveCount(2);

  // A card pushed off the canvas shows up as a sideways scrollbar under the
  // diagram, so the pane is asserted rather than the card.
  const overflow = await page.getByTestId('source-flow').evaluate((row) => {
    const pane = row.closest('.ant-tabs-content');
    return pane ? pane.scrollWidth - pane.clientWidth : 0;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});
