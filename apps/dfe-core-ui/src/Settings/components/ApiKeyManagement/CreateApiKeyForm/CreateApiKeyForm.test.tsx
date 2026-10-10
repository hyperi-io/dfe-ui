import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import { describe, test, vi } from 'vitest';
import { CreateApiKeyForm } from '.';

// The group picker reads the groups list, and the name rule does not.
vi.mock('@/Settings/components/GroupManagement/GroupRoleSelect', () => ({
  GroupRoleSelect: () => null,
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateApiKeyForm name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CreateApiKeyForm />, { wrapper });

      await expectNameRule({
        input: screen.getByLabelText(/^Name/),
        message: STORE_NAME_VALIDATOR.message('Name'),
        accepts: ['ci-deploy.1', 'a'.repeat(128)],
        refuses: ['-ci', 'ci deploy', 'a'.repeat(129)],
      });
    },
  );
});
