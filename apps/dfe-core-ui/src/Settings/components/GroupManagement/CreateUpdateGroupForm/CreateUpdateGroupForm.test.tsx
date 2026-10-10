import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import { describe, test, vi } from 'vitest';
import { CreateUpdateGroupForm } from '.';

// The pickers read roles, organisations and accounts, and the name rule needs none of them.
vi.mock('@/core/components/OrganisationSelect', () => ({
  OrganisationSelect: () => null,
}));
vi.mock('@/Settings/components/GroupManagement/GroupRoleSelect', () => ({
  GroupRoleSelect: () => null,
}));
vi.mock('@/Settings/components/GroupManagement/GroupMemberSelect', () => ({
  GroupMemberSelect: () => null,
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateUpdateGroupForm name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(
        <CreateUpdateGroupForm
          name="create-group"
          onFinish={vi.fn()}
          error={null}
          isPending={false}
        />,
        { wrapper },
      );

      await expectNameRule({
        input: screen.getByPlaceholderText('Enter name'),
        message: STORE_NAME_VALIDATOR.message('Name'),
        accepts: ['okta.prod-1', 'a'.repeat(128)],
        refuses: ['-soc', 'soc analysts', 'a'.repeat(129)],
      });
    },
  );
});
