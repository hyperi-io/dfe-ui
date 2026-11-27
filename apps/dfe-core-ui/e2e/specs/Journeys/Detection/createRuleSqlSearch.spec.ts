import { expect as baseExpect, test } from '@playwright/test';

import { engineToken } from '@e2e/config/engineApi.helpers';
import { prepareJourneyStack, JOURNEY_USER } from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { apiPrimaryOrganisation, engineClient } from './detection.helpers';
import {
  clickCreateRule,
  createdRuleId,
  hyperdxOrigin,
  hyperdxSourceId,
  openSearch,
} from './createRuleFromSearch.helpers';
import {
  createHunt,
  matchedIds,
  expectFilterOnly,
  expectLanded,
  runHunt,
  sendEvents,
  storedRule,
} from './createRuleStored.helpers';

prepareJourneyStack();

const expect = baseExpect.configure({ timeout: 20_000 });
const MARK = `crsql${Date.now()}`;
const HUNT = 'jdet-crsql-hunt';

// Four events a batch. The search keeps n = 2 and n = 4: high level, n >= 2.
const batch = (name: string) =>
  [1, 2, 3, 4].map((n) => ({
    cr_kind: 'crsql',
    cr_mark: MARK,
    cr_batch: name,
    cr_n: n,
    level: n === 3 ? 'low' : 'high',
  }));

test.setTimeout(300_000);
test.use({ actionTimeout: 15_000 });

test(
  'Create Rule from a SQL search keeps the typed filter and drops the rest',
  { tag: [TAGS.core, TAGS.docker] },
  async ({ page, context, request }) => {
    const api = engineClient(request, await engineToken());
    const primary = await apiPrimaryOrganisation(api);
    await loginAs(page, JOURNEY_USER);
    const origin = await hyperdxOrigin(page);
    const sourceId = await hyperdxSourceId(page, origin, 'main');
    await sendEvents(batch('before'));
    await expectLanded('main', MARK, 4);

    // The landing source, SQL mode, a custom SELECT and ORDER BY, and a time
    // predicate typed into the WHERE beside JSON-path filters.
    await openSearch(page, origin, sourceId, {
      language: 'sql',
      select: '_timestamp,_json',
      orderBy: '_timestamp DESC',
      where: `_timestamp_load < now() AND _json.cr_mark = '${MARK}' AND _json.level = 'high' AND _json.cr_n >= 2`,
    });
    await expect(page.getByText('2 Results')).toBeVisible();

    const created = await clickCreateRule(page, context);
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const id = createdRuleId(created.body);
    try {
      expect(created.editor?.url()).toContain(id);
      const rule = await storedRule(id);
      expectFilterOnly(rule, 'main');
      expect(rule.where_clause).toContain(`'${MARK}'`);
      expect(rule.where_clause).toContain(`'high'`);
      expect(rule.where_clause).toMatch(/cr_n.*>= 2/);

      await createHunt(api, HUNT, rule, primary.name);
      await sendEvents(batch('after'));
      await expectLanded('main', MARK, 8);
      await runHunt(api, HUNT, 'main', MARK);
      // The events the search showed, and no other: the batch sent after the
      // hunt matches exactly, and an earlier batch the hunt's first run also
      // reads may match no event outside that set.
      const expected = ['2', '4'];
      await expect
        .poll(() => matchedIds(HUNT, id, MARK, 'after', 'cr_n'), {
          timeout: 150_000,
          intervals: [5_000],
        })
        .toEqual(expected);
      const earlier = await matchedIds(HUNT, id, MARK, 'before', 'cr_n');
      expect(earlier.filter((value) => !expected.includes(value))).toEqual([]);
    } finally {
      await api.del(`/hunts/${HUNT}`);
      await api.del(`/rules/${id}`);
    }
  },
);
