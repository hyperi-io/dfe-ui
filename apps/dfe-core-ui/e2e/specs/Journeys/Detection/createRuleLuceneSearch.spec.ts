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
const MARK = `crluc${Date.now()}`;
const HUNT = 'jdet-crluc-hunt';
const MESSAGE = "error: can't connect to db-1";

// The search keeps an event with that message on the nested dataset or from jo
// bloggs: events 1 and 3. Event 2 has another message, event 4 neither.
const batch = (name: string) =>
  [
    { dataset: 'crluc.log', user: 'sam', message: MESSAGE },
    { dataset: 'crluc.log', user: 'sam', message: 'error: fine' },
    { dataset: 'other.log', user: 'jo bloggs', message: MESSAGE },
    { dataset: 'other.log', user: 'sam', message: MESSAGE },
  ].map((e, i) => ({
    cr_kind: 'crluc',
    cr_mark: MARK,
    cr_id: i + 1,
    cr_batch: name,
    data_stream: { dataset: e.dataset },
    user: { name: e.user },
    message: e.message,
  }));

test.setTimeout(300_000);
test.use({ actionTimeout: 15_000 });

test(
  'Create Rule from a Lucene search keeps nested JSON, OR and a quoted value',
  { tag: [TAGS.core, TAGS.docker] },
  async ({ page, context, request }) => {
    const api = engineClient(request, await engineToken());
    const primary = await apiPrimaryOrganisation(api);
    await loginAs(page, JOURNEY_USER);
    const origin = await hyperdxOrigin(page);
    const sourceId = await hyperdxSourceId(page, origin, 'main');
    await sendEvents(batch('before'));
    await expectLanded('main', MARK, 4);

    await openSearch(page, origin, sourceId, {
      language: 'lucene',
      where: `_json.cr_mark:"${MARK}" AND _json.message:"${MESSAGE}" AND (_json.data_stream.dataset:"crluc.log" OR _json.user.name:"jo bloggs")`,
    });
    await expect(page.getByText('2 Results')).toBeVisible();

    const created = await clickCreateRule(page, context);
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const id = createdRuleId(created.body);
    try {
      const rule = await storedRule(id);
      expectFilterOnly(rule, 'main');
      expect(rule.where_clause).toContain('data_stream');
      expect(rule.where_clause).toContain('jo bloggs');
      expect(rule.where_clause).toContain(' OR ');

      await createHunt(api, HUNT, rule, primary.name);
      await sendEvents(batch('after'));
      await expectLanded('main', MARK, 8);
      await runHunt(api, HUNT, 'main', MARK);
      // The events the search showed, and no other: the batch sent after the
      // hunt matches exactly, and an earlier batch the hunt's first run also
      // reads may match no event outside that set.
      const expected = ['1', '3'];
      await expect
        .poll(() => matchedIds(HUNT, id, MARK, 'after', 'cr_id'), {
          timeout: 150_000,
          intervals: [5_000],
        })
        .toEqual(expected);
      const earlier = await matchedIds(HUNT, id, MARK, 'before', 'cr_id');
      expect(earlier.filter((value) => !expected.includes(value))).toEqual([]);
    } finally {
      await api.del(`/hunts/${HUNT}`);
      await api.del(`/rules/${id}`);
    }
  },
);
