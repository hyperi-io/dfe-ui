import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { GITOPS_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, test } from 'vitest';
import { CreatePolicyDrawer } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreatePolicyDrawer name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CreatePolicyDrawer />, { wrapper });
      await userEvent.click(
        await screen.findByRole('button', { name: /Add Policy/ }),
      );

      await expectNameRule({
        input: await screen.findByLabelText(/^Name/),
        message: GITOPS_NAME_VALIDATOR.message('Name'),
        accepts: ['protect.prod-1', 'a'.repeat(300)],
        refuses: ['protect prod', 'protect..prod'],
      });
    },
  );
});
