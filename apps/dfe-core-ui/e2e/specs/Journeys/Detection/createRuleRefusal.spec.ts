import { expect as baseExpect, test } from '@playwright/test';

import { engineToken } from '@e2e/config/engineApi.helpers';
import { prepareJourneyStack, JOURNEY_USER } from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { engineClient } from './detection.helpers';
import {
  clickCreateRule,
  hyperdxOrigin,
  hyperdxSourceId,
  openSearch,
} from './createRuleFromSearch.helpers';
import {
  editSeverity,
  expectFilterOnly,
  expectLanded,
  ruleTotal,
  sendEvents,
  storedRule,
} from './createRuleStored.helpers';

prepareJourneyStack();

const expect = baseExpect.configure({ timeout: 20_000 });
const MARK = `crfix${Date.now()}`;

test.setTimeout(240_000);
test.use({ actionTimeout: 15_000 });

test(
  'Create Rule refuses a search it cannot keep, says why, and saves it once fixed',
  { tag: [TAGS.core, TAGS.docker] },
  async ({ page, context, request }) => {
    const api = engineClient(request, await engineToken());
    await loginAs(page, JOURNEY_USER);
    const origin = await hyperdxOrigin(page);
    const sourceId = await hyperdxSourceId(page, origin, 'main');
    await sendEvents([{ cr_kind: 'crfix', cr_mark: MARK, level: 'high' }]);
    await expectLanded('main', MARK, 1);
    const before = await ruleTotal();
    const search = { language: 'sql' as const };

    // A search that filters only on time has no detection logic left: the hunt
    // window already bounds time for every rule.
    await openSearch(page, origin, sourceId, {
      ...search,
      where: '_timestamp_load < now()',
    });
    const timeOnly = await clickCreateRule(page, context);
    expect(timeOnly.status).toBe(422);
    expect(timeOnly.toasts).toContain('filters only on time');
    expect(timeOnly.toasts).toContain('_timestamp_load < now()');

    // A column the source does not have is named, not left as a bare status.
    await openSearch(page, origin, sourceId, {
      ...search,
      where: 'nosuchcol = 1',
    });
    const unknown = await clickCreateRule(page, context);
    expect(unknown.status).toBe(422);
    expect(unknown.toasts).toContain('nosuchcol');

    // Neither refusal wrote a rule.
    expect(await ruleTotal()).toBe(before);

    // The same search with a real filter saves, and the editor changes it.
    await openSearch(page, origin, sourceId, {
      ...search,
      where: `_timestamp_load < now() AND _json.cr_mark = '${MARK}'`,
    });
    const fixed = await clickCreateRule(page, context);
    expect(fixed.status, JSON.stringify(fixed.body)).toBe(201);
    const id: string = fixed.body.id;
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
