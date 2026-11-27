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
    // Create can be pressed, and lists the bound it would drop.
    await openSearch(
      page,
      origin,
      sourceId,
      { ...search, where: '_timestamp_load < now()' },
      'refused',
    );
    await expect(precheck).toContainText('This search only filters on time.');
    await expect(precheck).toContainText('The hunt sets its own time window.');
    await expect(precheck).toContainText('_timestamp_load < now()');
    await captureDialog(page, 'precheck-refused');

    // Any other refusal shows the engine's reason in the same place.
    await openSearch(
      page,
      origin,
      sourceId,
      { ...search, where: 'nosuchcol = 1' },
      'refused',
    );
    await expect(precheck).toContainText('nosuchcol');
    await expect(button).toBeDisabled();

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
