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
  FAILED,
  SOURCE,
  deployOwnSource,
  dropOwnSource,
  ownBatch,
} from './createRuleOwnSource.helpers';
import {
  createHunt,
  editSeverity,
  expectFilterOnly,
  expectLanded,
  matchedIds,
  runHunt,
  sendEvents,
  storedRule,
} from './createRuleStored.helpers';

prepareJourneyStack();

const expect = baseExpect.configure({ timeout: 20_000 });
const MARK = `crown${Date.now()}`;
const HUNT = 'jdet-crown-hunt';

test.beforeAll(dropOwnSource);
test.afterAll(dropOwnSource);
test.setTimeout(420_000);
test.use({ actionTimeout: 15_000 });

test(
  'Create Rule from a Lucene search on a second source binds the rule to its table',
  { tag: [TAGS.source, TAGS.docker] },
  async ({ page, context, request }) => {
    const api = engineClient(request, await engineToken());
    const primary = await apiPrimaryOrganisation(api);
    await loginAs(page, JOURNEY_USER);
    await deployOwnSource(page);
    await sendEvents(ownBatch(MARK, 'before'));
    await expectLanded(SOURCE, MARK, 4);

    const origin = await hyperdxOrigin(page);
    const sourceId = await hyperdxSourceId(page, origin, SOURCE);
    await openSearch(page, origin, sourceId, {
      language: 'lucene',
      where: `_json.cr_mark:"${MARK}" AND _json.message:"${FAILED}" AND (_json.user.name:"jo bloggs" OR _json.agent.name:"crs-agent")`,
    });
    await expect(page.getByText('2 Results')).toBeVisible();

    const created = await clickCreateRule(page, context);
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const id = createdRuleId(created.body);
    try {
      if (!created.editor) {
        throw new Error('Create Rule opened no rule page');
      }
      await editSeverity(created.editor, 'Medium', 'High');
      const rule = await storedRule(id);
      expect(rule.severity).toBe('high');
      expectFilterOnly(rule, SOURCE);

      await createHunt(api, HUNT, rule, primary.name);
      await sendEvents(ownBatch(MARK, 'after'));
      await expectLanded(SOURCE, MARK, 8);
      await runHunt(api, HUNT, SOURCE, MARK);
      // The events the search showed, and no other: the batch sent after the
      // hunt matches exactly, and an earlier batch the hunt's first run also
      // reads may match no event outside that set.
      const expected = ['1', '4'];
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
