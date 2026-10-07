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

    expect(rows['Source ID:']).toBe('Not linked');
    expect(rows['Source provider:']).toBe('None');
  });

  test('a linked group with no provider prompts for one', async () => {
    const rows = await renderRows({ ...GROUP, source_id: 'dfe-viewers' });

    expect(rows['Source ID:']).toBe('dfe-viewers');
    expect(rows['Source provider:']).toBe(
      'Any provider (set one to restrict the link)',
    );
  });

  test('a provider with no source ID is shown on an unlinked group', async () => {
    const rows = await renderRows({ ...GROUP, source_provider: 'okta' });

    expect(rows['Source ID:']).toBe('Not linked');
    expect(rows['Source provider:']).toBe('okta');
  });

  test('a linked group shows the provider it is scoped to', async () => {
    const rows = await renderRows({
      ...GROUP,
      source_id: '00000000-0000-0000-0000-000000000001',
      source_provider: 'entra',
    });

    expect(rows['Source ID:']).toBe('00000000-0000-0000-0000-000000000001');
    expect(rows['Source provider:']).toBe('entra');
  });
});
