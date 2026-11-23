import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateRuleForm } from '.';
import { CreateUpdateRuleFormData } from './schema';

// Ace's beautify extension reads a global that only the app shell sets.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const initialValues: CreateUpdateRuleFormData = {
  name: 'suspicious_logins',
  display_name: 'Suspicious logins',
  description: 'Repeated failed logins',
  cel_filter: 'event.action == "login"',
  severity: 'high',
  source_type: 'raw',
};

const renderForm = (onFinish = vi.fn()) =>
  render(
    <CreateUpdateRuleForm
      onFinish={onFinish}
      isPending={false}
      error={null}
      initialValues={initialValues}
    />,
    { wrapper },
  );

describe('CreateUpdateRuleForm', () => {
  test('saves the rule with its match criteria', async () => {
    const onFinish = vi.fn();
    renderForm(onFinish);

    expect(
      screen.getByRole('radio', { name: 'Conditions' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'CEL Fast expression' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'SQL' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter field')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save Rule' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'suspicious_logins',
        display_name: 'Suspicious logins',
        description: 'Repeated failed logins',
        severity: 'high',
      }),
    );
  });
});

describe('CreateUpdateRuleForm name', () => {
  test(
    'takes the names the create endpoint takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      renderForm();

      await expectNameRule({
        input: screen.getByLabelText(/^Name/),
        message: RULE_HUNT_NAME_VALIDATOR.message('Name'),
        accepts: ['brute-force_1', '-leading', 'A'.repeat(128)],
        refuses: ['brute.force', '.leading', 'brute force', 'A'.repeat(129)],
      });
    },
  );

  test('saves a rule whose locked name the create endpoint would refuse', async () => {
    const onFinish = vi.fn();
    render(
      <CreateUpdateRuleForm
        onFinish={onFinish}
        isPending={false}
        error={null}
        disabledFields={{ name: true }}
        initialValues={{
          ...initialValues,
          name: 'imported.rule',
        }}
      />,
      { wrapper },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save Rule' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByText(RULE_HUNT_NAME_VALIDATOR.message('Name')),
    ).not.toBeInTheDocument();
  });
});
