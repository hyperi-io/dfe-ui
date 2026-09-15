import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { CreateUpdateRuleForm } from '.';
import { server } from './CreateUpdateRuleForm.mocks';

// Ace needs a real browser, and the SQL under test comes from the initial values.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderForm = () =>
  render(
    <CreateUpdateRuleForm
      onFinish={vi.fn()}
      isPending={false}
      error={null}
      hideAdvancedSettings
      initialValues={{
        name: 'suspicious_logins',
        display_name: 'Suspicious logins',
        user_sql: 'SELECT * WHERE 1',
        severity: 'high',
      }}
    />,
    { wrapper },
  );

describe('CreateUpdateRuleForm validation', () => {
  test('shows the message and the suggestion without a second click', async () => {
    server.use(
      API_CONFIG_MOCKS.rules.validate.post.success({
        mockedResponse: {
          valid: false,
          errors: [
            {
              message: 'SQL must contain a FROM clause.',
              position: null,
              suggestion: "Add 'FROM <table>' to specify the data source.",
            },
          ],
        },
      }),
    );

    renderForm();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Validate' }),
    );

    expect(
      await screen.findByText('SQL must contain a FROM clause.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add 'FROM <table>' to specify the data source."),
    ).toBeInTheDocument();
  });

  test('leaves no unlabelled affordance holding the message', async () => {
    server.use(
      API_CONFIG_MOCKS.rules.validate.post.success({
        mockedResponse: {
          valid: false,
          errors: [{ message: 'SQL must contain a FROM clause.' }],
        },
      }),
    );

    renderForm();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Validate' }),
    );
    await screen.findByText('SQL must contain a FROM clause.');

    const unlabelled = screen
      .getAllByRole('button')
      .filter((button) => button.textContent === '');
    expect(unlabelled).toHaveLength(0);
  });

  test('says nothing when the SQL passes', async () => {
    server.use(
      API_CONFIG_MOCKS.rules.validate.post.success({
        mockedResponse: { valid: true, errors: [] },
      }),
    );

    renderForm();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Validate' }),
    );

    expect(await screen.findByRole('button', { name: /Valid/ })).toBeVisible();
    expect(screen.queryByText('SQL validation failed')).not.toBeInTheDocument();
  });
});
