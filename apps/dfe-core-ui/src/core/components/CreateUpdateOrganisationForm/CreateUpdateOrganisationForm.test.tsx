import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { ORG_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { server } from './CreateUpdateOrganisationForm.mocks';
import { CreateUpdateOrganisationForm } from './index';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreateUpdateOrganisationForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('renders core fields and submits on create without confirm merge gate', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <CreateUpdateOrganisationForm
        initialValues={{
          name: '',
          display_name: '',
          org_ids: [],
        }}
        onFinish={onFinish}
        buttonLabel="Create"
      />,
      { wrapper },
    );

    await user.type(screen.getByPlaceholderText('Enter name'), 'NewOrg');
    await user.type(
      screen.getByPlaceholderText('Enter display name'),
      'New Org',
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'neworg',
        display_name: 'New Org',
      }),
    );
  });

  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(
        <CreateUpdateOrganisationForm
          initialValues={{ name: '', display_name: '', org_ids: [] }}
          onFinish={vi.fn()}
          buttonLabel="Create"
        />,
        { wrapper },
      );

      await expectNameRule({
        input: screen.getByPlaceholderText('Enter name'),
        message: ORG_NAME_VALIDATOR.message('Name'),
        accepts: ['acme-corp.eu', 'a'.repeat(129)],
        refuses: ['-acme', 'acme corp'],
      });
    },
  );
});
