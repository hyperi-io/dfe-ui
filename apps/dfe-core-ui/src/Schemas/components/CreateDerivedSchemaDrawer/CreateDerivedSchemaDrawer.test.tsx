import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateDerivedSchemaDrawer } from '@/Schemas/components/CreateDerivedSchemaDrawer';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  BASE_SCHEMA_PATH,
  capturedRequests,
  DERIVED_SCHEMA_NAME,
  DERIVED_SCHEMA_PATH,
  resetCapturedRequests,
  server,
} from './CreateDerivedSchemaDrawer.mocks';

/** antd plus the base column table in jsdom outruns the 20s default on this flow. */
const DRAWER_FLOW_TIMEOUT_MS = 90_000;

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetCapturedRequests();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const openDrawer = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole(
      'button',
      { name: 'Add Derived Schema' },
      { timeout: 5000 },
    ),
  );
};

const pickBaseSchema = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByLabelText(/^Base Meta Schema/));
  await user.click(
    await screen.findByTitle(BASE_SCHEMA_PATH, {}, { timeout: 5000 }),
  );
};

const tickColumn = async (
  user: ReturnType<typeof userEvent.setup>,
  columnName: string,
) => {
  await screen.findByText(columnName, {}, { timeout: 5000 });
  await user.click(
    within(
      // The pattern is built from a column name literal this test passes in.
      // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
      screen.getByRole('row', { name: new RegExp(`\\b${columnName}\\b`) }),
    ).getByRole('checkbox'),
  );
};

describe('CreateDerivedSchemaDrawer', () => {
  it(
    'sends the base, the base version and the ordered selection',
    async () => {
      const user = userEvent.setup();
      render(<CreateDerivedSchemaDrawer />, { wrapper });

      await openDrawer(user);

      await user.type(screen.getByLabelText(/^Name/), DERIVED_SCHEMA_NAME);
      await user.type(screen.getByLabelText(/^Description/), 'subset');
      await pickBaseSchema(user);

      await tickColumn(user, 'timestamp');
      await tickColumn(user, 'message');

      // message inherits word_search from the base; asking for fragments is the
      // one thing a derived schema may change.
      const messageIndex = screen.getByLabelText('Index use case for message');
      await waitFor(() => expect(messageIndex).toBeEnabled(), {
        timeout: 5000,
      });
      await user.click(messageIndex);
      await user.click(
        await screen.findByTitle(
          'I search for fragments inside words',
          {},
          { timeout: 5000 },
        ),
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(capturedRequests).toHaveLength(1), {
        timeout: 5000,
      });

      const body = capturedRequests[0];
      expect(body.path).toBe(DERIVED_SCHEMA_PATH);
      expect(body.base).toBe(BASE_SCHEMA_PATH);
      expect(body.base_version).toBe('1.0.0');
      expect(body.current).toBe('1.0.0');
      expect(body.versions['1.0.0'].summary).toBe('subset');
      expect(body.versions['1.0.0'].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(body.versions['1.0.0'].select).toEqual([
        { name: 'timestamp' },
        { name: 'message', index: 'substring_search' },
      ]);
    },
    DRAWER_FLOW_TIMEOUT_MS,
  );

  it(
    'refuses to submit a derived schema with no columns selected',
    async () => {
      const user = userEvent.setup();
      render(<CreateDerivedSchemaDrawer />, { wrapper });

      await openDrawer(user);

      await user.type(screen.getByLabelText(/^Name/), DERIVED_SCHEMA_NAME);
      await user.type(screen.getByLabelText(/^Description/), 'empty');
      await pickBaseSchema(user);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        await screen.findByText(
          'Select at least one column from the base schema',
          {},
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
      expect(capturedRequests).toHaveLength(0);
    },
    DRAWER_FLOW_TIMEOUT_MS,
  );
});
