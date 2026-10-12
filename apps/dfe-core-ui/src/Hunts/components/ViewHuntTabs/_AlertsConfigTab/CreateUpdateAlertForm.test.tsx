import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { DESTINATION_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import { describe, test, vi } from 'vitest';
import { CreateUpdateAlertForm } from './CreateUpdateAlertForm';

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateUpdateAlertForm name', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<CreateUpdateAlertForm onFinish={vi.fn()} />, { wrapper });

      await expectNameRule({
        input: screen.getByLabelText(/^Name/),
        message: DESTINATION_NAME_VALIDATOR.message('Name'),
        accepts: ['slack dfe-alerts', '.hidden'],
        refuses: ['..', 'a/b', 'a\\b'],
        badBaseline: '/',
      });
    },
  );
});
