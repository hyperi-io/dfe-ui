import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import {
  GITOPS_NAME_VALIDATOR,
  LIBRARY_TOKEN_VALIDATOR,
} from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, test } from 'vitest';
import { CreateArtifactDrawer } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const openDrawer = async () => {
  server.use(API_CONFIG_MOCKS.library.kinds.get.success());
  render(<CreateArtifactDrawer />, { wrapper });
  await userEvent.click(
    await screen.findByRole('button', { name: /New artefact/ }),
  );
};

describe('CreateArtifactDrawer', () => {
  test(
    'name takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      await openDrawer();

      await expectNameRule({
        input: await screen.findByLabelText(/^Name/),
        message: GITOPS_NAME_VALIDATOR.message('Name'),
        accepts: ['syslog.parse-1', 'a'.repeat(300)],
        refuses: ['syslog parse', 'syslog..parse'],
      });
    },
  );

  test(
    'group takes the groups the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      await openDrawer();

      await expectNameRule({
        input: await screen.findByLabelText(/^Group/),
        message: LIBRARY_TOKEN_VALIDATOR.message('Group'),
        accepts: ['network/edge', ''],
        refuses: ['-network', 'net work'],
      });
    },
  );
});
