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
vi.mock('./RuleSelectCreate', () => ({ RuleSelect: () => null }));
vi.mock('@/Hunts/components/CRONBuilderDrawer', () => ({
  CRONBuilderDrawer: ({ value }: { value?: string }) => (
    <input readOnly aria-label="Cron expression" value={value ?? ''} />
  ),
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
          cron: ['*/15 * * * *'],
          log_buffer: 60,
          global_source_table_name: 'windows_audit',
          enabled: true,
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

describe('CreateUpdateHuntForm cron expressions', () => {
  const stored = {
    name: 'multi',
    customers: ['acme'],
    rules: ['brute_force'],
    cron: ['0 * * * *', '0 0 * * *'],
    log_buffer: 60,
    global_source_table_name: 'windows_audit',
    enabled: true,
  };
  const renderForm = (onFinish = vi.fn()) =>
    render(
      <CreateUpdateHuntForm
        onFinish={onFinish}
        isPending={false}
        error={null}
        disabledFields={{ name: true }}
        initialValues={stored}
      />,
      { wrapper },
    );

  test('shows every stored expression', () => {
    renderForm();

    expect(
      screen
        .getAllByLabelText('Cron expression')
        .map((input) => (input as HTMLInputElement).value),
    ).toEqual(['0 * * * *', '0 0 * * *']);
  });

  test('saves the list without an expression the user removed', async () => {
    const onFinish = vi.fn();
    renderForm(onFinish);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove cron expression 1' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save Hunt' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish.mock.calls[0]?.[0].cron).toEqual(['0 0 * * *']);
  });

  test('keeps the last expression and refuses a new blank one', async () => {
    const onFinish = vi.fn();
    renderForm(onFinish);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove cron expression 1' }),
    );
    expect(
      screen.getByRole('button', { name: 'Remove cron expression 1' }),
    ).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Add cron expression' }),
    );
    expect(screen.getAllByLabelText('Cron expression')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'Save Hunt' }));

    expect(await screen.findByText('Cron is required')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });
});

describe('CreateUpdateHuntForm enabled', () => {
  const stored = {
    name: 'windows_audit',
    customers: ['acme'],
    rules: ['brute_force'],
    cron: ['*/15 * * * *'],
    log_buffer: 60,
    global_source_table_name: 'windows_audit',
    enabled: true,
  };

  test.each([
    { case: 'left on', clicks: 0, saved: true },
    { case: 'turned off', clicks: 1, saved: false },
    { case: 'turned off then on', clicks: 2, saved: true },
  ])(
    'saves enabled as the switch holds it, $case',
    async ({ clicks, saved }) => {
      const onFinish = vi.fn();
      render(
        <CreateUpdateHuntForm
          onFinish={onFinish}
          isPending={false}
          error={null}
          disabledFields={{ name: true }}
          initialValues={stored}
        />,
        { wrapper },
      );
      const toggle = screen.getByRole('switch', { name: 'Enabled' });
      expect(toggle).toBeChecked();

      for (let i = 0; i < clicks; i++) {
        await userEvent.click(toggle);
      }
      await userEvent.click(screen.getByRole('button', { name: 'Save Hunt' }));

      await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
      expect(onFinish.mock.calls[0]?.[0].enabled).toBe(saved);
    },
  );
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
            title: 'Error',
            code: UNKNOWN_ORG_CODE,
            detail: refusal,
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
            title: 'Error',
            code: 'conflict',
            detail: "Hunt 'brute_force' already exists",
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

describe('CreateUpdateHuntForm runner stop', () => {
  const stored = {
    name: 'stopped',
    customers: ['acme'],
    rules: ['brute_force'],
    cron: ['0 * * * *'],
    log_buffer: 60,
    global_source_table_name: 'windows_audit',
    enabled: true,
  };
  const renderForm = ({
    autoDisabled,
    onFinish = vi.fn(),
  }: {
    autoDisabled?: { at: number; reason: string } | null;
    onFinish?: () => void;
  }) =>
    render(
      <CreateUpdateHuntForm
        onFinish={onFinish}
        isPending={false}
        error={null}
        disabledFields={{ name: true }}
        initialValues={stored}
        autoDisabled={autoDisabled}
      />,
      { wrapper },
    );

  test.each([
    {
      case: 'with a reason',
      reason: 'resource_limit:241',
      copy: /^The runner stopped this hunt on .+ after repeated ClickHouse resource-limit failures \(resource_limit:241\)\.$/,
    },
    {
      case: 'without a reason',
      reason: '',
      copy: /^The runner stopped this hunt on .+ after repeated ClickHouse resource-limit failures\.$/,
    },
  ])(
    'says when and why the runner stopped the hunt $case',
    ({ reason, copy }) => {
      renderForm({ autoDisabled: { at: 1_763_300_000, reason } });

      expect(screen.getByText(copy)).toBeInTheDocument();
      expect(
        screen.getByText(
          'Saving leaves it stopped. Use Re-enable Hunt in the actions menu to start it again.',
        ),
      ).toBeInTheDocument();
    },
  );

  test.each([
    {
      case: 'stopped by the runner',
      autoDisabled: { at: 1_763_300_000, reason: 'resource_limit:241' },
      shown:
        'On in the saved configuration, but the runner has stopped it. Re-enable Hunt in the actions menu starts it again.',
      hidden: 'A disabled hunt keeps its configuration and fires nothing.',
    },
    {
      case: 'not stopped',
      autoDisabled: null,
      shown: 'A disabled hunt keeps its configuration and fires nothing.',
      hidden:
        'On in the saved configuration, but the runner has stopped it. Re-enable Hunt in the actions menu starts it again.',
    },
  ])(
    'describes the Enabled switch for a hunt $case',
    ({ autoDisabled, shown, hidden }) => {
      renderForm({ autoDisabled });

      expect(screen.getByText(shown)).toBeInTheDocument();
      expect(screen.queryByText(hidden)).toBeNull();
    },
  );

  test.each([
    { case: 'is not passed', autoDisabled: undefined },
    { case: 'is null', autoDisabled: null },
  ])('shows no stop notice when autoDisabled $case', ({ autoDisabled }) => {
    renderForm({ autoDisabled });

    expect(screen.queryByText(/The runner stopped this hunt/)).toBeNull();
  });

  test('leaves the Enabled switch as the stored value and still toggles it', async () => {
    const onFinish = vi.fn();
    renderForm({
      autoDisabled: { at: 1_763_300_000, reason: 'resource_limit:241' },
      onFinish,
    });
    const toggle = screen.getByRole('switch', { name: 'Enabled' });

    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await userEvent.click(screen.getByRole('button', { name: 'Save Hunt' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(onFinish.mock.calls[0]?.[0].enabled).toBe(false);
  });
});
