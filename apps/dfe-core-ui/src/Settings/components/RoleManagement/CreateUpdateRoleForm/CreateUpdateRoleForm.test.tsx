import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateUpdateRoleForm } from '.';

// The permission picker reads the scope list, and the name rule does not.
vi.mock('@/Settings/components/RoleManagement/RoleScopeSelect', () => ({
  RoleScopeSelect: () => null,
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateUpdateRoleForm name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(
        <CreateUpdateRoleForm
          name="create-role"
          onFinish={vi.fn()}
          error={null}
          isPending={false}
        />,
        { wrapper },
      );

      await expectNameRule({
        input: screen.getByPlaceholderText('Enter name'),
        message: STORE_NAME_VALIDATOR.message('Name'),
        accepts: ['soc.analyst-1', 'soc_analyst', 'a'.repeat(128)],
        refuses: ['-soc', '.soc', 'soc analyst', 'a'.repeat(129)],
      });
    },
  );

  test('saves a role whose locked name the create endpoint would refuse', async () => {
    const onFinish = vi.fn();
    render(
      <CreateUpdateRoleForm
        name="update-role"
        onFinish={onFinish}
        error={null}
        isPending={false}
        disabledFields={{ name: true }}
        initialValues={{
          name: '_legacy role',
          description: 'Imported role',
          permissions: ['rules:read'],
          scoped: false,
        }}
        buttonLabel="Update Role"
      />,
      { wrapper },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Update Role' }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(
      screen.queryByText(STORE_NAME_VALIDATOR.message('Name')),
    ).not.toBeInTheDocument();
  });
});
