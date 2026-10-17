import { ApiError } from '@/core/config/api/client';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateHuntForm, UNKNOWN_ORG_CODE } from '.';

// The pickers read organisations, sources and rules, and the name rule needs none of them.
vi.mock('@/core/components/OrganisationSelect', () => ({
  OrganisationSelect: () => null,
}));
vi.mock('@/core/components/SourceSelect', () => ({
  SourceSelect: () => null,
}));
vi.mock('./RuleSelect', () => ({ RuleSelect: () => null }));
vi.mock('@/Hunts/components/CRONBuilderDrawer', () => ({
  CRONBuilderDrawer: () => null,
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateUpdateHuntForm name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(
        <CreateUpdateHuntForm
          onFinish={vi.fn()}
          isPending={false}
          error={null}
        />,
        { wrapper },
      );

      await expectNameRule({
        input: screen.getByLabelText(/^Name/),
        message: RULE_HUNT_NAME_VALIDATOR.message('Name'),
        accepts: ['Windows-Audit_1', '-leading', 'a'.repeat(128)],
        refuses: ['windows.audit', '.leading', 'a'.repeat(129)],
      });
    },
  );

  test('saves a hunt whose locked name the create endpoint would refuse', async () => {
    const onFinish = vi.fn();
    render(
      <CreateUpdateHuntForm
        onFinish={onFinish}
        isPending={false}
        error={null}
        disabledFields={{ name: true }}
        initialValues={{
          name: 'imported.hunt',
          customers: ['acme'],
          rules: ['brute_force'],
          cron: '*/15 * * * *',
          log_buffer: 60,
          global_source_table_name: 'windows_audit',
        }}
      />,
      { wrapper },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save Hunt' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByText(RULE_HUNT_NAME_VALIDATOR.message('Name')),
    ).not.toBeInTheDocument();
  });
});

describe('CreateUpdateHuntForm refusals', () => {
  const organisationsField = () => {
    const item = screen
      .getByText('Organisations')
      .closest<HTMLElement>('.ant-form-item');
    if (!item) throw new Error('no Organisations form item');
    return item;
  };

  test('shows an unregistered organisation under the organisations it names', async () => {
    const refusal = "Not a registered org: 'gone-co'";
    render(
      <CreateUpdateHuntForm
        onFinish={vi.fn()}
        isPending={false}
        error={
          new ApiError(422, 'Unprocessable Entity', {
            code: UNKNOWN_ORG_CODE,
            message: refusal,
          })
        }
      />,
      { wrapper },
    );

    expect(
      await within(organisationsField()).findByText(refusal),
    ).toBeInTheDocument();
    expect(screen.getAllByText(refusal)).toHaveLength(1);
  });

  test('keeps any other refusal below the form', async () => {
    render(
      <CreateUpdateHuntForm
        onFinish={vi.fn()}
        isPending={false}
        error={
          new ApiError(409, 'Conflict', {
            code: 'conflict',
            message: "Hunt 'brute_force' already exists",
          })
        }
      />,
      { wrapper },
    );

    expect(
      await screen.findByText("Hunt 'brute_force' already exists"),
    ).toBeInTheDocument();
    expect(
      within(organisationsField()).queryByText(/already exists/),
    ).not.toBeInTheDocument();
  });
});
