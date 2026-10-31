import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ViewActionDetail } from './ViewActionDetail';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('ViewActionDetail change value', () => {
  test.each([
    ['a string', 'protect', 'value: protect'],
    ['an unset marker', { $unset: true }, 'value: {"$unset":true}'],
    ['a number', 3, 'value: 3'],
    ['a boolean', false, 'value: false'],
    ['null', null, 'value: null'],
    ['a list', ['a', 'b'], 'value: ["a","b"]'],
  ])('renders %s', async (_label, value, expected) => {
    server.use(
      API_CONFIG_MOCKS.governance.action.get.success({
        mockedResponse: {
          name: 'name',
          description: 'description',
          required_action: 'required_action',
          changes: [{ cls: 'cls', name: 'name', path: 'path', value }],
        },
      }),
    );

    render(<ViewActionDetail name="name" />, { wrapper });

    const change = await screen.findByText(/^cls: cls/);
    expect(change.textContent).toBe(
      `cls: cls, name: name, path: path, ${expected}`,
    );
  });
});
