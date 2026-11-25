import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ViewGroupDetails } from './ViewGroupDetails';

const GROUP: TGroupDetailResponse = {
  name: 'viewers',
  description: 'Read-only analysts',
  roles: ['viewer'],
  members: [],
  scope: 'system',
  source_id: '',
  source_provider: '',
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const renderRows = async (group: TGroupDetailResponse) => {
  server.use(
    API_CONFIG_MOCKS.groups.group.get.success({
      mockedResponse: group,
      group_name: group.name,
    }),
  );
  const { container } = render(<ViewGroupDetails group_name={group.name} />, {
    wrapper,
  });
  await screen.findByText(group.name, {}, { timeout: 15_000 });
  return Object.fromEntries(
    Array.from(container.querySelectorAll('dt')).map((term) => [
      term.textContent,
      term.nextElementSibling?.textContent,
    ]),
  );
};

describe('ViewGroupDetails', () => {
  test('a group with no source ID reads as not linked', async () => {
    const rows = await renderRows(GROUP);

    expect(rows['Linked To:']).toBe('Not linked');
  });

  test('a provider with no source ID is shown on an unlinked group', async () => {
    const rows = await renderRows({ ...GROUP, source_provider: 'okta' });

    expect(rows['Linked To:']).toBe('okta');
  });

  test('a linked group shows the provider it is scoped to', async () => {
    const rows = await renderRows({
      ...GROUP,
      source_id: '00000000-0000-0000-0000-000000000001',
      source_provider: 'entra',
    });

    expect(rows['Linked To:']).toBe(
      'entra (00000000-0000-0000-0000-000000000001)',
    );
  });

  test.each([
    [{ members: ['olga'], linked_members: ['ivy'] }, 'olgaivy', 1],
    [{ members: [], linked_members: ['ivy'] }, 'ivy', 1],
    [{ members: ['olga'], linked_members: [] }, 'olga', 0],
    [{ members: [], linked_members: [] }, 'None', 0],
  ])(
    'members %j read %s, with the link holders marked',
    async (held, expected, marked) => {
      const rows = await renderRows({ ...GROUP, ...held });

      expect(rows['Members:']).toBe(expected);
      expect(
        screen.queryAllByLabelText(
          'Holds this group through its identity provider',
        ),
      ).toHaveLength(marked);
    },
  );
});
