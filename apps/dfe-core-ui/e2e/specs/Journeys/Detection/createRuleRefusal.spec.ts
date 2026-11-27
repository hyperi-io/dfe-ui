import { expect as baseExpect, test } from '@playwright/test';

import { engineToken } from '@e2e/config/engineApi.helpers';
import { prepareJourneyStack, JOURNEY_USER } from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { engineClient } from './detection.helpers';
import {
  captureDialog,
  clickCreateRule,
  createdRuleId,
  hyperdxOrigin,
  hyperdxSourceId,
  expectNoOverlap,
  openSearch,
  trackCreateRuleRequests,
} from './createRuleFromSearch.helpers';
import {
  editSeverity,
  expectFilterOnly,
  expectLanded,
  searchRuleCount,
  sendEvents,
  storedRule,
} from './createRuleStored.helpers';

prepareJourneyStack();

const expect = baseExpect.configure({ timeout: 20_000 });
const MARK = `crfix${Date.now()}`;

test.setTimeout(240_000);
test.use({ actionTimeout: 15_000 });

test(
  'Create Rule says why before it is pressed, and saves once the filter is fixed',
  { tag: [TAGS.core, TAGS.docker] },
  async ({ page, context, request }) => {
    const api = engineClient(request, await engineToken());
    await loginAs(page, JOURNEY_USER);
    const origin = await hyperdxOrigin(page);
    const sourceId = await hyperdxSourceId(page, origin, 'main');
    await sendEvents([{ cr_kind: 'crfix', cr_mark: MARK, level: 'high' }]);
    await expectLanded('main', MARK, 1);
    const before = await searchRuleCount();
    const sent = trackCreateRuleRequests(page);
    const precheck = page.getByTestId('create-rule-precheck');
    const button = page.getByTestId('create-rule-from-search-button');
    const search = { language: 'sql' as const };

    // A search that filters only on time has no detection logic left: the hunt
    // window already bounds time for every rule. The engine says so before
    // Create can be pressed. Nothing shows until the user acts, because this
    // is the ordinary state of the page.
    await openSearch(
      page,
      origin,
      sourceId,
      { ...search, where: '_timestamp_load < now()' },
      'refused',
    );
    await expect(precheck).toHaveCount(0);
    await captureDialog(page, 'precheck-refused-rest');

    // Hover and keyboard focus explain it, and the button names that text.
    const tooltip = page.getByRole('tooltip');
    const controls = {
      Run: page.getByRole('button', { name: 'Run', exact: true }),
      'the time range': page.getByRole('textbox', { name: 'Time Range' }),
      'the refresh interval': page.getByRole('combobox', {
        name: 'Live tail refresh interval',
      }),
      'the query language': page.getByRole('combobox', {
        name: 'Query language',
      }),
      Save: page.getByRole('button', { name: 'Save', exact: true }),
    };
    await button.hover();
    await expect(tooltip).toContainText('This search only filters on time.');
    await expectNoOverlap(tooltip, controls);
    await page.mouse.move(0, 400);
    await expect(tooltip).toHaveCount(0);
    await button.focus();
    await expect(tooltip).toContainText('This search only filters on time.');
    const describedBy = await button.getAttribute('aria-describedby');
    await expect(page.locator(`[id="${describedBy}"]`)).toContainText(
      'The hunt sets its own time window.',
    );

    // An aria-disabled button is not actionable to Playwright, so the click is forced.
    // A click opens the full explanation below the button, clear of the
    // controls needed to fix the search.
    await button.click({ force: true });
    await expect(precheck).toContainText('This search only filters on time.');
    await expect(precheck).toContainText('The hunt sets its own time window.');
    await expect(precheck).toContainText(
      'Left out of the rule, because the hunt sets its own time window:',
    );
    await expect(precheck).toContainText('_timestamp_load < now()');
    await expectNoOverlap(precheck, controls);
    await captureDialog(page, 'precheck-refused-open');

    // It closes on Escape and on an outside click.
    await page.keyboard.press('Escape');
    await expect(precheck).toHaveCount(0);
    await button.click({ force: true });
    await expect(precheck).toBeVisible();
    await page.mouse.click(600, 650);
    await expect(precheck).toHaveCount(0);

    // Any other refusal shows the engine's reason in the same place.
    await openSearch(
      page,
      origin,
      sourceId,
      { ...search, where: 'nosuchcol = 1' },
      'refused',
    );
    await button.click({ force: true });
    await expect(precheck).toContainText('nosuchcol');

    // Only dry runs have gone to the engine, and no rule was written.
    expect(sent.length).toBeGreaterThan(0);
    expect(
      sent.every((r) => r.dryRun),
      JSON.stringify(sent),
    ).toBe(true);
    expect(await searchRuleCount()).toBe(before);

    // The same search with a real filter clears the check, saves, and the rule
    // page changes it.
    await openSearch(page, origin, sourceId, {
      ...search,
      where: `_timestamp_load < now() AND _json.cr_mark = '${MARK}'`,
    });
    await expect(precheck).toBeHidden();
    await captureDialog(page, 'precheck-valid');
    const fixed = await clickCreateRule(page, context);
    expect(fixed.status, JSON.stringify(fixed.body)).toBe(201);
    expect(sent.filter((r) => !r.dryRun)).toHaveLength(1);
    const id = createdRuleId(fixed.body);
    try {
      if (!fixed.editor) {
        throw new Error('Create Rule opened no rule page');
      }
      await editSeverity(fixed.editor, 'Medium', 'High');
      const rule = await storedRule(id);
      expect(rule.severity).toBe('high');
      expectFilterOnly(rule, 'main');
      expect(rule.where_clause).toContain(`'${MARK}'`);
    } finally {
      await api.del(`/rules/${id}`);
    }
  },
);
