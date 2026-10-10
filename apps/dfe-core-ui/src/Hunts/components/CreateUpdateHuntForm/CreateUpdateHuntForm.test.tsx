import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import { describe, test, vi } from 'vitest';
import { CreateUpdateHuntForm } from '.';

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
        message: RULE_HUNT_NAME_VALIDATOR.message('Identifier'),
        accepts: ['Windows-Audit_1', 'a'.repeat(300)],
        refuses: ['windows.audit', 'windows audit'],
      });
    },
  );
});
